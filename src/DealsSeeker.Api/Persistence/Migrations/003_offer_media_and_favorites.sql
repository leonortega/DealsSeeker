CREATE TABLE IF NOT EXISTS offer_images (
    offer_image_id INTEGER PRIMARY KEY AUTOINCREMENT,
    offer_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    mime_type TEXT NULL,
    width INTEGER NULL,
    height INTEGER NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at_utc TEXT NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offer_images_offer_id_sort_order
    ON offer_images (offer_id, sort_order);

CREATE TABLE IF NOT EXISTS offer_favorites (
    user_id TEXT NOT NULL,
    offer_id TEXT NOT NULL,
    created_at_utc TEXT NOT NULL,
    PRIMARY KEY (user_id, offer_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offer_favorites_offer_id
    ON offer_favorites (offer_id);

CREATE TABLE IF NOT EXISTS promoted_offers (
    offer_id TEXT PRIMARY KEY,
    priority INTEGER NOT NULL DEFAULT 0,
    starts_at_utc TEXT NULL,
    ends_at_utc TEXT NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO offer_images (
    offer_id, image_url, mime_type, width, height, sort_order, created_at_utc
)
SELECT
    o.offer_id,
    o.image_url,
    NULL,
    NULL,
    NULL,
    0,
    COALESCE(o.created_at_utc, '2026-01-01T00:00:00.0000000+00:00')
FROM offers o;

INSERT OR IGNORE INTO promoted_offers (offer_id, priority, starts_at_utc, ends_at_utc)
VALUES
    ('off-100', 1, NULL, NULL);
