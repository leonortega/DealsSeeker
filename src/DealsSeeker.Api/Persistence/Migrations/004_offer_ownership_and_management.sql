ALTER TABLE offers ADD COLUMN created_by_user_id TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_offers_created_by_user_id
    ON offers (created_by_user_id);
