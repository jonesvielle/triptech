import json
import secrets
import sqlite3
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "triptech.db"


def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    init_db(conn)
    return conn


def init_db(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            manufacturer TEXT NOT NULL DEFAULT 'Generic',
            model TEXT NOT NULL,
            capacity REAL NOT NULL DEFAULT 0,
            capacity_label TEXT NOT NULL DEFAULT '',
            voltage REAL NOT NULL DEFAULT 0,
            price REAL NOT NULL DEFAULT 0,
            surge_va REAL NOT NULL DEFAULT 0,
            hybrid_pv_current_a REAL NOT NULL DEFAULT 0,
            is_default INTEGER NOT NULL DEFAULT 0,
            meta_json TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS quote_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_name TEXT NOT NULL DEFAULT '',
            email TEXT NOT NULL DEFAULT '',
            phone TEXT NOT NULL DEFAULT '',
            location TEXT NOT NULL DEFAULT '',
            site_note TEXT NOT NULL DEFAULT '',
            total_cost REAL NOT NULL DEFAULT 0,
            daily_energy_wh REAL NOT NULL DEFAULT 0,
            system_voltage REAL NOT NULL DEFAULT 0,
            quote_json TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL DEFAULT '',
            role TEXT NOT NULL DEFAULT 'Viewer',
            password_hash TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS admin_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL DEFAULT '',
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS news_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL DEFAULT 'Company Updates',
            excerpt TEXT NOT NULL DEFAULT '',
            body TEXT NOT NULL DEFAULT '',
            cover_image TEXT NOT NULL DEFAULT '',
            author TEXT NOT NULL DEFAULT 'TRI-P Tech',
            status TEXT NOT NULL DEFAULT 'draft',
            is_featured INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS chat_conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_token TEXT NOT NULL DEFAULT '',
            channel TEXT NOT NULL DEFAULT 'website',
            external_id TEXT NOT NULL DEFAULT '',
            visitor_name TEXT NOT NULL DEFAULT 'Website visitor',
            email TEXT NOT NULL DEFAULT '',
            phone TEXT NOT NULL DEFAULT '',
            page_url TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'open',
            assigned_to TEXT NOT NULL DEFAULT '',
            last_message TEXT NOT NULL DEFAULT '',
            last_message_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender TEXT NOT NULL DEFAULT 'visitor',
            author TEXT NOT NULL DEFAULT '',
            body TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
        )
        """
    )
    existing_quote_columns = {
        row["name"] for row in conn.execute("PRAGMA table_info(quote_requests)").fetchall()
    }
    quote_columns = {
        "email": "TEXT NOT NULL DEFAULT ''",
        "status": "TEXT NOT NULL DEFAULT 'new'",
        "admin_note": "TEXT NOT NULL DEFAULT ''",
        "assigned_to": "TEXT NOT NULL DEFAULT ''",
        "follow_up_date": "TEXT NOT NULL DEFAULT ''",
        "last_contacted_at": "TEXT NOT NULL DEFAULT ''",
        "stage_notes_json": "TEXT NOT NULL DEFAULT '[]'",
    }
    for column, definition in quote_columns.items():
        if column not in existing_quote_columns:
            conn.execute(f"ALTER TABLE quote_requests ADD COLUMN {column} {definition}")
    existing_chat_columns = {
        row["name"] for row in conn.execute("PRAGMA table_info(chat_conversations)").fetchall()
    }
    if "visitor_token" not in existing_chat_columns:
        conn.execute("ALTER TABLE chat_conversations ADD COLUMN visitor_token TEXT NOT NULL DEFAULT ''")
    if "channel" not in existing_chat_columns:
        conn.execute("ALTER TABLE chat_conversations ADD COLUMN channel TEXT NOT NULL DEFAULT 'website'")
    if "external_id" not in existing_chat_columns:
        conn.execute("ALTER TABLE chat_conversations ADD COLUMN external_id TEXT NOT NULL DEFAULT ''")
    conn.commit()


def row_to_dict(row):
    data = dict(row)
    for key in ("is_default", "is_featured"):
        if key in data:
            data[key] = bool(data[key])
    for key in ("meta_json", "quote_json", "stage_notes_json"):
        if key in data:
            try:
                data[key.replace("_json", "")] = json.loads(data[key] or "{}")
            except json.JSONDecodeError:
                data[key.replace("_json", "")] = [] if key == "stage_notes_json" else {}
            del data[key]
    return data


def read_payload():
    if len(sys.argv) < 3:
        return {}
    return json.loads(sys.argv[2] or "{}")


def list_products(conn):
    rows = conn.execute(
        """
        SELECT * FROM products
        ORDER BY category ASC, manufacturer ASC, capacity ASC, model ASC
        """
    ).fetchall()
    return {"products": [row_to_dict(row) for row in rows]}


def create_product(conn, payload):
    product = normalize_product(payload)
    cursor = conn.execute(
        """
        INSERT INTO products (
            category, manufacturer, model, capacity, capacity_label, voltage,
            price, surge_va, hybrid_pv_current_a, is_default, meta_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            product["category"],
            product["manufacturer"],
            product["model"],
            product["capacity"],
            product["capacity_label"],
            product["voltage"],
            product["price"],
            product["surge_va"],
            product["hybrid_pv_current_a"],
            int(product["is_default"]),
            json.dumps(product["meta"]),
        ),
    )
    conn.commit()
    return get_product(conn, cursor.lastrowid)


def update_product(conn, payload):
    product_id = int(payload.get("id") or 0)
    if product_id <= 0:
        raise ValueError("A valid product id is required.")
    product = normalize_product(payload)
    conn.execute(
        """
        UPDATE products
        SET category = ?, manufacturer = ?, model = ?, capacity = ?,
            capacity_label = ?, voltage = ?, price = ?, surge_va = ?,
            hybrid_pv_current_a = ?, is_default = ?, meta_json = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            product["category"],
            product["manufacturer"],
            product["model"],
            product["capacity"],
            product["capacity_label"],
            product["voltage"],
            product["price"],
            product["surge_va"],
            product["hybrid_pv_current_a"],
            int(product["is_default"]),
            json.dumps(product["meta"]),
            product_id,
        ),
    )
    conn.commit()
    return get_product(conn, product_id)


def delete_product(conn, payload):
    product_id = int(payload.get("id") or 0)
    if product_id <= 0:
        raise ValueError("A valid product id is required.")
    conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    return {"deleted": True, "id": product_id}


def replace_products(conn, payload):
    products = payload.get("products") if isinstance(payload.get("products"), list) else []
    conn.execute("DELETE FROM products")
    created = []
    for item in products:
        product = normalize_product(item)
        cursor = conn.execute(
            """
            INSERT INTO products (
                category, manufacturer, model, capacity, capacity_label, voltage,
                price, surge_va, hybrid_pv_current_a, is_default, meta_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product["category"],
                product["manufacturer"],
                product["model"],
                product["capacity"],
                product["capacity_label"],
                product["voltage"],
                product["price"],
                product["surge_va"],
                product["hybrid_pv_current_a"],
                int(product["is_default"]),
                json.dumps(product["meta"]),
            ),
        )
        created.append(cursor.lastrowid)
    conn.commit()
    return {"saved": len(created)}


def get_product(conn, product_id):
    row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if row is None:
        raise ValueError("Product not found.")
    return {"product": row_to_dict(row)}


def normalize_product(payload):
    category = str(payload.get("category") or "").strip()
    model = str(payload.get("model") or "").strip()
    if not category:
        raise ValueError("Product category is required.")
    if not model:
        raise ValueError("Product model is required.")
    return {
        "category": category,
        "manufacturer": str(payload.get("manufacturer") or "Generic").strip() or "Generic",
        "model": model,
        "capacity": float(payload.get("capacity") or 0),
        "capacity_label": str(payload.get("capacity_label") or payload.get("capacityLabel") or "").strip(),
        "voltage": float(payload.get("voltage") or 0),
        "price": float(payload.get("price") or 0),
        "surge_va": float(payload.get("surge_va") or payload.get("surgeVa") or 0),
        "hybrid_pv_current_a": float(
            payload.get("hybrid_pv_current_a") or payload.get("hybridPvCurrentA") or 0
        ),
        "is_default": bool(payload.get("is_default") or payload.get("isDefault") or False),
        "meta": payload.get("meta") if isinstance(payload.get("meta"), dict) else {},
    }


def list_quotes(conn):
    rows = conn.execute(
        "SELECT * FROM quote_requests ORDER BY created_at DESC, id DESC"
    ).fetchall()
    return {"quote_requests": [row_to_dict(row) for row in rows]}


def create_quote(conn, payload):
    cursor = conn.execute(
        """
        INSERT INTO quote_requests (
            client_name, email, phone, location, site_note, total_cost,
            daily_energy_wh, system_voltage, quote_json, status, admin_note,
            assigned_to, follow_up_date, last_contacted_at, stage_notes_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            str(payload.get("client_name") or payload.get("clientName") or "").strip(),
            str(payload.get("email") or payload.get("client_email") or payload.get("clientEmail") or "").strip(),
            str(payload.get("phone") or "").strip(),
            str(payload.get("location") or "").strip(),
            str(payload.get("site_note") or payload.get("siteNote") or "").strip(),
            float(payload.get("total_cost") or payload.get("totalCost") or 0),
            float(payload.get("daily_energy_wh") or payload.get("dailyEnergyWh") or 0),
            float(payload.get("system_voltage") or payload.get("systemVoltage") or 0),
            json.dumps(payload.get("quote") if isinstance(payload.get("quote"), dict) else payload),
            str(payload.get("status") or "new").strip() or "new",
            str(payload.get("admin_note") or payload.get("adminNote") or "").strip(),
            str(payload.get("assigned_to") or payload.get("assignedTo") or "").strip(),
            str(payload.get("follow_up_date") or payload.get("followUpDate") or "").strip(),
            str(payload.get("last_contacted_at") or payload.get("lastContactedAt") or "").strip(),
            json.dumps(payload.get("stage_notes") if isinstance(payload.get("stage_notes"), list) else []),
        ),
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM quote_requests WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    return {"quote_request": row_to_dict(row)}


def update_quote(conn, payload):
    quote_id = int(payload.get("id") or 0)
    if quote_id <= 0:
        raise ValueError("A valid quote request id is required.")
    allowed_statuses = {"new", "contacted", "inspection", "quoted", "won", "lost"}
    status = str(payload.get("status") or "new").strip().lower()
    if status not in allowed_statuses:
        status = "new"
    conn.execute(
        """
        UPDATE quote_requests
        SET status = ?, admin_note = ?, assigned_to = ?, follow_up_date = ?,
            last_contacted_at = ?, stage_notes_json = ?
        WHERE id = ?
        """,
        (
            status,
            str(payload.get("admin_note") or payload.get("adminNote") or "").strip(),
            str(payload.get("assigned_to") or payload.get("assignedTo") or "").strip(),
            str(payload.get("follow_up_date") or payload.get("followUpDate") or "").strip(),
            str(payload.get("last_contacted_at") or payload.get("lastContactedAt") or "").strip(),
            json.dumps(payload.get("stage_notes") if isinstance(payload.get("stage_notes"), list) else []),
            quote_id,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM quote_requests WHERE id = ?", (quote_id,)).fetchone()
    if row is None:
        raise ValueError("Quote request not found.")
    return {"quote_request": row_to_dict(row)}


def normalize_role(value):
    role = str(value or "").strip()
    return role if role in {"Admin", "Sales", "Engineer", "Viewer"} else "Viewer"


def row_to_admin_user(row, include_password=False):
    data = dict(row)
    data["role"] = normalize_role(data.get("role"))
    if not include_password and "password_hash" in data:
        del data["password_hash"]
    return data


def list_admin_users(conn, include_password=False):
    rows = conn.execute("SELECT * FROM admin_users ORDER BY name ASC").fetchall()
    return {"users": [row_to_admin_user(row, include_password) for row in rows]}


def create_admin_user(conn, payload):
    name = str(payload.get("name") or "").strip()
    if not name:
        raise ValueError("User name is required.")
    password_hash = str(payload.get("password_hash") or payload.get("passwordHash") or "").strip()
    if not password_hash:
        raise ValueError("User password is required.")
    cursor = conn.execute(
        """
        INSERT INTO admin_users (name, email, role, password_hash)
        VALUES (?, ?, ?, ?)
        """,
        (
            name,
            str(payload.get("email") or "").strip(),
            normalize_role(payload.get("role")),
            password_hash,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM admin_users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"user": row_to_admin_user(row)}


def update_admin_user(conn, payload):
    user_id = int(payload.get("id") or 0)
    if user_id <= 0:
        raise ValueError("A valid user id is required.")
    current = conn.execute("SELECT * FROM admin_users WHERE id = ?", (user_id,)).fetchone()
    if current is None:
        raise ValueError("User not found.")
    password_hash = str(
        payload.get("password_hash") or payload.get("passwordHash") or current["password_hash"] or ""
    ).strip()
    conn.execute(
        """
        UPDATE admin_users
        SET name = ?, email = ?, role = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            str(payload.get("name") or current["name"] or "").strip(),
            str(payload.get("email") if payload.get("email") is not None else current["email"] or "").strip(),
            normalize_role(payload.get("role") or current["role"]),
            password_hash,
            user_id,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM admin_users WHERE id = ?", (user_id,)).fetchone()
    return {"user": row_to_admin_user(row)}


def delete_admin_user(conn, payload):
    user_id = int(payload.get("id") or 0)
    if user_id <= 0:
        raise ValueError("A valid user id is required.")
    conn.execute("DELETE FROM admin_users WHERE id = ?", (user_id,))
    conn.commit()
    return {"deleted": True, "id": user_id}


def get_admin_setting(conn, payload):
    key = str(payload.get("key") or "").strip()
    if not key:
        raise ValueError("Setting key is required.")
    row = conn.execute("SELECT value FROM admin_settings WHERE key = ?", (key,)).fetchone()
    return {"key": key, "value": row["value"] if row else ""}


def update_admin_setting(conn, payload):
    key = str(payload.get("key") or "").strip()
    value = str(payload.get("value") or "").strip()
    if not key:
        raise ValueError("Setting key is required.")
    conn.execute(
        """
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        """,
        (key, value),
    )
    conn.commit()
    return {"saved": True}


def slugify(value):
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in value).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug or "news-post"


def normalize_news_post(payload):
    title = str(payload.get("title") or "").strip()
    if not title:
        raise ValueError("News title is required.")
    status = str(payload.get("status") or "draft").strip()
    return {
        "title": title,
        "slug": str(payload.get("slug") or slugify(title)).strip(),
        "category": str(payload.get("category") or "Company Updates").strip(),
        "excerpt": str(payload.get("excerpt") or "").strip(),
        "body": str(payload.get("body") or "").strip(),
        "cover_image": str(payload.get("cover_image") or payload.get("coverImage") or "").strip(),
        "author": str(payload.get("author") or "TRI-P Tech").strip(),
        "status": "published" if status == "published" else "draft",
        "is_featured": bool(payload.get("is_featured") or payload.get("isFeatured") or False),
    }


def list_news_posts(conn, payload):
    include_drafts = bool(payload.get("include_drafts") or payload.get("includeDrafts") or False)
    where = "" if include_drafts else "WHERE status = 'published'"
    rows = conn.execute(
        f"""
        SELECT * FROM news_posts
        {where}
        ORDER BY is_featured DESC, updated_at DESC, created_at DESC
        """
    ).fetchall()
    return {"posts": [row_to_dict(row) for row in rows]}


def create_news_post(conn, payload):
    post = normalize_news_post(payload)
    cursor = conn.execute(
        """
        INSERT INTO news_posts (
            title, slug, category, excerpt, body, cover_image, author, status, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            post["title"], post["slug"], post["category"], post["excerpt"], post["body"],
            post["cover_image"], post["author"], post["status"], int(post["is_featured"]),
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM news_posts WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"post": row_to_dict(row)}


def update_news_post(conn, payload):
    post_id = int(payload.get("id") or 0)
    if post_id <= 0:
        raise ValueError("A valid news post id is required.")
    post = normalize_news_post(payload)
    conn.execute(
        """
        UPDATE news_posts
        SET title = ?, slug = ?, category = ?, excerpt = ?, body = ?,
            cover_image = ?, author = ?, status = ?, is_featured = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            post["title"], post["slug"], post["category"], post["excerpt"], post["body"],
            post["cover_image"], post["author"], post["status"], int(post["is_featured"]), post_id,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM news_posts WHERE id = ?", (post_id,)).fetchone()
    if row is None:
        raise ValueError("News post not found.")
    return {"post": row_to_dict(row)}


def delete_news_post(conn, payload):
    post_id = int(payload.get("id") or 0)
    if post_id <= 0:
        raise ValueError("A valid news post id is required.")
    conn.execute("DELETE FROM news_posts WHERE id = ?", (post_id,))
    conn.commit()
    return {"deleted": True, "id": post_id}


def normalize_chat_status(value):
    status = str(value or "").strip().lower()
    return status if status in {"open", "waiting", "replied", "closed"} else "open"


def normalize_chat_sender(value):
    sender = str(value or "").strip().lower()
    return sender if sender in {"visitor", "staff", "assistant", "system"} else "visitor"


def list_chat_conversations(conn):
    rows = conn.execute(
        """
        SELECT * FROM chat_conversations
        ORDER BY last_message_at DESC, id DESC
        """
    ).fetchall()
    return {"conversations": [row_to_dict(row) for row in rows]}


def get_chat_conversation(conn, payload):
    conversation_id = int(payload.get("id") or payload.get("conversation_id") or payload.get("conversationId") or 0)
    if conversation_id <= 0:
        raise ValueError("A valid conversation id is required.")
    conversation = conn.execute("SELECT * FROM chat_conversations WHERE id = ?", (conversation_id,)).fetchone()
    if conversation is None:
        raise ValueError("Conversation not found.")
    messages = conn.execute(
        "SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC",
        (conversation_id,),
    ).fetchall()
    return {
        "conversation": row_to_dict(conversation),
        "messages": [row_to_dict(row) for row in messages],
    }


def create_chat_conversation(conn, payload):
    first_message = str(payload.get("message") or payload.get("body") or payload.get("text") or "").strip()
    visitor_name = str(
        payload.get("visitor_name") or payload.get("visitorName") or payload.get("name") or "Website visitor"
    ).strip() or "Website visitor"
    visitor_token = str(payload.get("visitor_token") or payload.get("visitorToken") or secrets.token_hex(18)).strip()
    channel = str(payload.get("channel") or "website").strip().lower() or "website"
    external_id = str(payload.get("external_id") or payload.get("externalId") or "").strip()
    cursor = conn.execute(
        """
        INSERT INTO chat_conversations (
            visitor_token, channel, external_id, visitor_name, email, phone, page_url, status, assigned_to, last_message, last_message_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        (
            visitor_token,
            channel,
            external_id,
            visitor_name,
            str(payload.get("email") or "").strip(),
            str(payload.get("phone") or "").strip(),
            str(payload.get("page_url") or payload.get("pageUrl") or "").strip(),
            normalize_chat_status(payload.get("status")),
            str(payload.get("assigned_to") or payload.get("assignedTo") or "").strip(),
            first_message,
        ),
    )
    conversation_id = cursor.lastrowid
    if first_message:
        conn.execute(
            "INSERT INTO chat_messages (conversation_id, sender, author, body) VALUES (?, ?, ?, ?)",
            (conversation_id, "visitor", visitor_name, first_message),
        )
    conn.commit()
    return get_chat_conversation(conn, {"id": conversation_id})


def get_or_create_chat_conversation(conn, payload):
    channel = str(payload.get("channel") or "website").strip().lower() or "website"
    external_id = str(payload.get("external_id") or payload.get("externalId") or "").strip()
    if channel and external_id:
        existing = conn.execute(
            "SELECT * FROM chat_conversations WHERE channel = ? AND external_id = ? ORDER BY id DESC LIMIT 1",
            (channel, external_id),
        ).fetchone()
        if existing is not None:
            visitor_name = str(
                payload.get("visitor_name") or payload.get("visitorName") or payload.get("name") or ""
            ).strip()
            phone = str(payload.get("phone") or "").strip()
            page_url = str(payload.get("page_url") or payload.get("pageUrl") or "").strip()
            conn.execute(
                """
                UPDATE chat_conversations
                SET visitor_name = COALESCE(NULLIF(?, ''), visitor_name),
                    phone = COALESCE(NULLIF(?, ''), phone),
                    page_url = COALESCE(NULLIF(?, ''), page_url),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (visitor_name, phone, page_url, existing["id"]),
            )
            conn.commit()
            return get_chat_conversation(conn, {"id": existing["id"]})
    return create_chat_conversation(conn, payload)


def create_chat_message(conn, payload):
    conversation_id = int(payload.get("conversation_id") or payload.get("conversationId") or 0)
    if conversation_id <= 0:
        raise ValueError("A valid conversation id is required.")
    body = str(payload.get("body") or payload.get("message") or payload.get("text") or "").strip()
    if not body:
        raise ValueError("Message body is required.")
    sender = normalize_chat_sender(payload.get("sender"))
    cursor = conn.execute(
        "INSERT INTO chat_messages (conversation_id, sender, author, body) VALUES (?, ?, ?, ?)",
        (
            conversation_id,
            sender,
            str(payload.get("author") or "").strip(),
            body,
        ),
    )
    next_status = "waiting" if sender == "visitor" else "replied" if sender == "staff" else None
    if next_status:
        conn.execute(
            """
            UPDATE chat_conversations
            SET last_message = ?, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP, status = ?
            WHERE id = ?
            """,
            (body, next_status, conversation_id),
        )
    else:
        conn.execute(
            """
            UPDATE chat_conversations
            SET last_message = ?, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (body, conversation_id),
        )
    conn.commit()
    row = conn.execute("SELECT * FROM chat_messages WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"message": row_to_dict(row)}


def update_chat_conversation(conn, payload):
    conversation_id = int(payload.get("id") or 0)
    if conversation_id <= 0:
        raise ValueError("A valid conversation id is required.")
    conn.execute(
        """
        UPDATE chat_conversations
        SET status = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            normalize_chat_status(payload.get("status")),
            str(payload.get("assigned_to") or payload.get("assignedTo") or "").strip(),
            conversation_id,
        ),
    )
    conn.commit()
    return get_chat_conversation(conn, {"id": conversation_id})


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "init"
    payload = read_payload()
    with connect() as conn:
        if command == "init":
            result = {"ok": True, "db_path": str(DB_PATH)}
        elif command == "list-products":
            result = list_products(conn)
        elif command == "create-product":
            result = create_product(conn, payload)
        elif command == "update-product":
            result = update_product(conn, payload)
        elif command == "delete-product":
            result = delete_product(conn, payload)
        elif command == "replace-products":
            result = replace_products(conn, payload)
        elif command == "list-quotes":
            result = list_quotes(conn)
        elif command == "create-quote":
            result = create_quote(conn, payload)
        elif command == "update-quote":
            result = update_quote(conn, payload)
        elif command == "list-admin-users":
            result = list_admin_users(conn)
        elif command == "list-admin-users-private":
            result = list_admin_users(conn, True)
        elif command == "create-admin-user":
            result = create_admin_user(conn, payload)
        elif command == "update-admin-user":
            result = update_admin_user(conn, payload)
        elif command == "delete-admin-user":
            result = delete_admin_user(conn, payload)
        elif command == "get-admin-setting":
            result = get_admin_setting(conn, payload)
        elif command == "update-admin-setting":
            result = update_admin_setting(conn, payload)
        elif command == "list-news-posts":
            result = list_news_posts(conn, payload)
        elif command == "create-news-post":
            result = create_news_post(conn, payload)
        elif command == "update-news-post":
            result = update_news_post(conn, payload)
        elif command == "delete-news-post":
            result = delete_news_post(conn, payload)
        elif command == "list-chat-conversations":
            result = list_chat_conversations(conn)
        elif command == "get-chat-conversation":
            result = get_chat_conversation(conn, payload)
        elif command == "create-chat-conversation":
            result = create_chat_conversation(conn, payload)
        elif command == "get-or-create-chat-conversation":
            result = get_or_create_chat_conversation(conn, payload)
        elif command == "create-chat-message":
            result = create_chat_message(conn, payload)
        elif command == "update-chat-conversation":
            result = update_chat_conversation(conn, payload)
        else:
            raise ValueError(f"Unknown command: {command}")
    print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
