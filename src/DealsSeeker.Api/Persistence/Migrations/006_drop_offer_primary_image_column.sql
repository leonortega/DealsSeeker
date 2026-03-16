INSERT INTO offer_images (
    offer_id,
    image_url,
    mime_type,
    width,
    height,
    sort_order,
    created_at_utc
)
SELECT
    o.offer_id,
    CASE
        WHEN o.image_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC' THEN '/images/offer-placeholder.svg'
        ELSE o.image_url
    END,
    CASE
        WHEN o.image_url = '/images/offer-placeholder.svg'
            OR o.image_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC' THEN 'image/svg+xml'
        WHEN o.image_url LIKE 'data:image/%' THEN substr(substr(o.image_url, 6), 1, instr(substr(o.image_url, 6), ';') - 1)
        WHEN lower(o.image_url) LIKE '%.svg' THEN 'image/svg+xml'
        WHEN lower(o.image_url) LIKE '%.png' THEN 'image/png'
        WHEN lower(o.image_url) LIKE '%.gif' THEN 'image/gif'
        WHEN lower(o.image_url) LIKE '%.webp' THEN 'image/webp'
        ELSE NULL
    END,
    CASE
        WHEN o.image_url = '/images/offer-placeholder.svg'
            OR o.image_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC' THEN 800
        ELSE NULL
    END,
    CASE
        WHEN o.image_url = '/images/offer-placeholder.svg'
            OR o.image_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC' THEN 500
        ELSE NULL
    END,
    0,
    COALESCE(o.created_at_utc, '2026-01-01T00:00:00.0000000+00:00')
FROM offers o
WHERE TRIM(COALESCE(o.image_url, '')) <> ''
  AND NOT EXISTS (
      SELECT 1
      FROM offer_images oi
      WHERE oi.offer_id = o.offer_id
  );

UPDATE offer_images
SET image_url = '/images/offer-placeholder.svg',
    mime_type = 'image/svg+xml',
    width = 800,
    height = 500
WHERE image_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABGSURBVEhLY6jxNf1PS8yALkBtPEwtsFOTJgujmzOMLaAmHqYWoIctsRjdnGFsATXxMLUAPWyJxejmDGMLqIlHLSCIaW4BAJj4Ovv+Oxb0AAAAAElFTkSuQmCC';

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE offers_new (
    offer_id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    positive_availability_count INTEGER NOT NULL DEFAULT 0,
    negative_availability_count INTEGER NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    created_at_utc TEXT NOT NULL,
    created_by_user_id TEXT NULL
);

INSERT INTO offers_new (
    offer_id,
    business_id,
    business_name,
    description,
    is_active,
    lat,
    lng,
    positive_availability_count,
    negative_availability_count,
    report_count,
    created_at_utc,
    created_by_user_id
)
SELECT
    offer_id,
    business_id,
    business_name,
    description,
    is_active,
    lat,
    lng,
    positive_availability_count,
    negative_availability_count,
    report_count,
    created_at_utc,
    created_by_user_id
FROM offers;

DROP TABLE offers;
ALTER TABLE offers_new RENAME TO offers;

CREATE INDEX IF NOT EXISTS idx_offers_created_by_user_id
    ON offers (created_by_user_id);

COMMIT;
PRAGMA foreign_keys = ON;