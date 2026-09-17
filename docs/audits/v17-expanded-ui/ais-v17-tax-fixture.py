#!/usr/bin/env python3
"""LOCAL SYNTHETIC UI FIXTURE ONLY — not real financial/user evidence.

Prepared without execution. Root must inspect before running:
  python3 /private/tmp/ais-v17-tax-fixture.py preview
  python3 /private/tmp/ais-v17-tax-fixture.py apply
  python3 /private/tmp/ais-v17-tax-fixture.py restore

Only two existing local_seedy private_records.payload values may change.
The backup is read-only and never overwritten. Capture stdout if a durable
execution receipt is wanted. No provider/API/network calls, no new records,
no timestamps/revisions updated, no full-database restore.
"""
import argparse
import copy
import hashlib
import json
import re
import sqlite3
from pathlib import Path


DB = Path('/Users/bigmac_moon/dev/ai_score/site/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite')
BACKUP = Path('/private/tmp/ais-v17-local-before-fixture.sqlite')
BACKUP_SHA256 = 'f42b9ee176fef0d1c527b953fe8934d99b6600b5e2ea203140d84532938d07b3'
USER = 'local_seedy'
SUB = 'a296d354-d73a-489e-a451-3db6f28671e5'
TERMS = 'e7712b67-80e8-463a-8ce3-e08fe69c667c'
OBSERVED = '50dfcb72-d89f-408f-8094-e91253e545d4'
FUTURE = 'e74d1ba6-c66d-4c03-b3f4-9de8801983d3'
EXPECTED_IDS = {
    SUB, TERMS, 'e75d0d94-33e6-43b5-b1ec-5b9c6518bfa0',
    '26d4b57e-be61-44f6-8d7f-3fe41e5c3d5b',
    '58755f0f-8fd0-4d3d-8472-023eab5e9512',
    '65f065eb-bd78-4083-8086-cd246501547d',
    'ba42d345-7804-47e7-b195-0d9a403176c5',
}


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def sha(value):
    return hashlib.sha256(value).hexdigest()


def inventory(conn):
    conn.row_factory = sqlite3.Row
    rows = {r['id']: dict(r) for r in conn.execute('SELECT * FROM private_records ORDER BY id')}
    require(set(rows) == EXPECTED_IDS, 'Expected the original seven record IDs; refusing changed inventory.')
    require(all(r['user_id'] == USER for r in rows.values()), 'Non-local_seedy record; refusing.')
    return rows


def immutable_snapshot(path, expected_hash=None):
    # This fallback is limited to snapshots with no WAL/journal. It must never
    # ignore live WAL contents. Stable file hash is checked around the read.
    require(path.is_file(), f'Missing existing database: {path}')
    sidecars = [Path(str(path) + suffix) for suffix in ('-wal', '-journal')]
    require(not any(p.exists() for p in sidecars), f'WAL/journal present; refusing immutable read: {path}')
    before_hash = sha(path.read_bytes())
    if expected_hash:
        require(before_hash == expected_hash, 'Backup differs from the independently inspected original.')
    conn = sqlite3.connect(path.as_uri() + '?mode=ro&immutable=1', uri=True)
    try:
        conn.execute('PRAGMA query_only=ON')
        rows = inventory(conn)
    finally:
        conn.close()
    require(not any(p.exists() for p in sidecars), 'WAL/journal appeared during read; refusing stale snapshot.')
    require(sha(path.read_bytes()) == before_hash, 'Database changed during read; retry after local writes finish.')
    return rows


def build_fixture(original):
    subrow, termsrow = original[SUB], original[TERMS]
    require(subrow['kind'] == 'subscription' and subrow['target'] is None, 'Wrong subscription target.')
    require(termsrow['kind'] == 'billing_terms' and termsrow['target'] == 'contract:' + SUB, 'Wrong history target.')
    sub, history = json.loads(subrow['payload']), json.loads(termsrow['payload'])
    expected_name = 'V10-QA-' + 'A' * 93
    require(sub.get('name') == expected_name and len(sub['name']) == 100, 'Not the exact 100-character V10-QA fixture.')
    require('실제 구독 아님' in sub.get('note', ''), 'Missing synthetic-fixture note.')
    require(sub.get('taxStatus') == 'unknown', 'Unexpected original subscription tax status.')
    require(history.get('schemaVersion') == 1 and history.get('revision') == 4, 'Unexpected history revision/schema.')
    versions = history.get('versions', [])
    require(len(versions) == 2, 'Unexpected history version count.')
    require([v.get('id') for v in versions] == [OBSERVED, FUTURE], 'Unexpected history version IDs/order.')
    require(versions[0].get('basis') == 'observed' and versions[0].get('effectiveFrom') == '2026-09-12', 'Wrong observed version.')
    require(versions[1].get('effectiveFrom') == '2026-10-01', 'Wrong future version date.')
    require(all(v.get('state') == 'confirmed' for v in versions), 'Unconfirmed history is outside this fixture.')
    require(versions[0]['terms'].get('taxStatus') == 'unknown', 'Observed tax differs from original.')
    require(versions[1]['terms'].get('taxStatus') == 'included', 'Future tax is not already included.')
    require(history['legacySnapshot'].get('name') == expected_name, 'Legacy snapshot belongs to another fixture.')
    require(history['legacySnapshot'].get('taxStatus') == 'unknown', 'Legacy tax differs from original.')

    desired_sub, desired_history = copy.deepcopy(sub), copy.deepcopy(history)
    desired_sub['taxStatus'] = 'included'
    desired_history['versions'][0]['terms']['taxStatus'] = 'included'
    desired_history['legacySnapshot']['taxStatus'] = 'included'
    fixture = copy.deepcopy(original)
    # Preserve every original JSON byte except the three exact value strings.
    pattern = re.compile(r'("taxStatus"\s*:\s*)"unknown"')
    for record_id, expected_count, desired in ((SUB, 1, desired_sub), (TERMS, 2, desired_history)):
        changed, count = pattern.subn(lambda m: m.group(1) + '"included"', original[record_id]['payload'])
        require(count == expected_count, 'Unexpected tax field count; refusing broad replacement.')
        require(json.loads(changed) == desired, 'A field outside the exact tax paths would change.')
        fixture[record_id]['payload'] = changed
    return fixture


def classify(rows, original, fixture):
    if rows == original:
        return 'original'
    if rows == fixture:
        return 'fixture'
    raise RuntimeError('Current seven records differ from exact original/fixture states; refusing overwrite.')


def receipt(mode, previous_state, resulting_state, original, fixture, committed):
    return {
        'purpose': 'LOCAL SYNTHETIC UI STATE ONLY; not actual financial/user evidence',
        'mode': mode, 'database': str(DB), 'backup': str(BACKUP),
        'backup_sha256': BACKUP_SHA256, 'previous_state': previous_state,
        'resulting_state': resulting_state, 'committed': committed,
        'private_record_count': 7,
        'changed_json_paths': [SUB + '.taxStatus', TERMS + '.versions[0].terms.taxStatus', TERMS + '.legacySnapshot.taxStatus'],
        'preserved': 'Other five rows and all non-payload columns, history revision/dates, future version, and saved-comparison snapshot are unchanged.',
        'payloads': {
            rid: {
                'original_sha256': sha(original[rid]['payload'].encode()),
                'fixture_sha256': sha(fixture[rid]['payload'].encode()),
                'original_raw': original[rid]['payload'],
                'fixture_raw': fixture[rid]['payload'],
            } for rid in (SUB, TERMS)
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=('preview', 'apply', 'restore'))
    mode = parser.parse_args().mode
    require(DB.is_file() and not DB.is_symlink(), 'Expected existing local D1 database; no creation or symlink allowed.')
    require(BACKUP.is_file() and not BACKUP.is_symlink(), 'Expected preserved original backup.')
    require(DB.resolve() != BACKUP.resolve(), 'Live and backup paths must differ.')
    original = immutable_snapshot(BACKUP, BACKUP_SHA256)
    fixture = build_fixture(original)
    if mode == 'preview':
        state = classify(immutable_snapshot(DB), original, fixture)
        print(json.dumps(receipt(mode, state, state, original, fixture, False), ensure_ascii=False, indent=2))
        return

    target = fixture if mode == 'apply' else original
    target_state = 'fixture' if mode == 'apply' else 'original'
    conn = sqlite3.connect(DB.as_uri() + '?mode=rw', uri=True, timeout=5, isolation_level=None)
    committed = False
    try:
        conn.execute('BEGIN IMMEDIATE')
        require(not conn.execute("SELECT 1 FROM sqlite_master WHERE type='trigger' AND tbl_name='private_records'").fetchone(), 'Unexpected private_records trigger; refusing side effects.')
        current = inventory(conn)
        previous_state = classify(current, original, fixture)
        if current != target:
            for rid in (SUB, TERMS):
                before = current[rid]
                cursor = conn.execute(
                    'UPDATE private_records SET payload=? WHERE id=? AND user_id=? AND kind=? AND target IS ? AND payload=?',
                    (target[rid]['payload'], rid, USER, before['kind'], before['target'], before['payload']),
                )
                require(cursor.rowcount == 1, 'Payload CAS did not update exactly one intended row.')
            require(inventory(conn) == target, 'Post-write comparison failed; rolling back both payloads.')
            # Restore uses original raw strings, not JSON reserialization.
            conn.execute('COMMIT')
            committed = True
        else:
            conn.execute('ROLLBACK')  # Safe idempotent no-op.
    except BaseException:
        if conn.in_transaction:
            conn.execute('ROLLBACK')
        raise
    finally:
        conn.close()
    print(json.dumps(receipt(mode, previous_state, target_state, original, fixture, committed), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
