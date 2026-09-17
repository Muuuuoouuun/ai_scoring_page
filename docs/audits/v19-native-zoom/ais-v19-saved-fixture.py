#!/usr/bin/env python3
"""LOCAL SYNTHETIC S05 VISUAL FIXTURE ONLY — not a real user save or preference.

Prepared for root review; not executed or imported by the author.
  python3 /private/tmp/ais-v19-saved-fixture.py preview
  python3 /private/tmp/ais-v19-saved-fixture.py apply
  python3 /private/tmp/ais-v19-saved-fixture.py restore

Only one exact saved row may be inserted/deleted. No UPDATE, API, network,
full database restore, schema change, or original-seven record mutation.
A no-value-change UI save may update only the fixture updated_at timestamp.
Any other fixture column/payload change is held instead of silently deleted. Redirect stdout to a local
receipt file if desired; each receipt contains exact before/after snapshots.
"""
import argparse
import hashlib
import json
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB = Path('/Users/bigmac_moon/dev/ai_score/site/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite')
BACKUP = Path('/private/tmp/ais-v17-local-before-fixture.sqlite')
GUIDES = Path('/Users/bigmac_moon/dev/ai_score/site/data/guides.json')
BACKUP_SHA256 = 'f42b9ee176fef0d1c527b953fe8934d99b6600b5e2ea203140d84532938d07b3'
ORIGINAL_ROWS_SHA256 = 'aacfa05af74bc0b954ed26bd239d719b714c6f42ca15da2545887599003319ac'
OWNER = 'local_seedy'
FIXTURE_ID = 'af6abe79-2a4c-4f1e-9c31-1c847ca01684'
GUIDE_ID = 'notion-task-board'
TARGET = 'guide:' + GUIDE_ID
STAMP = '2026-09-14T00:00:00.000Z'  # Fixed synthetic timestamp, not a claimed real save time.
COLUMNS = ('id', 'user_id', 'kind', 'target', 'payload', 'created_at', 'updated_at')
ORIGINAL_IDS = {
    '26d4b57e-be61-44f6-8d7f-3fe41e5c3d5b',
    '58755f0f-8fd0-4d3d-8472-023eab5e9512',
    '65f065eb-bd78-4083-8086-cd246501547d',
    'a296d354-d73a-489e-a451-3db6f28671e5',
    'ba42d345-7804-47e7-b195-0d9a403176c5',
    'e75d0d94-33e6-43b5-b1ec-5b9c6518bfa0',
    'e7712b67-80e8-463a-8ce3-e08fe69c667c',
}
TITLE_PREFIX = 'V19-LOCAL-QA-저장 콘텐츠 시각 검증용-'
TITLE = TITLE_PREFIX + 'A' * (200 - len(TITLE_PREFIX))
PAYLOAD = {
    'type': 'guide', 'target': GUIDE_ID, 'title': TITLE,
    'reason': '로컬 확대 화면에서 선택 이유 입력을 확인하는 합성 QA입니다.',
    'outcome': '실제 사용 성과가 아닌 저장 콘텐츠 폼 판독용 기록입니다.',
    'note': 'V19 로컬 임시 검증 자료. 실제 사용자 저장 기록 아님.',
}
FIXTURE = {
    'id': FIXTURE_ID, 'user_id': OWNER, 'kind': 'saved', 'target': TARGET,
    'payload': json.dumps(PAYLOAD, ensure_ascii=False, separators=(',', ':')),
    'created_at': STAMP, 'updated_at': STAMP,
}


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def rows_hash(rows):
    return sha(json.dumps(rows, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def inventory(conn):
    conn.row_factory = sqlite3.Row
    return [dict(r) for r in conn.execute('SELECT * FROM private_records ORDER BY id')]


def schema_guard(conn):
    info = list(conn.execute('PRAGMA table_info(private_records)'))
    require(tuple(r['name'] for r in info) == COLUMNS, 'Unexpected private_records columns; refusing.')
    require(all(r['type'].lower() == 'text' for r in info), 'Unexpected private_records column types.')
    require(info[0]['pk'] == 1 and all(r['notnull'] == 1 for r in info if r['name'] != 'target'), 'Unexpected primary key/null constraints.')
    require(not conn.execute("SELECT 1 FROM sqlite_master WHERE type='trigger' AND tbl_name='private_records'").fetchone(), 'Trigger could cause unrelated changes; refusing.')
    require(not list(conn.execute('PRAGMA foreign_key_list(private_records)')), 'Unexpected foreign key; refusing.')
    indexes = {r['name']: r for r in conn.execute('PRAGMA index_list(private_records)')}
    require('private_owner_target' in indexes and indexes['private_owner_target']['unique'] == 1, 'Missing owner/kind/target uniqueness.')
    target_columns = tuple(r['name'] for r in conn.execute('PRAGMA index_info(private_owner_target)'))
    require(target_columns == ('user_id', 'kind', 'target'), 'Unexpected unique target index columns.')


def frozen_read(path, expected_file_hash=None):
    require(path.is_file() and not path.is_symlink(), 'Expected existing regular database, no creation/symlink.')
    sidecars = [Path(str(path) + suffix) for suffix in ('-wal', '-journal')]
    require(not any(p.exists() for p in sidecars), 'WAL/journal exists; immutable preview cannot ignore it.')
    before_hash = sha(path.read_bytes())
    if expected_file_hash:
        require(before_hash == expected_file_hash, 'Preserved backup hash changed.')
    conn = sqlite3.connect(path.as_uri() + '?mode=ro&immutable=1', uri=True)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute('PRAGMA query_only=ON')
        schema_guard(conn)
        rows = inventory(conn)
    finally:
        conn.close()
    require(not any(p.exists() for p in sidecars), 'WAL/journal appeared during immutable read.')
    require(sha(path.read_bytes()) == before_hash, 'Database changed during preview; retry after local writes finish.')
    return rows


def classify(rows, original, expanded):
    if rows == original:
        return 'original-seven'
    if len(rows) == 8 and [r for r in rows if r['id'] in ORIGINAL_IDS] == original:
        added = [r for r in rows if r['id'] not in ORIGINAL_IDS]
        if len(added) == 1:
            fixture = added[0]
            comparable = {**fixture, 'updated_at': STAMP}
            stamp = fixture.get('updated_at', '')
            if comparable == FIXTURE and re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z', stamp):
                parsed = datetime.fromisoformat(stamp.replace('Z', '+00:00'))
                if stamp >= STAMP and parsed.timestamp() <= datetime.now(timezone.utc).timestamp() + 300:
                    return 'original-seven-plus-saved-fixture-timestamp-only'
    raise RuntimeError('Only the exact QA saved row may differ by updated_at after a no-value-change UI save. Original seven and every other added-row column/payload must match. Refusing insert/delete; no force mode.')


def receipt(mode, before, after, original, committed):
    before_original = [r for r in before if r['id'] in ORIGINAL_IDS]
    after_original = [r for r in after if r['id'] in ORIGINAL_IDS]
    return {
        'purpose': 'LOCAL SYNTHETIC S05 UI ONLY; not actual user activity',
        'mode': mode, 'database': str(DB), 'backup': str(BACKUP),
        'fixture_id': FIXTURE_ID, 'target': TARGET, 'payload_target': GUIDE_ID,
        'title_characters': len(TITLE), 'synthetic_timestamp': STAMP,
        'committed': committed, 'before_count': len(before), 'after_count': len(after),
        'before_snapshot_sha256': rows_hash(before), 'after_snapshot_sha256': rows_hash(after),
        'original_seven_before_sha256': rows_hash(before_original),
        'original_seven_after_sha256': rows_hash(after_original),
        'original_seven_exactly_preserved': before_original == original == after_original,
        'before_snapshot': before, 'after_snapshot': after,
        'allowed_mutation': 'INSERT or exact-current-row DELETE of fixture_id only; no UPDATE or full DB restore',
        'allowed_ui_change': 'updated_at only after no-value-change save; payload and all other columns must remain exact',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=('preview', 'apply', 'restore'))
    mode = parser.parse_args().mode
    require(DB.is_file() and not DB.is_symlink(), 'Expected existing local database; no create/symlink.')
    require(DB.resolve() != BACKUP.resolve(), 'Live and backup paths must differ.')
    require(len(TITLE) == 200 and TITLE.startswith(TITLE_PREFIX), 'Wrong synthetic title.')
    require(all(isinstance(PAYLOAD[k], str) and len(PAYLOAD[k]) <= limit for k, limit in [('target', 1000), ('title', 200), ('reason', 1000), ('outcome', 2000), ('note', 2000)]), 'Payload violates savedSchema string limits.')
    guides = json.loads(GUIDES.read_text())
    require(sum(g.get('id') == GUIDE_ID for g in guides) == 1, 'Known guide target missing/ambiguous.')
    original = frozen_read(BACKUP, BACKUP_SHA256)
    require(len(original) == 7 and {r['id'] for r in original} == ORIGINAL_IDS, 'Backup has unexpected IDs/count.')
    require(all(r['user_id'] == OWNER and r['kind'] != 'saved' for r in original), 'Wrong owner or saved already exists in baseline.')
    require(rows_hash(original) == ORIGINAL_ROWS_SHA256, 'Exact original seven-row all-column hash changed.')
    require(FIXTURE_ID not in ORIGINAL_IDS, 'Fixture ID collides with original.')
    expanded = sorted([*original, FIXTURE], key=lambda r: r['id'])
    if mode == 'preview':
        current = frozen_read(DB)
        state = classify(current, original, expanded)
        result = receipt(mode, current, current, original, False)
        result['state'] = state
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    target = expanded if mode == 'apply' else original
    conn = sqlite3.connect(DB.as_uri() + '?mode=rw', uri=True, timeout=5, isolation_level=None)
    conn.row_factory = sqlite3.Row
    committed = False
    try:
        conn.execute('PRAGMA foreign_keys=ON')
        conn.execute('BEGIN IMMEDIATE')
        schema_guard(conn)
        before = inventory(conn)
        state = classify(before, original, expanded)
        should_change = (mode == 'apply' and state == 'original-seven') or (mode == 'restore' and state != 'original-seven')
        if should_change:
            changes_before = conn.total_changes
            if mode == 'apply':
                cur = conn.execute(
                    'INSERT INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) VALUES(?,?,?,?,?,?,?)',
                    tuple(FIXTURE[c] for c in COLUMNS),
                )
            else:
                observed_fixture = next(r for r in before if r['id'] == FIXTURE_ID)
                cur = conn.execute(
                    'DELETE FROM private_records WHERE id=? AND user_id=? AND kind=? AND target IS ? AND payload=? AND created_at=? AND updated_at=?',
                    tuple(observed_fixture[c] for c in COLUMNS),
                )
            require(cur.rowcount == 1 and conn.total_changes - changes_before == 1, 'Expected exactly one changed fixture row.')
            after = inventory(conn)
            require(after == target, 'Post-mutation exact snapshot differs; rolling back.')
            require([r for r in after if r['id'] in ORIGINAL_IDS] == original, 'Original seven changed; rolling back.')
            result = receipt(mode, before, after, original, True)
            conn.execute('COMMIT')
            committed = True
        else:
            after = before
            result = receipt(mode, before, after, original, False)
            conn.execute('ROLLBACK')  # Idempotent safe no-op.
    except BaseException:
        if conn.in_transaction:
            conn.execute('ROLLBACK')
        raise
    finally:
        conn.close()
    require(result['committed'] == committed, 'Receipt commit mismatch.')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
