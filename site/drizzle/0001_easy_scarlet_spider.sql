-- Drizzle Kit 0.31 splits comma-containing SQLite expressions; maintain this expression index as literal SQL.
CREATE UNIQUE INDEX private_payment_occurrence ON private_records(user_id,json_extract(payload,'$.plannedKey')) WHERE kind='payment' AND json_extract(payload,'$.plannedKey') IS NOT NULL AND json_extract(payload,'$.plannedKey')!='';
