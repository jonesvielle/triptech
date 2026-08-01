import json
import os
import sqlite3
import sys
import urllib.parse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SQLITE_DB = ROOT / "data" / "triptech.db"


def load_env():
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"'))


def parse_database_url(url):
    parsed = urllib.parse.urlparse(url)
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "dbname": parsed.path.lstrip("/"),
        "user": urllib.parse.unquote(parsed.username or ""),
        "password": urllib.parse.unquote(parsed.password or ""),
        "sslmode": "require",
    }


def connect_postgres():
    try:
        import psycopg
    except ImportError:
        try:
            import psycopg2 as psycopg
        except ImportError as error:
            raise RuntimeError(
                "Install a Postgres Python driver first: py -3 -m pip install psycopg[binary]"
            ) from error

    database_url = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set.")

    if hasattr(psycopg, "connect"):
        return psycopg.connect(**parse_database_url(database_url))
    raise RuntimeError("Unsupported Postgres driver.")


def init_postgres(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
              id SERIAL PRIMARY KEY,
              category TEXT NOT NULL,
              manufacturer TEXT NOT NULL DEFAULT 'Generic',
              model TEXT NOT NULL,
              capacity DOUBLE PRECISION NOT NULL DEFAULT 0,
              capacity_label TEXT NOT NULL DEFAULT '',
              voltage DOUBLE PRECISION NOT NULL DEFAULT 0,
              price DOUBLE PRECISION NOT NULL DEFAULT 0,
              surge_va DOUBLE PRECISION NOT NULL DEFAULT 0,
              hybrid_pv_current_a DOUBLE PRECISION NOT NULL DEFAULT 0,
              is_default BOOLEAN NOT NULL DEFAULT false,
              meta_json TEXT NOT NULL DEFAULT '{}',
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS quote_requests (
              id SERIAL PRIMARY KEY,
              client_name TEXT NOT NULL DEFAULT '',
              email TEXT NOT NULL DEFAULT '',
              phone TEXT NOT NULL DEFAULT '',
              location TEXT NOT NULL DEFAULT '',
              site_note TEXT NOT NULL DEFAULT '',
              total_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
              daily_energy_wh DOUBLE PRECISION NOT NULL DEFAULT 0,
              system_voltage DOUBLE PRECISION NOT NULL DEFAULT 0,
              quote_json TEXT NOT NULL DEFAULT '{}',
              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )
        for column, definition in {
            "status": "TEXT NOT NULL DEFAULT 'new'",
            "admin_note": "TEXT NOT NULL DEFAULT ''",
            "assigned_to": "TEXT NOT NULL DEFAULT ''",
            "follow_up_date": "TEXT NOT NULL DEFAULT ''",
            "last_contacted_at": "TEXT NOT NULL DEFAULT ''",
            "stage_notes_json": "TEXT NOT NULL DEFAULT '[]'",
        }.items():
            cur.execute(f"ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS {column} {definition}")
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS admin_users (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL,
              email TEXT NOT NULL DEFAULT '',
              role TEXT NOT NULL DEFAULT 'Viewer',
              password_hash TEXT NOT NULL DEFAULT '',
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )
        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_unique ON admin_users (lower(email)) WHERE email <> ''")
        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS admin_users_name_unique ON admin_users (lower(name))")
    conn.commit()


def sqlite_rows(table):
    if not SQLITE_DB.exists():
        return []
    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    try:
        return [dict(row) for row in conn.execute(f"SELECT * FROM {table}").fetchall()]
    finally:
        conn.close()


def migrate_products(conn):
    products = sqlite_rows("products")
    with conn.cursor() as cur:
        cur.execute("DELETE FROM products")
        for item in products:
            cur.execute(
                """
                INSERT INTO products (
                  category, manufacturer, model, capacity, capacity_label, voltage,
                  price, surge_va, hybrid_pv_current_a, is_default, meta_json,
                  created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s::timestamptz, now()), COALESCE(%s::timestamptz, now()))
                """,
                (
                    item.get("category", ""),
                    item.get("manufacturer", "Generic"),
                    item.get("model", ""),
                    item.get("capacity", 0),
                    item.get("capacity_label", ""),
                    item.get("voltage", 0),
                    item.get("price", 0),
                    item.get("surge_va", 0),
                    item.get("hybrid_pv_current_a", 0),
                    bool(item.get("is_default")),
                    item.get("meta_json") or "{}",
                    item.get("created_at"),
                    item.get("updated_at"),
                ),
            )
    conn.commit()
    return len(products)


def migrate_quotes(conn):
    quotes = sqlite_rows("quote_requests")
    with conn.cursor() as cur:
        cur.execute("DELETE FROM quote_requests")
        for item in quotes:
            cur.execute(
                """
                INSERT INTO quote_requests (
                  client_name, email, phone, location, site_note, total_cost,
                  daily_energy_wh, system_voltage, quote_json, status, admin_note,
                  assigned_to, follow_up_date, last_contacted_at, stage_notes_json,
                  created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s::timestamptz, now()))
                """,
                (
                    item.get("client_name", ""),
                    item.get("email", ""),
                    item.get("phone", ""),
                    item.get("location", ""),
                    item.get("site_note", ""),
                    item.get("total_cost", 0),
                    item.get("daily_energy_wh", 0),
                    item.get("system_voltage", 0),
                    item.get("quote_json") or "{}",
                    item.get("status", "new"),
                    item.get("admin_note", ""),
                    item.get("assigned_to", ""),
                    item.get("follow_up_date", ""),
                    item.get("last_contacted_at", ""),
                    item.get("stage_notes_json") or "[]",
                    item.get("created_at"),
                ),
            )
    conn.commit()
    return len(quotes)


def migrate_admin_users(conn):
    try:
        users = sqlite_rows("admin_users")
    except sqlite3.OperationalError:
        users = []
    with conn.cursor() as cur:
      cur.execute("DELETE FROM admin_users")
      for item in users:
          cur.execute(
              """
              INSERT INTO admin_users (
                name, email, role, password_hash, created_at, updated_at
              ) VALUES (%s, %s, %s, %s, COALESCE(%s::timestamptz, now()), COALESCE(%s::timestamptz, now()))
              """,
              (
                  item.get("name", ""),
                  item.get("email", ""),
                  item.get("role", "Viewer"),
                  item.get("password_hash", ""),
                  item.get("created_at"),
                  item.get("updated_at"),
              ),
          )
    conn.commit()
    return len(users)


def main():
    load_env()
    with connect_postgres() as conn:
        init_postgres(conn)
        products = migrate_products(conn)
        quotes = migrate_quotes(conn)
        users = migrate_admin_users(conn)
    print(json.dumps({"products_migrated": products, "quotes_migrated": quotes, "admin_users_migrated": users}))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}), file=sys.stderr)
        sys.exit(1)
