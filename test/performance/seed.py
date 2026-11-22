"""Seed a migrated DealsSeeker SQLite database with a synthetic offer corpus.

Usage:
    python test/performance/seed.py <db-path> <offer-count>

Run this while the API is stopped: it writes offers directly to the database so
10k/100k/1M corpora are created in seconds instead of one HTTP request per row.
The API applies the schema migrations on its first start, so start it once
before seeding, stop it, seed, then start it again.
"""

import sqlite3
import sys
import time
from datetime import datetime, timezone

TAGS = ["coffee", "bakery", "tea", "discount", "fresh", "breakfast", "seasonal", "market"]
NAMES = ["Main Street Cafe", "Broadway Market", "Green Leaf Shop", "Corner Bakery"]
NOW = datetime.now(timezone.utc).isoformat(timespec="microseconds")


def seed(db_path: str, count: int) -> None:
    if count < 0:
        raise ValueError("offer count must be >= 0")

    started = time.perf_counter()
    with sqlite3.connect(db_path, timeout=30) as connection:
        connection.execute("PRAGMA busy_timeout=30000")
        # Make repeated seeds idempotent for the perf-off-* range.
        connection.execute("DELETE FROM offer_images WHERE offer_id LIKE 'perf-off-%'")
        connection.execute("DELETE FROM offer_tags WHERE offer_id LIKE 'perf-off-%'")
        connection.execute("DELETE FROM offers WHERE offer_id LIKE 'perf-off-%'")
        connection.executemany(
            """
            INSERT OR REPLACE INTO offers (
                offer_id, business_id, business_name, description,
                is_active, lat, lng, positive_availability_count,
                negative_availability_count, report_count, created_at_utc
            ) VALUES (?, ?, ?, ?, 1, ?, ?, 0, 0, 0, ?)
            """,
            (
                (
                    f"perf-off-{i}",
                    f"perf-biz-{i}",
                    NAMES[i % len(NAMES)],
                    f"Load test deal {i}",
                    40.70 + (i % 100) * 0.001,
                    -74.01 + (i % 100) * 0.001,
                    NOW,
                )
                for i in range(count)
            ),
        )
        connection.executemany(
            """
            INSERT INTO offer_images (
                offer_id, image_url, mime_type, width, height, sort_order, created_at_utc
            ) VALUES (?, '/images/offer-placeholder.svg', 'image/svg+xml', 800, 500, 0, ?)
            """,
            ((f"perf-off-{i}", NOW) for i in range(count)),
        )
        connection.executemany(
            "INSERT OR IGNORE INTO offer_tags (offer_id, tag) VALUES (?, ?)",
            (
                (f"perf-off-{i}", TAGS[i % len(TAGS)])
                for i in range(count)
            ),
        )

    elapsed = time.perf_counter() - started
    print(f"Seeded {count} offers into {db_path} in {elapsed:.2f}s")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    seed(sys.argv[1], int(sys.argv[2]))
