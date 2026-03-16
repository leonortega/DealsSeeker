CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_disabled INTEGER NOT NULL DEFAULT 0,
    created_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    access_token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at_utc TEXT NOT NULL,
    expires_at_utc TEXT NOT NULL,
    revoked_at_utc TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at_utc ON auth_sessions(expires_at_utc);

CREATE TABLE IF NOT EXISTS offers (
    offer_id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    positive_availability_count INTEGER NOT NULL DEFAULT 0,
    negative_availability_count INTEGER NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    created_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offer_tags (
    offer_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (offer_id, tag),
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offer_tags_tag ON offer_tags(tag);

CREATE TABLE IF NOT EXISTS offer_availability_votes (
    offer_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    vote_type INTEGER NOT NULL,
    voted_at_utc TEXT NOT NULL,
    PRIMARY KEY (offer_id, user_id),
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS offer_reports (
    offer_report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    offer_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at_utc TEXT NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suggestions (
    suggestion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    contact TEXT NULL,
    created_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    offer_id TEXT NULL,
    user_id TEXT NULL,
    reported_at_utc TEXT NULL,
    created_at_utc TEXT NOT NULL
);

INSERT OR IGNORE INTO offers (
    offer_id, business_id, business_name, description, image_url, is_active, lat, lng,
    positive_availability_count, negative_availability_count, report_count, created_at_utc
) VALUES
    ('off-100', 'biz-100', 'Main Street Cafe', 'Buy one coffee and get one free', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC', 1, 40.7131, -74.0055, 0, 0, 0, '2026-01-01T00:00:00.0000000+00:00'),
    ('off-101', 'biz-101', 'Broadway Market', 'Bakery discount before closing time', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC', 1, 40.7165, -74.0035, 0, 0, 0, '2026-01-01T00:00:00.0000000+00:00'),
    ('off-102', 'biz-102', 'Green Leaf Shop', 'Fresh tea selection with seasonal promos', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC', 1, 40.7105, -74.0080, 0, 0, 0, '2026-01-01T00:00:00.0000000+00:00');

INSERT OR IGNORE INTO offer_tags (offer_id, tag) VALUES
    ('off-100', 'coffee'),
    ('off-100', 'breakfast'),
    ('off-101', 'bakery'),
    ('off-101', 'discount'),
    ('off-101', 'bread'),
    ('off-102', 'tea'),
    ('off-102', 'fresh'),
    ('off-102', 'seasonal');
