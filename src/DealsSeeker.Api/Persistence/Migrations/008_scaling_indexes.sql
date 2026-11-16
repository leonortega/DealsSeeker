-- Indexes for the access patterns the application actually uses.
--
-- offers(is_active): every search filters on it.
-- offers(lat, lng): the radius pre-filter of a search reads a bounding box.
-- offer_availability_votes(user_id): the per-caller state of a search filters by user first.
-- promoted_offers(starts_at_utc, ends_at_utc): the promotion window is filtered by time.
-- offer_reports(offer_id): reports are read per offer.
--
-- The timestamps are stored as ISO-8601 text in UTC with a fixed offset, so they sort
-- chronologically as text and remain usable by these indexes.

CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers (is_active);
CREATE INDEX IF NOT EXISTS idx_offers_lat_lng ON offers (lat, lng);
CREATE INDEX IF NOT EXISTS idx_offer_availability_votes_user_id
    ON offer_availability_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_promoted_offers_window
    ON promoted_offers (starts_at_utc, ends_at_utc);
CREATE INDEX IF NOT EXISTS idx_offer_reports_offer_id
    ON offer_reports (offer_id);
