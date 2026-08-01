import { runSqliteCommand } from "./_sqlite";
import { createPasswordHash } from "./_auth";
import { randomBytes } from "crypto";

type ProductPayload = Record<string, unknown>;
type QuotePayload = Record<string, unknown>;
type AdminUserPayload = Record<string, unknown>;
type AdminSettingPayload = Record<string, unknown>;
type NewsPayload = Record<string, unknown>;
type VideoPayload = Record<string, unknown>;
type ChatConversationPayload = Record<string, unknown>;
type ChatMessagePayload = Record<string, unknown>;
type QuoteUpdatePayload = {
  status?: unknown;
  admin_note?: unknown;
  adminNote?: unknown;
  assigned_to?: unknown;
  assignedTo?: unknown;
  follow_up_date?: unknown;
  followUpDate?: unknown;
  last_contacted_at?: unknown;
  lastContactedAt?: unknown;
  stage_notes?: unknown;
  stageNotes?: unknown;
};

type PgModule = typeof import("pg");
type PgPool = import("pg").Pool;

let pool: PgPool | null = null;

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

async function getPool() {
  if (pool) return pool;

  const { Pool } = (await import("pg")) as PgModule;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });
  await initPostgres(pool);
  return pool;
}

function normalizeProduct(payload: ProductPayload) {
  const category = String(payload.category || "").trim();
  const model = String(payload.model || "").trim();
  if (!category) throw new Error("Product category is required.");
  if (!model) throw new Error("Product model is required.");

  return {
    category,
    manufacturer: String(payload.manufacturer || "Generic").trim() || "Generic",
    model,
    capacity: Number(payload.capacity || 0),
    capacity_label: String(payload.capacity_label || payload.capacityLabel || "").trim(),
    voltage: Number(payload.voltage || 0),
    price: Number(payload.price || 0),
    surge_va: Number(payload.surge_va || payload.surgeVa || 0),
    hybrid_pv_current_a: Number(payload.hybrid_pv_current_a || payload.hybridPvCurrentA || 0),
    is_default: Boolean(payload.is_default || payload.isDefault || false),
    meta: payload.meta && typeof payload.meta === "object" ? payload.meta : {},
  };
}

function rowToProduct(row: Record<string, unknown>) {
  return {
    ...row,
    capacity: Number(row.capacity || 0),
    voltage: Number(row.voltage || 0),
    price: Number(row.price || 0),
    surge_va: Number(row.surge_va || 0),
    hybrid_pv_current_a: Number(row.hybrid_pv_current_a || 0),
    is_default: Boolean(row.is_default),
    meta: row.meta_json ? JSON.parse(String(row.meta_json || "{}")) : {},
  };
}

function rowToQuote(row: Record<string, unknown>) {
  return {
    id: row.id,
    client_name: row.client_name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    site_note: row.site_note,
    total_cost: Number(row.total_cost || 0),
    daily_energy_wh: Number(row.daily_energy_wh || 0),
    system_voltage: Number(row.system_voltage || 0),
    status: row.status || "new",
    admin_note: row.admin_note || "",
    assigned_to: row.assigned_to || "",
    follow_up_date: row.follow_up_date || "",
    last_contacted_at: row.last_contacted_at || "",
    stage_notes: row.stage_notes_json ? JSON.parse(String(row.stage_notes_json || "[]")) : [],
    created_at: row.created_at,
    quote: row.quote_json ? JSON.parse(String(row.quote_json || "{}")) : {},
  };
}

function normalizeAdminRole(value: unknown) {
  const role = String(value || "").trim();
  return ["Admin", "Sales", "Engineer", "Viewer"].includes(role) ? role : "Viewer";
}

function normalizeAdminUser(payload: AdminUserPayload) {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const rawPassword = String(payload.password || "").trim();
  const incomingHash = String(payload.password_hash || payload.passwordHash || "").trim();
  const password_hash = rawPassword ? createPasswordHash(rawPassword) : incomingHash;
  if (!name) throw new Error("User name is required.");
  return {
    name,
    email,
    role: normalizeAdminRole(payload.role),
    password_hash,
  };
}

function rowToAdminUser(row: Record<string, unknown>, includePasswordHash = false) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: normalizeAdminRole(row.role),
    ...(includePasswordHash ? { password_hash: row.password_hash || "" } : {}),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeNewsPost(payload: NewsPayload) {
  const title = String(payload.title || "").trim();
  if (!title) throw new Error("News title is required.");
  return {
    title,
    slug: String(payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).trim(),
    category: String(payload.category || "Company Updates").trim(),
    excerpt: String(payload.excerpt || "").trim(),
    body: String(payload.body || "").trim(),
    cover_image: String(payload.cover_image || payload.coverImage || "").trim(),
    author: String(payload.author || "TRI-P Tech").trim(),
    status: String(payload.status || "draft").trim() === "published" ? "published" : "draft",
    is_featured: Boolean(payload.is_featured || payload.isFeatured || false),
  };
}

function rowToNewsPost(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    excerpt: row.excerpt,
    body: row.body,
    cover_image: row.cover_image,
    author: row.author,
    status: row.status || "draft",
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeFeaturedVideo(payload: VideoPayload) {
  const title = String(payload.title || "").trim();
  const youtube_url = String(payload.youtube_url || payload.youtubeUrl || "").trim();
  if (!title) throw new Error("Video title is required.");
  if (!youtube_url) throw new Error("YouTube link is required.");
  return {
    title,
    youtube_url,
    summary: String(payload.summary || "").trim(),
    thumbnail_url: String(payload.thumbnail_url || payload.thumbnailUrl || "").trim(),
    sort_order: Number(payload.sort_order || payload.sortOrder || 0),
    is_published: payload.is_published === false || payload.isPublished === false ? false : true,
  };
}

function rowToFeaturedVideo(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    youtube_url: row.youtube_url,
    summary: row.summary || "",
    thumbnail_url: row.thumbnail_url || "",
    sort_order: Number(row.sort_order || 0),
    is_published: Boolean(row.is_published),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeChatStatus(value: unknown) {
  const status = String(value || "").trim().toLowerCase();
  return ["open", "waiting", "replied", "closed"].includes(status) ? status : "open";
}

function normalizeChatSender(value: unknown) {
  const sender = String(value || "").trim().toLowerCase();
  return ["visitor", "staff", "assistant", "system"].includes(sender) ? sender : "visitor";
}

function rowToChatConversation(row: Record<string, unknown>) {
  return {
    id: row.id,
    visitor_token: row.visitor_token || "",
    channel: row.channel || "website",
    external_id: row.external_id || "",
    visitor_name: row.visitor_name || "",
    email: row.email || "",
    phone: row.phone || "",
    page_url: row.page_url || "",
    status: normalizeChatStatus(row.status),
    assigned_to: row.assigned_to || "",
    last_message: row.last_message || "",
    last_message_at: row.last_message_at || row.created_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToChatMessage(row: Record<string, unknown>) {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender: normalizeChatSender(row.sender),
    author: row.author || "",
    body: row.body || "",
    created_at: row.created_at,
  };
}

function normalizeChatConversation(payload: ChatConversationPayload) {
  return {
    visitor_token: String(payload.visitor_token || payload.visitorToken || randomBytes(18).toString("hex")).trim(),
    channel: String(payload.channel || "website").trim().toLowerCase() || "website",
    external_id: String(payload.external_id || payload.externalId || "").trim(),
    visitor_name: String(payload.visitor_name || payload.visitorName || payload.name || "Website visitor").trim() || "Website visitor",
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    page_url: String(payload.page_url || payload.pageUrl || "").trim(),
    status: normalizeChatStatus(payload.status),
    assigned_to: String(payload.assigned_to || payload.assignedTo || "").trim(),
  };
}

function normalizeChatMessage(payload: ChatMessagePayload) {
  const body = String(payload.body || payload.message || payload.text || "").trim();
  if (!body) throw new Error("Message body is required.");
  return {
    conversation_id: Number(payload.conversation_id || payload.conversationId || 0),
    sender: normalizeChatSender(payload.sender),
    author: String(payload.author || "").trim(),
    body,
  };
}

function normalizeQuoteUpdate(payload: QuoteUpdatePayload) {
  const allowedStatuses = new Set(["new", "contacted", "inspection", "quoted", "won", "lost"]);
  const status = String(payload.status || "").trim().toLowerCase();
  return {
    status: allowedStatuses.has(status) ? status : "new",
    admin_note: String(payload.admin_note ?? payload.adminNote ?? "").trim(),
    assigned_to: String(payload.assigned_to ?? payload.assignedTo ?? "").trim(),
    follow_up_date: String(payload.follow_up_date ?? payload.followUpDate ?? "").trim(),
    last_contacted_at: String(payload.last_contacted_at ?? payload.lastContactedAt ?? "").trim(),
    stage_notes: Array.isArray(payload.stage_notes)
      ? payload.stage_notes
      : Array.isArray(payload.stageNotes)
        ? payload.stageNotes
        : [],
  };
}

async function initPostgres(db: PgPool) {
  await db.query(`
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
  `);

  await db.query(`
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
  `);

  await db.query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'");
  await db.query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS admin_note TEXT NOT NULL DEFAULT ''");
  await db.query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS assigned_to TEXT NOT NULL DEFAULT ''");
  await db.query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS follow_up_date TEXT NOT NULL DEFAULT ''");
  await db.query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS last_contacted_at TEXT NOT NULL DEFAULT ''");
  await db.query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS stage_notes_json TEXT NOT NULL DEFAULT '[]'");

  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'Viewer',
      password_hash TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_unique ON admin_users (lower(email)) WHERE email <> ''");
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS admin_users_name_unique ON admin_users (lower(name))");

  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS news_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'Company Updates',
      excerpt TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT 'TRI-P Tech',
      status TEXT NOT NULL DEFAULT 'draft',
      is_featured BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS featured_videos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      thumbnail_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id SERIAL PRIMARY KEY,
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
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await db.query("ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS visitor_token TEXT NOT NULL DEFAULT ''");
  await db.query("ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'website'");
  await db.query("ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS external_id TEXT NOT NULL DEFAULT ''");
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS chat_conversations_visitor_token_unique ON chat_conversations (visitor_token) WHERE visitor_token <> ''");
  await db.query("CREATE INDEX IF NOT EXISTS chat_conversations_channel_external_idx ON chat_conversations (channel, external_id)");

  await db.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      sender TEXT NOT NULL DEFAULT 'visitor',
      author TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function listProductsPostgres() {
  const db = await getPool();
  const result = await db.query(`
    SELECT * FROM products
    ORDER BY category ASC, manufacturer ASC, capacity ASC, model ASC
  `);
  return { products: result.rows.map(rowToProduct) };
}

async function getProductPostgres(id: number) {
  const db = await getPool();
  const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
  const row = result.rows[0];
  if (!row) throw new Error("Product not found.");
  return { product: rowToProduct(row) };
}

async function createProductPostgres(payload: ProductPayload) {
  const product = normalizeProduct(payload);
  const db = await getPool();
  const result = await db.query(
    `
    INSERT INTO products (
      category, manufacturer, model, capacity, capacity_label, voltage,
      price, surge_va, hybrid_pv_current_a, is_default, meta_json
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
    `,
    [
      product.category,
      product.manufacturer,
      product.model,
      product.capacity,
      product.capacity_label,
      product.voltage,
      product.price,
      product.surge_va,
      product.hybrid_pv_current_a,
      product.is_default,
      JSON.stringify(product.meta),
    ]
  );
  return { product: rowToProduct(result.rows[0]) };
}

async function updateProductPostgres(payload: ProductPayload) {
  const id = Number(payload.id || 0);
  if (!id) throw new Error("A valid product id is required.");
  const product = normalizeProduct(payload);
  const db = await getPool();
  const result = await db.query(
    `
    UPDATE products
    SET category = $1, manufacturer = $2, model = $3, capacity = $4,
      capacity_label = $5, voltage = $6, price = $7, surge_va = $8,
      hybrid_pv_current_a = $9, is_default = $10, meta_json = $11,
      updated_at = now()
    WHERE id = $12
    RETURNING *
    `,
    [
      product.category,
      product.manufacturer,
      product.model,
      product.capacity,
      product.capacity_label,
      product.voltage,
      product.price,
      product.surge_va,
      product.hybrid_pv_current_a,
      product.is_default,
      JSON.stringify(product.meta),
      id,
    ]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Product not found.");
  return { product: rowToProduct(row) };
}

async function deleteProductPostgres(id: number) {
  if (!id) throw new Error("A valid product id is required.");
  const db = await getPool();
  await db.query("DELETE FROM products WHERE id = $1", [id]);
  return { deleted: true, id };
}

async function replaceProductsPostgres(payload: ProductPayload) {
  const products = Array.isArray(payload.products) ? payload.products : [];
  const db = await getPool();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM products");
    for (const item of products) {
      const product = normalizeProduct(item as ProductPayload);
      await client.query(
        `
        INSERT INTO products (
          category, manufacturer, model, capacity, capacity_label, voltage,
          price, surge_va, hybrid_pv_current_a, is_default, meta_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          product.category,
          product.manufacturer,
          product.model,
          product.capacity,
          product.capacity_label,
          product.voltage,
          product.price,
          product.surge_va,
          product.hybrid_pv_current_a,
          product.is_default,
          JSON.stringify(product.meta),
        ]
      );
    }
    await client.query("COMMIT");
    return { saved: products.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listQuotesPostgres() {
  const db = await getPool();
  const result = await db.query("SELECT * FROM quote_requests ORDER BY created_at DESC, id DESC");
  return { quote_requests: result.rows.map(rowToQuote) };
}

async function createQuotePostgres(payload: QuotePayload) {
  const quote = payload.quote && typeof payload.quote === "object" ? payload.quote : payload;
  const db = await getPool();
  const result = await db.query(
    `
    INSERT INTO quote_requests (
      client_name, email, phone, location, site_note, total_cost,
      daily_energy_wh, system_voltage, quote_json
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
    `,
    [
      String(payload.client_name || payload.clientName || "").trim(),
      String(payload.email || payload.client_email || payload.clientEmail || "").trim(),
      String(payload.phone || "").trim(),
      String(payload.location || "").trim(),
      String(payload.site_note || payload.siteNote || "").trim(),
      Number(payload.total_cost || payload.totalCost || 0),
      Number(payload.daily_energy_wh || payload.dailyEnergyWh || 0),
      Number(payload.system_voltage || payload.systemVoltage || 0),
      JSON.stringify(quote),
    ]
  );
  return { quote_request: rowToQuote(result.rows[0]) };
}

async function updateQuotePostgres(id: number, payload: QuoteUpdatePayload) {
  if (!id) throw new Error("A valid quote request id is required.");
  const quoteUpdate = normalizeQuoteUpdate(payload);
  const db = await getPool();
  const result = await db.query(
    `
    UPDATE quote_requests
    SET status = $1, admin_note = $2, assigned_to = $3, follow_up_date = $4,
      last_contacted_at = $5, stage_notes_json = $6
    WHERE id = $7
    RETURNING *
    `,
    [
      quoteUpdate.status,
      quoteUpdate.admin_note,
      quoteUpdate.assigned_to,
      quoteUpdate.follow_up_date,
      quoteUpdate.last_contacted_at,
      JSON.stringify(quoteUpdate.stage_notes),
      id,
    ]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Quote request not found.");
  return { quote_request: rowToQuote(row) };
}

async function listAdminUsersPostgres() {
  const db = await getPool();
  const result = await db.query("SELECT * FROM admin_users ORDER BY name ASC");
  return { users: result.rows.map((row) => rowToAdminUser(row)) };
}

async function listAdminUsersForLoginPostgres() {
  const db = await getPool();
  const result = await db.query("SELECT * FROM admin_users ORDER BY name ASC");
  return result.rows.map((row) => rowToAdminUser(row, true));
}

async function createAdminUserPostgres(payload: AdminUserPayload) {
  const user = normalizeAdminUser(payload);
  if (!user.password_hash) throw new Error("User password is required.");
  const db = await getPool();
  const result = await db.query(
    `
    INSERT INTO admin_users (name, email, role, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [user.name, user.email, user.role, user.password_hash]
  );
  return { user: rowToAdminUser(result.rows[0]) };
}

async function updateAdminUserPostgres(id: number, payload: AdminUserPayload) {
  if (!id) throw new Error("A valid user id is required.");
  const db = await getPool();
  const current = await db.query("SELECT * FROM admin_users WHERE id = $1", [id]);
  if (!current.rows[0]) throw new Error("User not found.");
  const rawPassword = String(payload.password || "").trim();
  const user = {
    name: String(payload.name ?? current.rows[0].name ?? "").trim(),
    email: String(payload.email ?? current.rows[0].email ?? "").trim(),
    role: normalizeAdminRole(payload.role ?? current.rows[0].role),
    password_hash: rawPassword
      ? createPasswordHash(rawPassword)
      : String(payload.password_hash || payload.passwordHash || current.rows[0].password_hash || "").trim(),
  };
  if (!user.name) throw new Error("User name is required.");
  const result = await db.query(
    `
    UPDATE admin_users
    SET name = $1, email = $2, role = $3, password_hash = $4, updated_at = now()
    WHERE id = $5
    RETURNING *
    `,
    [user.name, user.email, user.role, user.password_hash, id]
  );
  return { user: rowToAdminUser(result.rows[0]) };
}

async function deleteAdminUserPostgres(id: number) {
  if (!id) throw new Error("A valid user id is required.");
  const db = await getPool();
  await db.query("DELETE FROM admin_users WHERE id = $1", [id]);
  return { deleted: true, id };
}

async function getAdminSettingPostgres(key: string) {
  const db = await getPool();
  const result = await db.query("SELECT value FROM admin_settings WHERE key = $1", [key]);
  return String(result.rows[0]?.value || "");
}

async function updateAdminSettingPostgres(payload: AdminSettingPayload) {
  const key = String(payload.key || "").trim();
  const value = String(payload.value || "").trim();
  if (!key) throw new Error("Setting key is required.");
  const db = await getPool();
  await db.query(
    `
    INSERT INTO admin_settings (key, value, updated_at)
    VALUES ($1, $2, now())
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `,
    [key, value]
  );
  return { saved: true };
}

async function listNewsPostgres(includeDrafts = false) {
  const db = await getPool();
  const result = await db.query(
    `
    SELECT * FROM news_posts
    ${includeDrafts ? "" : "WHERE status = 'published'"}
    ORDER BY is_featured DESC, updated_at DESC, created_at DESC
    `
  );
  return { posts: result.rows.map(rowToNewsPost) };
}

async function createNewsPostPostgres(payload: NewsPayload) {
  const post = normalizeNewsPost(payload);
  const db = await getPool();
  const result = await db.query(
    `
    INSERT INTO news_posts (
      title, slug, category, excerpt, body, cover_image, author, status, is_featured
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [post.title, post.slug, post.category, post.excerpt, post.body, post.cover_image, post.author, post.status, post.is_featured]
  );
  return { post: rowToNewsPost(result.rows[0]) };
}

async function updateNewsPostPostgres(id: number, payload: NewsPayload) {
  if (!id) throw new Error("A valid news post id is required.");
  const post = normalizeNewsPost(payload);
  const db = await getPool();
  const result = await db.query(
    `
    UPDATE news_posts
    SET title = $1, slug = $2, category = $3, excerpt = $4, body = $5,
      cover_image = $6, author = $7, status = $8, is_featured = $9, updated_at = now()
    WHERE id = $10
    RETURNING *
    `,
    [post.title, post.slug, post.category, post.excerpt, post.body, post.cover_image, post.author, post.status, post.is_featured, id]
  );
  const row = result.rows[0];
  if (!row) throw new Error("News post not found.");
  return { post: rowToNewsPost(row) };
}

async function deleteNewsPostPostgres(id: number) {
  if (!id) throw new Error("A valid news post id is required.");
  const db = await getPool();
  await db.query("DELETE FROM news_posts WHERE id = $1", [id]);
  return { deleted: true, id };
}

async function listFeaturedVideosPostgres(includeDrafts = false) {
  const db = await getPool();
  const result = await db.query(
    `
    SELECT * FROM featured_videos
    ${includeDrafts ? "" : "WHERE is_published = true"}
    ORDER BY sort_order ASC, updated_at DESC, id DESC
    `
  );
  return { videos: result.rows.map(rowToFeaturedVideo) };
}

async function createFeaturedVideoPostgres(payload: VideoPayload) {
  const video = normalizeFeaturedVideo(payload);
  const db = await getPool();
  const result = await db.query(
    `
    INSERT INTO featured_videos (
      title, youtube_url, summary, thumbnail_url, sort_order, is_published
    ) VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
    [video.title, video.youtube_url, video.summary, video.thumbnail_url, video.sort_order, video.is_published]
  );
  return { video: rowToFeaturedVideo(result.rows[0]) };
}

async function updateFeaturedVideoPostgres(id: number, payload: VideoPayload) {
  if (!id) throw new Error("A valid video id is required.");
  const video = normalizeFeaturedVideo(payload);
  const db = await getPool();
  const result = await db.query(
    `
    UPDATE featured_videos
    SET title = $1, youtube_url = $2, summary = $3, thumbnail_url = $4,
      sort_order = $5, is_published = $6, updated_at = now()
    WHERE id = $7
    RETURNING *
    `,
    [video.title, video.youtube_url, video.summary, video.thumbnail_url, video.sort_order, video.is_published, id]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Video not found.");
  return { video: rowToFeaturedVideo(row) };
}

async function deleteFeaturedVideoPostgres(id: number) {
  if (!id) throw new Error("A valid video id is required.");
  const db = await getPool();
  await db.query("DELETE FROM featured_videos WHERE id = $1", [id]);
  return { deleted: true, id };
}

async function listChatConversationsPostgres() {
  const db = await getPool();
  const result = await db.query(`
    SELECT * FROM chat_conversations
    ORDER BY last_message_at DESC, id DESC
  `);
  return { conversations: result.rows.map(rowToChatConversation) };
}

async function getChatConversationPostgres(id: number) {
  if (!id) throw new Error("A valid conversation id is required.");
  const db = await getPool();
  const conversation = await db.query("SELECT * FROM chat_conversations WHERE id = $1", [id]);
  if (!conversation.rows[0]) throw new Error("Conversation not found.");
  const messages = await db.query("SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC, id ASC", [id]);
  return {
    conversation: rowToChatConversation(conversation.rows[0]),
    messages: messages.rows.map(rowToChatMessage),
  };
}

async function createChatConversationPostgres(payload: ChatConversationPayload) {
  const chat = normalizeChatConversation(payload);
  const firstMessage = String(payload.message || payload.body || payload.text || "").trim();
  const db = await getPool();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const conversation = await client.query(
      `
      INSERT INTO chat_conversations (
        visitor_token, channel, external_id, visitor_name, email, phone, page_url, status, assigned_to,
        last_message, last_message_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
      RETURNING *
      `,
      [chat.visitor_token, chat.channel, chat.external_id, chat.visitor_name, chat.email, chat.phone, chat.page_url, chat.status, chat.assigned_to, firstMessage]
    );
    if (firstMessage) {
      await client.query(
        "INSERT INTO chat_messages (conversation_id, sender, author, body) VALUES ($1,$2,$3,$4)",
        [conversation.rows[0].id, "visitor", chat.visitor_name, firstMessage]
      );
    }
    await client.query("COMMIT");
    return getChatConversationPostgres(Number(conversation.rows[0].id));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getOrCreateChatConversationPostgres(payload: ChatConversationPayload) {
  const chat = normalizeChatConversation(payload);
  if (chat.channel && chat.external_id) {
    const db = await getPool();
    const existing = await db.query(
      "SELECT * FROM chat_conversations WHERE channel = $1 AND external_id = $2 ORDER BY id DESC LIMIT 1",
      [chat.channel, chat.external_id]
    );
    if (existing.rows[0]) {
      const updated = await db.query(
        `
        UPDATE chat_conversations
        SET visitor_name = COALESCE(NULLIF($1, ''), visitor_name),
          phone = COALESCE(NULLIF($2, ''), phone),
          page_url = COALESCE(NULLIF($3, ''), page_url),
          updated_at = now()
        WHERE id = $4
        RETURNING *
        `,
        [chat.visitor_name, chat.phone, chat.page_url, existing.rows[0].id]
      );
      return getChatConversationPostgres(Number(updated.rows[0].id));
    }
  }
  return createChatConversationPostgres(payload);
}

async function createChatMessagePostgres(payload: ChatMessagePayload) {
  const message = normalizeChatMessage(payload);
  if (!message.conversation_id) throw new Error("A valid conversation id is required.");
  const db = await getPool();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      "INSERT INTO chat_messages (conversation_id, sender, author, body) VALUES ($1,$2,$3,$4) RETURNING *",
      [message.conversation_id, message.sender, message.author, message.body]
    );
    const nextStatus = message.sender === "visitor" ? "waiting" : message.sender === "staff" ? "replied" : undefined;
    await client.query(
      `
      UPDATE chat_conversations
      SET last_message = $1, last_message_at = now(), updated_at = now()
        ${nextStatus ? ", status = $3" : ""}
      WHERE id = $2
      `,
      nextStatus ? [message.body, message.conversation_id, nextStatus] : [message.body, message.conversation_id]
    );
    await client.query("COMMIT");
    return { message: rowToChatMessage(inserted.rows[0]) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateChatConversationPostgres(id: number, payload: ChatConversationPayload) {
  if (!id) throw new Error("A valid conversation id is required.");
  const db = await getPool();
  const result = await db.query(
    `
    UPDATE chat_conversations
    SET status = $1, assigned_to = $2, updated_at = now()
    WHERE id = $3
    RETURNING *
    `,
    [
      normalizeChatStatus(payload.status),
      String(payload.assigned_to || payload.assignedTo || "").trim(),
      id,
    ]
  );
  if (!result.rows[0]) throw new Error("Conversation not found.");
  return { conversation: rowToChatConversation(result.rows[0]) };
}

export async function listProducts() {
  if (hasDatabaseUrl()) return listProductsPostgres();
  return runSqliteCommand("list-products");
}

export async function createProduct(payload: ProductPayload) {
  if (hasDatabaseUrl()) return createProductPostgres(payload);
  return runSqliteCommand("create-product", payload);
}

export async function updateProduct(id: string, payload: ProductPayload) {
  const nextPayload = { ...payload, id };
  if (hasDatabaseUrl()) return updateProductPostgres(nextPayload);
  return runSqliteCommand("update-product", nextPayload);
}

export async function deleteProduct(id: string) {
  if (hasDatabaseUrl()) return deleteProductPostgres(Number(id));
  return runSqliteCommand("delete-product", { id });
}

export async function replaceProducts(payload: ProductPayload) {
  if (hasDatabaseUrl()) return replaceProductsPostgres(payload);
  return runSqliteCommand("replace-products", payload);
}

export async function listQuotes() {
  if (hasDatabaseUrl()) return listQuotesPostgres();
  return runSqliteCommand("list-quotes");
}

export async function createQuote(payload: QuotePayload) {
  if (hasDatabaseUrl()) return createQuotePostgres(payload);
  return runSqliteCommand("create-quote", payload);
}

export async function updateQuote(id: string, payload: QuoteUpdatePayload) {
  const nextPayload = { ...payload, id };
  if (hasDatabaseUrl()) return updateQuotePostgres(Number(id), nextPayload);
  return runSqliteCommand("update-quote", nextPayload);
}

export async function listAdminUsers() {
  if (hasDatabaseUrl()) return listAdminUsersPostgres();
  return runSqliteCommand("list-admin-users");
}

export async function listAdminUsersForLogin() {
  if (hasDatabaseUrl()) return listAdminUsersForLoginPostgres();
  const result = await runSqliteCommand("list-admin-users-private");
  return Array.isArray(result.users) ? result.users : [];
}

export async function createAdminUser(payload: AdminUserPayload) {
  if (hasDatabaseUrl()) return createAdminUserPostgres(payload);
  const password = String(payload.password || "").trim();
  return runSqliteCommand("create-admin-user", {
    ...payload,
    ...(password ? { password_hash: createPasswordHash(password), password: undefined } : {}),
  });
}

export async function updateAdminUser(id: string, payload: AdminUserPayload) {
  const nextPayload = { ...payload, id };
  if (hasDatabaseUrl()) return updateAdminUserPostgres(Number(id), nextPayload);
  const password = String(payload.password || "").trim();
  return runSqliteCommand("update-admin-user", {
    ...nextPayload,
    ...(password ? { password_hash: createPasswordHash(password), password: undefined } : {}),
  });
}

export async function deleteAdminUser(id: string) {
  if (hasDatabaseUrl()) return deleteAdminUserPostgres(Number(id));
  return runSqliteCommand("delete-admin-user", { id });
}

export async function getMasterPasswordHash() {
  if (hasDatabaseUrl()) return getAdminSettingPostgres("master_password_hash");
  const result = await runSqliteCommand("get-admin-setting", { key: "master_password_hash" });
  return String(result.value || "");
}

export async function updateMasterPassword(password: string) {
  const value = createPasswordHash(password);
  if (hasDatabaseUrl()) return updateAdminSettingPostgres({ key: "master_password_hash", value });
  return runSqliteCommand("update-admin-setting", { key: "master_password_hash", value });
}

export async function listNewsPosts(includeDrafts = false) {
  if (hasDatabaseUrl()) return listNewsPostgres(includeDrafts);
  return runSqliteCommand("list-news-posts", { include_drafts: includeDrafts });
}

export async function createNewsPost(payload: NewsPayload) {
  if (hasDatabaseUrl()) return createNewsPostPostgres(payload);
  return runSqliteCommand("create-news-post", payload);
}

export async function updateNewsPost(id: string, payload: NewsPayload) {
  if (hasDatabaseUrl()) return updateNewsPostPostgres(Number(id), payload);
  return runSqliteCommand("update-news-post", { ...payload, id });
}

export async function deleteNewsPost(id: string) {
  if (hasDatabaseUrl()) return deleteNewsPostPostgres(Number(id));
  return runSqliteCommand("delete-news-post", { id });
}

export async function listFeaturedVideos(includeDrafts = false) {
  if (hasDatabaseUrl()) return listFeaturedVideosPostgres(includeDrafts);
  return { videos: [] };
}

export async function createFeaturedVideo(payload: VideoPayload) {
  if (hasDatabaseUrl()) return createFeaturedVideoPostgres(payload);
  throw new Error("Featured videos require the production database.");
}

export async function updateFeaturedVideo(id: string, payload: VideoPayload) {
  if (hasDatabaseUrl()) return updateFeaturedVideoPostgres(Number(id), payload);
  throw new Error("Featured videos require the production database.");
}

export async function deleteFeaturedVideo(id: string) {
  if (hasDatabaseUrl()) return deleteFeaturedVideoPostgres(Number(id));
  throw new Error("Featured videos require the production database.");
}

export async function listChatConversations() {
  if (hasDatabaseUrl()) return listChatConversationsPostgres();
  return runSqliteCommand("list-chat-conversations");
}

export async function getChatConversation(id: string) {
  if (hasDatabaseUrl()) return getChatConversationPostgres(Number(id));
  return runSqliteCommand("get-chat-conversation", { id });
}

export async function createChatConversation(payload: ChatConversationPayload) {
  if (hasDatabaseUrl()) return createChatConversationPostgres(payload);
  return runSqliteCommand("create-chat-conversation", payload);
}

export async function getOrCreateChatConversation(payload: ChatConversationPayload) {
  if (hasDatabaseUrl()) return getOrCreateChatConversationPostgres(payload);
  return runSqliteCommand("get-or-create-chat-conversation", payload);
}

export async function createChatMessage(payload: ChatMessagePayload) {
  if (hasDatabaseUrl()) return createChatMessagePostgres(payload);
  return runSqliteCommand("create-chat-message", payload);
}

export async function updateChatConversation(id: string, payload: ChatConversationPayload) {
  if (hasDatabaseUrl()) return updateChatConversationPostgres(Number(id), payload);
  return runSqliteCommand("update-chat-conversation", { ...payload, id });
}
