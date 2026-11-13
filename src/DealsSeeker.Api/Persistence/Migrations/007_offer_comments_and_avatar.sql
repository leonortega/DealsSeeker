ALTER TABLE users ADD COLUMN avatar_id TEXT NULL;

CREATE TABLE IF NOT EXISTS offer_comments (
    comment_id TEXT PRIMARY KEY,
    offer_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at_utc TEXT NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offer_comments_offer_id_created_at
    ON offer_comments (offer_id, created_at_utc);
