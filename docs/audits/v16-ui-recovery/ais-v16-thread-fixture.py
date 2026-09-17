#!/usr/bin/env python3
"""Synthetic LOCAL QA fixture for gate 7.2.4; never calls an app/API/provider.

Only `status` is read-only. Root must make a consistent SQLite backup before
explicitly running apply/hide-parent/delete-parent/restore-parent/cleanup.
The two fixed UUIDs and complete seed snapshots are the ownership boundary.
"""
import argparse
import json
import sqlite3
import sys
from pathlib import Path

DB_PATH = Path('/Users/bigmac_moon/dev/ai_score/site/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite')
PARENT_ID = 'b436a927-add7-4ea7-91a8-60f0100e8e36'
REPLY_ID = '749611c4-a910-43d2-85f1-14acd84be9d2'
IDS = (PARENT_ID, REPLY_ID)
CREATED_AT = '2026-09-12T15:32:55.584Z'
HIDDEN_AT = '2026-09-12T15:32:56.584Z'
COLUMNS = ('id', 'user_id', 'author', 'kind', 'tool_id', 'parent_id',
           'title', 'body', 'task', 'plan', 'used_at', 'affiliation',
           'ratings', 'status', 'created_at', 'updated_at')

PARENT = dict(zip(COLUMNS, (
    PARENT_ID, 'ais-v16-fixture-parent', '합성 로컬 QA 작성자 A',
    'question', None, None,
    '[합성 로컬 QA · V16] 부모 A와 다른 작성자의 답글 보존 확인',
    '실제 사용자 질문이 아닌 합성 로컬 QA 데이터입니다. 작성자 A의 user_id는 '
    'ais-v16-fixture-parent입니다. 이 부모 글이 숨김 또는 삭제 상태가 된 뒤에도 '
    '다른 user_id의 작성자 B가 남긴 답글을 읽을 수 있는지 관찰합니다. '
    '실사용자 연구, 실제 계정 인증, 운영 데이터가 아닙니다.',
    '', '', None, 'none', None, 'published', CREATED_AT, CREATED_AT,
)))
REPLY = dict(zip(COLUMNS, (
    REPLY_ID, 'ais-v16-fixture-reply', '합성 로컬 QA 작성자 B',
    'reply', None, PARENT_ID,
    '[합성 로컬 QA · V16] 다른 user_id 작성자 B의 보존 대상 답글',
    '실제 사용자 답변이 아닌 합성 로컬 QA 데이터입니다. 작성자 B의 user_id는 '
    'ais-v16-fixture-reply이며 부모 작성자 A와 다릅니다. 부모 글의 내용이 보이지 '
    '않더라도 이 문장과 작성자 B 표시가 읽히는지 확인합니다. '
    '기대 관찰 표식: V16-REPLY-B-REMAINS-READABLE. '
    '이는 실제 두 로그인 세션이나 실사용자 성과를 증명하지 않습니다.',
    '', '', None, 'none', None, 'published', CREATED_AT, CREATED_AT,
)))


class Refuse(RuntimeError):
    pass


def require(condition, message):
    if not condition:
        raise Refuse(message)


def parent_variants():
    hidden = dict(PARENT, status='hidden', updated_at=HIDDEN_AT)
    return [PARENT, hidden,
            dict(PARENT, status='deleted', title='삭제된 글', body='', ratings=None),
            dict(hidden, status='deleted', title='삭제된 글', body='', ratings=None)]


def inspect_schema(conn):
    columns = conn.execute('PRAGMA table_info(posts)').fetchall()
    require(tuple(r['name'] for r in columns) == COLUMNS,
            'posts schema differs from the inspected 16-column schema; no writes.')
    require([r['name'] for r in columns if r['pk']] == ['id'],
            'posts primary key changed; no writes.')
    require(not conn.execute('PRAGMA foreign_key_list(posts)').fetchall(),
            'posts foreign keys changed; review effects before writes.')
    require(not conn.execute("SELECT name FROM sqlite_master WHERE type='trigger' AND tbl_name='posts'").fetchall(),
            'posts has a trigger; review its effects before writes.')
    for table, key in [('reactions', 'post_id'), ('reports', 'target_id')]:
        names = {r['name'] for r in conn.execute('PRAGMA table_info(' + table + ')')}
        require(key in names, table + ' reference schema changed; no writes.')


def current_rows(conn):
    return {r['id']: dict(r) for r in conn.execute(
        'SELECT * FROM posts WHERE id IN (?,?)', IDS)}


def assert_owned(rows, allow_missing=False):
    if not allow_missing:
        require(set(rows) == set(IDS), 'Both seed rows must exist; run status.')
    if PARENT_ID in rows:
        require(rows[PARENT_ID] in parent_variants(),
                'Parent UUID is occupied by an unexpected/edited row; no writes.')
    if REPLY_ID in rows:
        require(rows[REPLY_ID] == REPLY,
                'Reply UUID is occupied by an unexpected/edited row; no writes.')


def assert_no_other_references(conn):
    extra = conn.execute(
        'SELECT COUNT(*) FROM posts WHERE parent_id IN (?,?) AND id NOT IN (?,?)',
        IDS + IDS).fetchone()[0]
    reactions = conn.execute(
        'SELECT COUNT(*) FROM reactions WHERE post_id IN (?,?)', IDS).fetchone()[0]
    reports = conn.execute(
        'SELECT COUNT(*) FROM reports WHERE target_id IN (?,?)', IDS).fetchone()[0]
    require(not (extra or reactions or reports),
            'Other replies/reactions/reports reference these UUIDs; no cascading cleanup or writes.')


def insert_seed(conn, seed):
    # Deliberately plain INSERT: never REPLACE, UPSERT, or INSERT OR IGNORE.
    result = conn.execute('INSERT INTO posts (' + ','.join(COLUMNS) +
                          ') VALUES (' + ','.join('?' for _ in COLUMNS) + ')',
                          tuple(seed[k] for k in COLUMNS))
    require(result.rowcount == 1, 'Seed INSERT did not create exactly one row.')


def run_mutation(conn, action):
    conn.execute('BEGIN IMMEDIATE')
    try:
        inspect_schema(conn)
        before = current_rows(conn)
        if action == 'apply':
            require(not before, 'UUID collision: apply requires BOTH IDs absent; no existing row is replaced.')
            assert_no_other_references(conn)
            insert_seed(conn, PARENT)
            insert_seed(conn, REPLY)
            require(current_rows(conn) == {PARENT_ID: PARENT, REPLY_ID: REPLY},
                    'Inserted fixture does not exactly match its seed.')
        elif action == 'cleanup':
            assert_owned(before, allow_missing=True)
            assert_no_other_references(conn)
            # Remove only known seed rows. Never touch related rows from others.
            for seed in (REPLY, PARENT):
                if seed['id'] in before:
                    result = conn.execute('DELETE FROM posts WHERE id=? AND user_id=?',
                                          (seed['id'], seed['user_id']))
                    require(result.rowcount == 1, 'Cleanup row count mismatch.')
            require(not current_rows(conn), 'Cleanup left a seed row behind.')
        else:
            assert_owned(before)
            assert_no_other_references(conn)
            if action == 'hide-parent':
                require(before[PARENT_ID]['status'] == 'published',
                        'hide-parent requires published parent; restore first.')
                result = conn.execute(
                    "UPDATE posts SET status='hidden',updated_at=? WHERE id=? AND user_id=?",
                    (HIDDEN_AT, PARENT_ID, PARENT['user_id']))
            elif action == 'delete-parent':
                require(before[PARENT_ID]['status'] in ('published', 'hidden'),
                        'Parent is already deleted; no new transition.')
                # Match community DELETE's soft-deletion fields. Do not DELETE A.
                result = conn.execute(
                    "UPDATE posts SET status='deleted',body='',title='삭제된 글',ratings=NULL WHERE id=? AND user_id=?",
                    (PARENT_ID, PARENT['user_id']))
            elif action == 'restore-parent':
                require(before[PARENT_ID]['status'] in ('hidden', 'deleted'),
                        'restore-parent requires hidden/deleted synthetic parent.')
                # Fixture-only reconstruction of our seed, NOT a product restore API.
                result = conn.execute(
                    'UPDATE posts SET status=?,title=?,body=?,ratings=?,updated_at=? WHERE id=? AND user_id=?',
                    (PARENT['status'], PARENT['title'], PARENT['body'], PARENT['ratings'],
                     PARENT['updated_at'], PARENT_ID, PARENT['user_id']))
            else:
                raise Refuse('Unknown mutation action.')
            require(result.rowcount == 1, 'Expected exactly one parent update.')
            after = current_rows(conn)
            assert_owned(after)
            require(after[REPLY_ID] == before[REPLY_ID] == REPLY,
                    'Reply changed during parent transition; rolling back.')
        conn.commit()
    except BaseException:
        conn.rollback()
        raise


def summary(conn):
    rows = current_rows(conn)
    expected = True
    try:
        assert_owned(rows, allow_missing=True)
    except Refuse:
        expected = False
    return {
        'scope': 'synthetic-local-QA; direct fixture, not API or authenticated-user evidence',
        'parentId': PARENT_ID,
        'replyId': REPLY_ID,
        'threadPath': '/community/' + PARENT_ID,
        'presentSeedIds': sorted(rows),
        'onlyExpectedSeedRows': expected,
        'parentState': rows.get(PARENT_ID, {}).get('status'),
        'replyUnchangedAndPublished': rows.get(REPLY_ID) == REPLY if REPLY_ID in rows else None,
        'distinctSeedUserIds': PARENT['user_id'] != REPLY['user_id'],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['status', 'apply', 'hide-parent',
                                         'delete-parent', 'restore-parent', 'cleanup'])
    args = parser.parse_args()
    require(DB_PATH.is_file(), 'Expected existing local SQLite file is missing; never create a new DB.')
    require(DB_PATH.resolve() == DB_PATH, 'Database path contains a symlink; no writes.')
    # URI mode=rw cannot create a database. status never opens a writable connection.
    mode = 'ro' if args.action == 'status' else 'rw'
    conn = sqlite3.connect(DB_PATH.as_uri() + '?mode=' + mode, uri=True,
                           timeout=5, isolation_level=None)
    conn.row_factory = sqlite3.Row
    try:
        inspect_schema(conn)
        if args.action != 'status':
            run_mutation(conn, args.action)
        print(json.dumps({'action': args.action, **summary(conn)}, ensure_ascii=False, indent=2))
    finally:
        conn.close()


if __name__ == '__main__':
    try:
        main()
    except (Refuse, sqlite3.Error) as exc:
        print('REFUSED: ' + str(exc), file=sys.stderr)
        sys.exit(2)
