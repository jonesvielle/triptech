"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultCatalogue } from "./defaults";
import { formatNaira } from "./format";

type DbProduct = {
  id: number;
  category: string;
  manufacturer: string;
  model: string;
  capacity: number;
  capacity_label: string;
  voltage: number;
  price: number;
  surge_va: number;
  hybrid_pv_current_a: number;
  is_default: boolean;
};

type StageNote = {
  status: QuoteStatus;
  note: string;
  employee: string;
  created_at: string;
};

type QuoteRequest = {
  id: number;
  client_name: string;
  email: string;
  phone: string;
  location: string;
  site_note: string;
  total_cost: number;
  daily_energy_wh: number;
  system_voltage: number;
  status?: QuoteStatus;
  admin_note?: string;
  assigned_to?: string;
  follow_up_date?: string;
  last_contacted_at?: string;
  stage_notes?: StageNote[];
  created_at: string;
  quote?: {
    requestType?: string;
    source?: string;
    message?: string;
    firstName?: string;
    lastName?: string;
    propertyType?: string;
    cameraCount?: number;
    entryPoints?: number;
    exitPoints?: number;
    remoteViewing?: string;
    loads?: Array<{
      appliance?: string;
      quantity?: number;
      watts?: number;
      dayHours?: number;
      nightHours?: number;
      cyclePercent?: number;
    }>;
    recommendation?: {
      selectedPanel?: { label?: string };
      selectedBattery?: { label?: string };
      selectedInverter?: { label?: string };
      selectedController?: { label?: string };
      panelCount?: number;
      batteryCount?: number;
      inverterCount?: number;
      controllerCount?: number;
      pvConfigurationLabel?: string;
      quoteLines?: Array<{
        name?: string;
        description?: string;
        quantity?: number;
        rate?: number;
        amount?: number;
      }>;
      engineeringData?: Array<{ label?: string; value?: string }>;
    };
  };
};

type ProductForm = Omit<DbProduct, "id" | "is_default"> & {
  is_default?: boolean;
};

type QuoteStatus = "new" | "contacted" | "inspection" | "quoted" | "won" | "lost";
export type SolarAdminSection = "dashboard" | "requests" | "messages" | "team" | "settings" | "help" | "news" | "products" | "protection" | "accessories";
type RequestPriorityFilter = "all" | "open" | "overdue" | "due-soon" | "high-value" | "unassigned";
type ContactAction = "call" | "whatsapp" | "email" | "reply" | "site-visit";
type TrendRange = 7 | 14 | 30 | 90;
type DashboardGraphMetric = "value" | "requests" | "average";
type CatalogueHealthFilter = "all" | "default" | "missing-price" | "missing-capacity" | "missing-voltage";
type TeamRole = "Admin" | "Sales" | "Engineer" | "Viewer";
type NewsStatus = "draft" | "published";
type NewsPost = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  cover_image: string;
  author: string;
  status: NewsStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};
type NewsForm = Omit<NewsPost, "id" | "created_at" | "updated_at">;
type FeaturedVideo = {
  id: number;
  title: string;
  youtube_url: string;
  summary: string;
  thumbnail_url: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
type FeaturedVideoForm = Omit<FeaturedVideo, "id" | "created_at" | "updated_at">;
type ChatStatus = "open" | "waiting" | "replied" | "closed";
type ChatConversation = {
  id: number;
  visitor_name: string;
  email: string;
  phone: string;
  channel: string;
  external_id: string;
  page_url: string;
  status: ChatStatus;
  assigned_to: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};
type ChatMessage = {
  id: number;
  conversation_id: number;
  sender: "visitor" | "staff" | "assistant" | "system";
  author: string;
  body: string;
  created_at: string;
};
type TeamMember = {
  id: string | number;
  name: string;
  email: string;
  role: TeamRole;
  password_hash?: string;
};
type TeamForm = {
  name: string;
  email: string;
  role: TeamRole;
  password: string;
};

type SolarAdminAppProps = {
  activeSection?: SolarAdminSection;
  onSectionChange?: (section: SolarAdminSection) => void;
  currentUser?: {
    name: string;
    email: string;
    role: TeamRole;
  };
  onOpenMobileMenu?: () => void;
};

const quoteStatuses = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["inspection", "Inspection"],
  ["quoted", "Quoted"],
  ["won", "Won"],
  ["lost", "Lost"],
] as const;

const chatStatuses = [
  ["open", "Open"],
  ["waiting", "Waiting"],
  ["replied", "Replied"],
  ["closed", "Closed"],
] as const;

const defaultStaff = ["Tobi", "Admin", "Sales team", "Site engineer"] as const;
const defaultTeamMembers: TeamMember[] = [
  { id: "tobi", name: "Tobi", email: "tobi@tri-p.tech", role: "Admin" },
  { id: "sales-team", name: "Sales team", email: "sales@tri-p.tech", role: "Sales" },
  { id: "site-engineer", name: "Site engineer", email: "engineer@tri-p.tech", role: "Engineer" },
];
const teamRoleOptions: TeamRole[] = ["Admin", "Sales", "Engineer", "Viewer"];
const legacyTeamStorageKey = "tri-p-solar-admin-team";

const newsCategories = [
  "Company Updates",
  "Project Stories",
  "Solar Education",
  "Market Updates",
  "Customer Notices",
] as const;

const emptyNewsForm: NewsForm = {
  title: "",
  slug: "",
  category: "Company Updates",
  excerpt: "",
  body: "",
  cover_image: "",
  author: "TRI-P Tech",
  status: "draft",
  is_featured: false,
};

const emptyVideoForm: FeaturedVideoForm = {
  title: "",
  youtube_url: "",
  summary: "",
  thumbnail_url: "",
  sort_order: 0,
  is_published: true,
};

const contactActions = [
  ["call", "Call attempted", "Called client."] ,
  ["whatsapp", "WhatsApp sent", "Sent WhatsApp follow-up."] ,
  ["email", "Email sent", "Sent email follow-up."] ,
  ["reply", "Client replied", "Client replied to follow-up."] ,
  ["site-visit", "Site visit booked", "Site visit booked with client."] ,
] as const;

const categoryOptions = [
  ["panel", "Solar panel"],
  ["battery", "Battery bank"],
  ["hybrid-inverter", "Hybrid inverter"],
  ["non-hybrid-inverter", "Non-hybrid inverter"],
  ["controller", "Charge controller (CC)"],
  ["dc-breaker", "DC breaker"],
  ["ac-breaker", "AC breaker"],
  ["dc-spd", "DC surge protector"],
  ["ac-spd", "AC surge protector"],
  ["avr", "AVR"],
  ["knife-switch", "Knife switch"],
  ["combiner-box", "Combiner box"],
  ["breaker-box", "Breaker box"],
  ["ac-cable", "AC cable"],
  ["pv-cable", "PV cable"],
  ["earthing-cable", "Earthing cable"],
  ["battery-cable", "Battery cable"],
  ["solar-rail", "Solar mounting rail"],
  ["nails-fasteners", "Nails/fasteners"],
  ["lugs", "Cable lugs"],
  ["tape", "Tape"],
  ["zip-tie", "Zip tie"],
  ["mounting", "Mounting/accessories"],
] as const;

const protectionSections = [
  { key: "protection-breakers", title: "Protection - breakers", kinds: ["dc-breaker", "ac-breaker", "breaker-box"] },
  { key: "protection-surge-avr", title: "Protection - surge & AVR", kinds: ["dc-spd", "ac-spd", "avr"] },
  { key: "protection-switchgear", title: "Protection - switchgear", kinds: ["knife-switch", "combiner-box"] },
  { key: "protection-cables", title: "Protection - cables", kinds: ["ac-cable", "pv-cable", "earthing-cable", "battery-cable"] },
  { key: "protection-mounting", title: "Mounting accessories", kinds: ["solar-rail", "nails-fasteners", "mounting"] },
  { key: "protection-consumables", title: "Consumables", kinds: ["lugs", "tape", "zip-tie"] },
];

const starterProducts = [
  ...defaultCatalogue.panels.map((item) => ({
    category: "panel",
    manufacturer: item.manufacturer,
    model: item.label,
    capacity: item.watts,
    capacity_label: item.label,
    voltage: 0,
    price: item.price,
    is_default: Boolean(item.isDefault),
  })),
  ...defaultCatalogue.batteries.map((item) => ({
    category: "battery",
    manufacturer: item.manufacturer,
    model: item.label,
    capacity: item.wh,
    capacity_label: item.label,
    voltage: item.voltage,
    price: item.price,
    is_default: Boolean(item.isDefault),
  })),
  ...defaultCatalogue.inverters.map((item) => ({
    category: item.type === "hybrid" ? "hybrid-inverter" : "non-hybrid-inverter",
    manufacturer: item.manufacturer,
    model: item.label,
    capacity: item.va,
    capacity_label: item.label,
    voltage: item.voltage,
    price: item.price,
    surge_va: item.surgeVa,
    hybrid_pv_current_a: item.hybridPvCurrentA || 0,
    is_default: Boolean(item.isDefault),
  })),
  ...defaultCatalogue.controllers.map((item) => ({
    category: "controller",
    manufacturer: item.manufacturer,
    model: item.label,
    capacity: item.amps,
    capacity_label: item.label,
    voltage: 0,
    price: item.price,
    is_default: Boolean(item.isDefault),
  })),
  ...defaultCatalogue.protection.map((item) => ({
    category: item.kind,
    manufacturer: item.manufacturer,
    model: item.label,
    capacity: item.capacity,
    capacity_label: item.label,
    voltage: item.poles || 0,
    price: item.price,
    is_default: Boolean(item.isDefault),
  })),
];

const emptyForm: ProductForm = {
  category: "panel",
  manufacturer: "Generic",
  model: "",
  capacity: 0,
  capacity_label: "",
  voltage: 0,
  price: 0,
  surge_va: 0,
  hybrid_pv_current_a: 0,
};

function normalized(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function duplicateProduct(products: DbProduct[], candidate: ProductForm, ignoreId?: number) {
  return products.some((product) =>
    product.id !== ignoreId &&
    normalized(product.category) === normalized(candidate.category) &&
    normalized(product.manufacturer) === normalized(candidate.manufacturer) &&
    normalized(product.model) === normalized(candidate.model) &&
    Number(product.capacity) === Number(candidate.capacity) &&
    Number(product.voltage || 0) === Number(candidate.voltage || 0)
  );
}

function groupProducts(products: DbProduct[]) {
  const baseGroups = [
    { key: "panel", title: "Solar panels", products: products.filter((product) => product.category === "panel") },
    { key: "controller", title: "Charge controllers", products: products.filter((product) => product.category === "controller") },
    { key: "battery", title: "Batteries", products: products.filter((product) => product.category === "battery") },
    { key: "hybrid-inverter", title: "Hybrid inverters", products: products.filter((product) => product.category === "hybrid-inverter") },
    { key: "non-hybrid-inverter", title: "Non-hybrid inverters", products: products.filter((product) => product.category === "non-hybrid-inverter") },
  ];
  const protectionGroups = protectionSections.map((section) => ({
    key: section.key,
    title: section.title,
    products: products.filter((product) => section.kinds.includes(product.category)),
  }));
  return [...baseGroups, ...protectionGroups].filter((group) => group.products.length);
}

function categoryLabel(category: string) {
  return categoryOptions.find(([value]) => value === category)?.[1] || category;
}

function voltageLabel(product: DbProduct | ProductForm) {
  if (product.category === "knife-switch" && product.voltage) return `${product.voltage}P`;
  return product.voltage ? `${product.voltage}V` : "N/A";
}

function displayCapacity(product: DbProduct | ProductForm) {
  return product.capacity_label || product.capacity.toLocaleString();
}

function rowPrice(product: DbProduct) {
  return product.category.includes("cable") || product.category === "mounting"
    ? `${formatNaira(product.price)}/unit`
    : formatNaira(product.price);
}

function productFieldApplies(category: string, key: keyof ProductForm) {
  if (["manufacturer", "model", "capacity_label", "price", "is_default"].includes(String(key))) return true;
  if (key === "capacity") return ["panel", "battery", "hybrid-inverter", "non-hybrid-inverter", "controller"].includes(category);
  if (key === "voltage") return ["battery", "hybrid-inverter", "non-hybrid-inverter", "knife-switch"].includes(category);
  if (key === "surge_va") return category.includes("inverter");
  if (key === "hybrid_pv_current_a") return category === "hybrid-inverter";
  return false;
}

function isRequiredProductField(category: string, key: keyof ProductForm) {
  if (["manufacturer", "model", "price"].includes(String(key))) return true;
  if (key === "capacity") return productFieldApplies(category, key);
  if (key === "voltage") return ["battery", "hybrid-inverter", "non-hybrid-inverter"].includes(category);
  if (key === "surge_va") return category.includes("inverter");
  if (key === "hybrid_pv_current_a") return category === "hybrid-inverter";
  return false;
}

function productFieldLabel(category: string, key: keyof ProductForm, fallback: string) {
  if (key === "capacity") {
    if (category === "panel") return "Panel wattage (W)";
    if (category === "battery") return "Battery capacity (Wh)";
    if (category.includes("inverter")) return "Continuous output (VA)";
    if (category === "controller") return "Controller current rating (A)";
    return "Capacity / rating";
  }
  if (key === "capacity_label") return "Display label";
  if (key === "voltage") {
    if (category === "knife-switch") return "Switch poles";
    return "System voltage (V)";
  }
  if (key === "surge_va") {
    if (category === "non-hybrid-inverter") return "Non-hybrid inverter surge / peak output (VA)";
    if (category === "hybrid-inverter") return "Hybrid inverter surge / peak output (VA)";
    return "Surge / peak output (VA)";
  }
  if (key === "hybrid_pv_current_a") return "Hybrid PV input current limit (A)";
  return fallback;
}

function productFieldHelp(category: string, key: keyof ProductForm) {
  if (key === "manufacturer") return "Enter the product brand or supplier name. Duplicate checks are done within the same brand.";
  if (key === "model") return "Enter the exact model or catalogue name admins will recognize later.";
  if (key === "price") return "Enter current catalogue price in naira. Do not add commas or currency symbols.";
  if (key === "capacity") {
    if (category === "panel") return "Example: 550 for a 550W panel.";
    if (category === "battery") return "Enter usable catalogue size in Wh, for example 5000 for 5kWh.";
    if (category.includes("inverter")) return "Enter the inverter continuous VA rating, not kVA text.";
    if (category === "controller") return "Example: 60 for a 60A charge controller.";
  }
  if (key === "capacity_label") return "What admins/users see, for example 5kVA 48V hybrid.";
  if (key === "voltage" && category.includes("inverter")) return "Use the inverter DC battery voltage: 12, 24, or 48.";
  if (key === "voltage" && category === "battery") return "Use the battery bank voltage: 12, 24, or 48.";
  if (key === "surge_va") {
    if (category === "non-hybrid-inverter") return "Enter the non-hybrid inverter startup/peak VA from its datasheet. It must be equal to or higher than continuous output.";
    if (category === "hybrid-inverter") return "Enter the hybrid inverter startup/peak VA from its datasheet. It must be equal to or higher than continuous output.";
    return "Enter the inverter startup/peak VA. It should not be lower than continuous VA.";
  }
  if (key === "hybrid_pv_current_a") return "Enter PV input current in amps from the hybrid inverter datasheet. Do not enter PV watts here.";
  return "";
}

function isPositiveNumber(value: unknown) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function productPayload(form: ProductForm) {
  const category = form.category;
  return {
    ...form,
    category,
    manufacturer: form.manufacturer.trim() || "Generic",
    model: form.model.trim(),
    capacity_label: form.capacity_label.trim() || form.model.trim(),
    capacity: productFieldApplies(category, "capacity") ? Number(form.capacity || 0) : 0,
    voltage: productFieldApplies(category, "voltage") ? Number(form.voltage || 0) : 0,
    price: Number(form.price || 0),
    surge_va: productFieldApplies(category, "surge_va") ? Number(form.surge_va || 0) : 0,
    hybrid_pv_current_a: productFieldApplies(category, "hybrid_pv_current_a") ? Number(form.hybrid_pv_current_a || 0) : 0,
  };
}

function validateProductPayload(payload: ProductForm) {
  if (!payload.model.trim()) return "Enter product model/name.";
  if (productFieldApplies(payload.category, "capacity") && !isPositiveNumber(payload.capacity)) return "Enter a valid capacity/rating above 0.";
  if (!isPositiveNumber(payload.price)) return "Enter a valid price above 0.";
  if (["battery", "hybrid-inverter", "non-hybrid-inverter"].includes(payload.category)) {
    const voltage = Number(payload.voltage || 0);
    if (!voltage) return "Voltage is required for batteries and inverters.";
    if (![12, 24, 48].includes(voltage)) return "Battery and inverter voltage must be 12V, 24V, or 48V.";
  }
  if (payload.category.includes("inverter")) {
    const continuousVa = Number(payload.capacity || 0);
    const surgeVa = Number(payload.surge_va || 0);
    const inverterName = payload.category === "non-hybrid-inverter" ? "Non-hybrid inverter" : "Hybrid inverter";
    if (!isPositiveNumber(surgeVa)) return `${inverterName} surge / peak output VA is required.`;
    if (surgeVa < continuousVa) return `${inverterName} surge rating should be equal to or higher than continuous output VA.`;
  }
  if (payload.category === "hybrid-inverter") {
    const hybridPvCurrent = Number(payload.hybrid_pv_current_a || 0);
    if (!isPositiveNumber(hybridPvCurrent)) return "Hybrid PV input current limit is required for hybrid inverters.";
    if (hybridPvCurrent > 500) return "Hybrid PV current looks too high. Enter amps from the datasheet, not PV watts.";
  }
  return "";
}

function catalogueStatusClass(status: string) {
  const lowerStatus = status.toLowerCase();
  const isError = lowerStatus.includes("cannot") || lowerStatus.includes("required") || lowerStatus.includes("valid") || lowerStatus.includes("higher") || lowerStatus.includes("too high") || lowerStatus.includes("duplicate") || lowerStatus.includes("only admin") || lowerStatus.includes("could not") || lowerStatus.includes("enter ");
  return isError
    ? "border-[#f0b4b4] bg-[#fff6f6] text-[#9b1c1c]"
    : "border-[#b7ead8] bg-[#f1fff8] text-[#117865]";
}

function catalogueStatusTextClass(status: string) {
  return catalogueStatusClass(status).includes("#9b1c1c") ? "text-[#9b1c1c]" : "text-[#117865]";
}

async function apiErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data?.error === "string" && data.error.trim() ? data.error : fallback;
  } catch {
    return fallback;
  }
}
function formatDate(value: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatShortDate(value?: string) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function quoteStatusLabel(status?: string) {
  return quoteStatuses.find(([key]) => key === status)?.[1] || "New";
}

function quoteStatusClass(status?: string) {
  switch (status) {
    case "contacted":
      return "border-[#bddbd4] bg-[#eef8f5] text-[#117865]";
    case "inspection":
      return "border-[#c9d7ef] bg-[#f1f6ff] text-[#25589f]";
    case "quoted":
      return "border-[#ead7a8] bg-[#fff8e7] text-[#8a6417]";
    case "won":
      return "border-[#b9dfc8] bg-[#eefbf2] text-[#146c3f]";
    case "lost":
      return "border-[#efc3c3] bg-[#fff2f2] text-[#9b2f2f]";
    default:
      return "border-[#d8e7e3] bg-white text-[#4f6a72]";
  }
}

type QuoteRecommendation = NonNullable<NonNullable<QuoteRequest["quote"]>["recommendation"]>;

function quoteRecommendation(quote: QuoteRequest): Partial<QuoteRecommendation> {
  return quote.quote?.recommendation || {};
}

function quoteRequestTypeKey(quote: QuoteRequest) {
  return String(quote.quote?.requestType || "Solar").trim().toLowerCase();
}

function quoteRequestType(quote: QuoteRequest) {
  const type = quoteRequestTypeKey(quote);
  if (type === "cctv") return "CCTV";
  if (type === "contact" || type === "general") return "General enquiry";
  return "Solar";
}

function isGeneralEnquiry(quote: QuoteRequest) {
  const type = quoteRequestTypeKey(quote);
  return type === "contact" || type === "general";
}

function quoteMessage(quote: QuoteRequest) {
  return quote.site_note || quote.quote?.message || "Not provided";
}

function quoteOverviewMetrics(quote: QuoteRequest, recommendation: Partial<QuoteRecommendation>): [string, string][] {
  const type = quoteRequestTypeKey(quote);

  if (isGeneralEnquiry(quote)) {
    return [
      ["Request", "General enquiry"],
      ["Source", quote.quote?.source || quote.location || "Contact page"],
      ["Message", quoteMessage(quote)],
      ["Follow-up", quote.follow_up_date ? formatShortDate(quote.follow_up_date) : "Not scheduled"],
    ];
  }

  if (type === "cctv") {
    return [
      ["Cameras", `${quote.quote?.cameraCount || 0}`],
      ["Entry/exit", `${quote.quote?.entryPoints || 0} / ${quote.quote?.exitPoints || 0}`],
      ["Remote viewing", String(quote.quote?.remoteViewing || "Not set")],
      ["Follow-up", quote.follow_up_date ? formatShortDate(quote.follow_up_date) : "Not scheduled"],
    ];
  }

  return [
    ["Daily energy", `${Math.round(Number(quote.daily_energy_wh || 0)).toLocaleString()} Wh`],
    ["System voltage", quote.system_voltage ? `${quote.system_voltage}V` : "Not set"],
    ["PV config", recommendation.pvConfigurationLabel || "Not available"],
    ["Follow-up", quote.follow_up_date ? formatShortDate(quote.follow_up_date) : "Not scheduled"],
  ];
}

function isOverdue(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

function isDueSoon(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(today.getDate() + 3);
  return date.getTime() >= today.getTime() && date.getTime() <= limit.getTime();
}

function leadPriority(quote: QuoteRequest) {
  if (isOverdue(quote.follow_up_date)) return { label: "Overdue", className: "border-[#efc3c3] bg-[#fff2f2] text-[#9b2f2f]" };
  if (isDueSoon(quote.follow_up_date)) return { label: "Due soon", className: "border-[#ead7a8] bg-[#fff8e7] text-[#8a6417]" };
  if (Number(quote.total_cost || 0) >= 5000000) return { label: "High value", className: "border-[#bddbd4] bg-[#eef8f5] text-[#117865]" };
  return { label: "Normal", className: "border-[#d8e7e3] bg-white text-[#60777f]" };
}

function newsSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `news-${Date.now()}`;
}

export default function SolarAdminApp({ activeSection = "dashboard", onSectionChange, currentUser, onOpenMobileMenu }: SolarAdminAppProps) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState("Loading catalogue...");
  const [quoteStatus, setQuoteStatus] = useState("Loading client requests...");
  const [chatStatusMessage, setChatStatusMessage] = useState("Loading messages...");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<ProductForm>(emptyForm);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [fieldHintOpen, setFieldHintOpen] = useState("");
  const [highlightedGroup, setHighlightedGroup] = useState("");
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [catalogueCategoryFilter, setCatalogueCategoryFilter] = useState("all");
  const [catalogueBrandFilter, setCatalogueBrandFilter] = useState("all");
  const [catalogueHealthFilter, setCatalogueHealthFilter] = useState<CatalogueHealthFilter>("all");
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [chatSearch, setChatSearch] = useState("");
  const [chatStatusFilter, setChatStatusFilter] = useState<ChatStatus | "all">("all");
  const [chatReply, setChatReply] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<QuoteStatus | "all">("all");
  const [requestOwnerFilter, setRequestOwnerFilter] = useState("all");
  const [requestPriorityFilter, setRequestPriorityFilter] = useState<RequestPriorityFilter>("all");
  const [requestSort, setRequestSort] = useState<"newest" | "value" | "follow-up" | "last-contact">("newest");
  const [dashboardView, setDashboardView] = useState<"requests" | "value" | "catalogue" | "alerts">("requests");
  const [trendRange, setTrendRange] = useState<TrendRange>(7);
  const [isTrendRangeMenuOpen, setIsTrendRangeMenuOpen] = useState(false);
  const trendRangeMenuRef = useRef<HTMLDivElement | null>(null);
  const [dashboardGraphMetric, setDashboardGraphMetric] = useState<DashboardGraphMetric>("value");
  const [activeTrendIndex, setActiveTrendIndex] = useState(6);
  const [contactAction, setContactAction] = useState<ContactAction>("call");
  const [stageNoteDraft, setStageNoteDraft] = useState("");
  const [baselineQuoteStatus, setBaselineQuoteStatus] = useState<QuoteStatus>("new");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers);
  const [teamForm, setTeamForm] = useState<TeamForm>({
    name: "",
    email: "",
    role: "Sales",
    password: "",
  });
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [masterPasswordForm, setMasterPasswordForm] = useState({ password: "", confirm: "" });
  const [masterPasswordConfigured, setMasterPasswordConfigured] = useState(false);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [newsForm, setNewsForm] = useState<NewsForm>(emptyNewsForm);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [newsStatus, setNewsStatus] = useState("Loading news...");
  const [newsCategoryFilter, setNewsCategoryFilter] = useState("all");
  const [newsPublishFilter, setNewsPublishFilter] = useState<NewsStatus | "all">("all");
  const [newsSearch, setNewsSearch] = useState("");
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [videoForm, setVideoForm] = useState<FeaturedVideoForm>(emptyVideoForm);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [videoStatus, setVideoStatus] = useState("");
  const activeRole = currentUser?.role || "Admin";
  const canManageTeam = activeRole === "Admin";
  const canManageCatalogue = activeRole === "Admin" || activeRole === "Engineer";
  const canManageNews = activeRole === "Admin" || activeRole === "Engineer";
  const canEditCrm = activeRole === "Admin" || activeRole === "Sales" || activeRole === "Engineer";

  const catalogueBrands = useMemo(() => (
    Array.from(new Set(products.map((product) => product.manufacturer).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  ), [products]);
  const filteredProductsForCatalogue = useMemo(() => {
    const search = catalogueSearch.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = catalogueCategoryFilter === "all" || product.category === catalogueCategoryFilter;
      const brandMatch = catalogueBrandFilter === "all" || product.manufacturer === catalogueBrandFilter;
      const searchMatch = !search || [
        product.manufacturer,
        product.model,
        product.capacity_label,
        product.category,
        String(product.capacity),
        String(product.voltage),
      ].join(" ").toLowerCase().includes(search);
      const healthMatch =
        catalogueHealthFilter === "all" ||
        (catalogueHealthFilter === "default" && product.is_default) ||
        (catalogueHealthFilter === "missing-price" && Number(product.price || 0) <= 0) ||
        (catalogueHealthFilter === "missing-capacity" && Number(product.capacity || 0) <= 0) ||
        (catalogueHealthFilter === "missing-voltage" && ["battery", "hybrid-inverter", "non-hybrid-inverter"].includes(product.category) && Number(product.voltage || 0) <= 0);
      return categoryMatch && brandMatch && searchMatch && healthMatch;
    });
  }, [catalogueBrandFilter, catalogueCategoryFilter, catalogueHealthFilter, catalogueSearch, products]);
  const groups = useMemo(() => groupProducts(filteredProductsForCatalogue), [filteredProductsForCatalogue]);
  const quoteStatusCounts = useMemo(() => Object.fromEntries(
    quoteStatuses.map(([status]) => [status, quotes.filter((quote) => (quote.status || "new") === status).length])
  ) as Record<QuoteStatus, number>, [quotes]);
  const staffOptions = useMemo(() => {
    const staff = new Set<string>(teamMembers.map((member) => member.name).filter(Boolean));
    return Array.from(staff).sort((first, second) => first.localeCompare(second));
  }, [teamMembers]);
  const roleForStaff = (name?: string) => teamMembers.find((member) => member.name === name)?.role;
  const filteredQuotes = useMemo(() => {
    const search = requestSearch.trim().toLowerCase();
    return quotes
      .filter((quote) => {
        const statusMatch = requestStatusFilter === "all" || (quote.status || "new") === requestStatusFilter;
        const ownerMatch =
          requestOwnerFilter === "all" ||
          (requestOwnerFilter === "unassigned" ? !quote.assigned_to : quote.assigned_to === requestOwnerFilter);
        const priorityMatch =
          requestPriorityFilter === "all" ||
          (requestPriorityFilter === "open" && !["won", "lost"].includes(quote.status || "new")) ||
          (requestPriorityFilter === "overdue" && isOverdue(quote.follow_up_date)) ||
          (requestPriorityFilter === "due-soon" && isDueSoon(quote.follow_up_date)) ||
          (requestPriorityFilter === "high-value" && Number(quote.total_cost || 0) >= 5000000) ||
          (requestPriorityFilter === "unassigned" && !quote.assigned_to);
        const haystack = [
          quote.client_name,
          quote.email,
          quote.phone,
          quote.location,
          quote.site_note,
          quote.assigned_to,
          quote.admin_note,
          String(quote.total_cost || ""),
        ].join(" ").toLowerCase();
        return statusMatch && ownerMatch && priorityMatch && (!search || haystack.includes(search));
      })
      .sort((first, second) => {
        if (requestSort === "value") return Number(second.total_cost || 0) - Number(first.total_cost || 0);
        if (requestSort === "follow-up") {
          const firstDate = first.follow_up_date ? new Date(first.follow_up_date).getTime() : Number.MAX_SAFE_INTEGER;
          const secondDate = second.follow_up_date ? new Date(second.follow_up_date).getTime() : Number.MAX_SAFE_INTEGER;
          return firstDate - secondDate;
        }
        if (requestSort === "last-contact") {
          const firstDate = first.last_contacted_at ? new Date(first.last_contacted_at).getTime() : 0;
          const secondDate = second.last_contacted_at ? new Date(second.last_contacted_at).getTime() : 0;
          return secondDate - firstDate;
        }
        return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
      });
  }, [quotes, requestOwnerFilter, requestPriorityFilter, requestSearch, requestSort, requestStatusFilter]);
  const selectedQuote = useMemo(() => {
    if (!filteredQuotes.length) return null;
    return filteredQuotes.find((quote) => quote.id === selectedQuoteId) || filteredQuotes[0];
  }, [filteredQuotes, selectedQuoteId]);
  const filteredChatConversations = useMemo(() => {
    const search = chatSearch.trim().toLowerCase();
    return chatConversations
      .filter((chat) => {
        const statusMatch = chatStatusFilter === "all" || chat.status === chatStatusFilter;
        const haystack = [
          chat.visitor_name,
          chat.email,
          chat.phone,
          chat.channel,
          chat.external_id,
          chat.page_url,
          chat.assigned_to,
          chat.last_message,
        ].join(" ").toLowerCase();
        return statusMatch && (!search || haystack.includes(search));
      })
      .sort((first, second) => new Date(second.last_message_at || second.created_at).getTime() - new Date(first.last_message_at || first.created_at).getTime());
  }, [chatConversations, chatSearch, chatStatusFilter]);
  const selectedChat = useMemo(() => {
    if (!filteredChatConversations.length) return null;
    return filteredChatConversations.find((chat) => chat.id === selectedChatId) || filteredChatConversations[0];
  }, [filteredChatConversations, selectedChatId]);
  const chatCounts = useMemo(() => Object.fromEntries(
    chatStatuses.map(([status]) => [status, chatConversations.filter((chat) => chat.status === status).length])
  ) as Record<ChatStatus, number>, [chatConversations]);
  const counts = useMemo(() => ({
    panels: products.filter((product) => product.category === "panel").length,
    controllers: products.filter((product) => product.category === "controller").length,
    batteries: products.filter((product) => product.category === "battery").length,
    inverters: products.filter((product) => product.category.includes("inverter")).length,
    protection: products.filter((product) => !["panel", "controller", "battery", "hybrid-inverter", "non-hybrid-inverter"].includes(product.category)).length,
  }), [products]);
  const totalEstimateValue = useMemo(
    () => quotes.reduce((sum, quote) => sum + Number(quote.total_cost || 0), 0),
    [quotes]
  );
  const averageEstimateValue = quotes.length ? totalEstimateValue / quotes.length : 0;
  const latestQuote = quotes[0];
  const highestQuoteValue = Math.max(0, ...quotes.map((quote) => Number(quote.total_cost || 0)));
  const overdueQuotes = quotes.filter((quote) => isOverdue(quote.follow_up_date));
  const dueSoonQuotes = quotes.filter((quote) => isDueSoon(quote.follow_up_date));
  const hotLeads = quotes.filter((quote) => Number(quote.total_cost || 0) >= 5000000);
  const openQuotes = quotes.filter((quote) => !["won", "lost"].includes(quote.status || "new"));
  const wonValue = quotes
    .filter((quote) => quote.status === "won")
    .reduce((sum, quote) => sum + Number(quote.total_cost || 0), 0);
  const quoteTrend = useMemo(() => {
    const bucketCount = trendRange <= 14 ? trendRange : 15;
    const daysPerBucket = Math.ceil(trendRange / bucketCount);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latestQuoteDate = quotes
      .map((quote) => new Date(quote.created_at))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((first, second) => second.getTime() - first.getTime())[0];
    const rangeEnd = latestQuoteDate && latestQuoteDate.getTime() > today.getTime()
      ? new Date(latestQuoteDate)
      : new Date(today);
    rangeEnd.setHours(0, 0, 0, 0);
    const rangeStart = new Date(rangeEnd);
    rangeStart.setDate(rangeEnd.getDate() - (trendRange - 1));
    const days = Array.from({ length: bucketCount }, (_, index) => {
      const start = new Date(rangeStart);
      start.setDate(rangeStart.getDate() + (index * daysPerBucket));
      const end = new Date(start);
      end.setDate(start.getDate() + daysPerBucket - 1);
      if (end > rangeEnd) end.setTime(rangeEnd.getTime());
      const label = daysPerBucket === 1
        ? start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        : `${start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
      return {
        key: formatDayKey(start),
        start,
        end,
        label,
        count: 0,
        value: 0,
      };
    });
    quotes.forEach((quote) => {
      const created = new Date(quote.created_at);
      if (Number.isNaN(created.getTime())) return;
      created.setHours(0, 0, 0, 0);
      const day = days.find((item) => created >= item.start && created <= item.end);
      if (!day) return;
      day.count += 1;
      day.value += Number(quote.total_cost || 0);
    });
    const maxValue = Math.max(1, ...days.map((day) => day.value));
    const maxCount = Math.max(1, ...days.map((day) => day.count));
    const chartLeft = 0;
    const chartRight = 1500;
    const chartTop = 36;
    const chartBottom = 210;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;
    const plot = days.map((day, index) => {
      const x = chartLeft + index * (chartWidth / Math.max(1, days.length - 1));
      return {
        ...day,
        x,
        valueY: chartBottom - (day.value / maxValue) * chartHeight,
        countY: chartBottom - (day.count / maxCount) * chartHeight,
      };
    });
    return {
      days: plot,
      valuePoints: plot.map((day) => `${day.x},${day.valueY}`).join(" "),
      countPoints: plot.map((day) => `${day.x},${day.countY}`).join(" "),
      valueAreaPoints: `${chartLeft},${chartBottom} ${plot.map((day) => `${day.x},${day.valueY}`).join(" ")} ${chartRight},${chartBottom}`,
      maxValue,
      maxCount,
      chartLeft,
      chartRight,
      chartTop,
      chartBottom,
      rangeLabel: `Last ${trendRange} days`,
    };
  }, [quotes, trendRange]);
  const activeTrendDay = quoteTrend.days[activeTrendIndex] || quoteTrend.days[quoteTrend.days.length - 1];
  const dashboardGraphMetricOptions: Array<{ key: DashboardGraphMetric; label: string; shortLabel: string }> = [
    { key: "value", label: "Quote value", shortLabel: "Value" },
    { key: "requests", label: "Request count", shortLabel: "Requests" },
    { key: "average", label: "Average quote", shortLabel: "Average" },
  ];
  const selectedDashboardGraphMetric = dashboardGraphMetricOptions.find((option) => option.key === dashboardGraphMetric) || dashboardGraphMetricOptions[0];
  const getDashboardGraphMetricValue = (day: { value: number; count: number }) => {
    if (dashboardGraphMetric === "requests") return day.count;
    if (dashboardGraphMetric === "average") return day.count ? day.value / day.count : 0;
    return day.value;
  };
  const formatDashboardGraphMetricValue = (value: number) => {
    if (dashboardGraphMetric === "requests") {
      const rounded = Math.round(value);
      return `${rounded} request${rounded === 1 ? "" : "s"}`;
    }
    return formatNaira(value);
  };
  const mobileQuoteTrend = useMemo(() => {
    const chartLeft = 22;
    const chartRight = 298;
    const chartTop = 18;
    const chartBottom = 154;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;
    const maxMetric = Math.max(1, ...quoteTrend.days.map((day) => getDashboardGraphMetricValue(day)));
    const maxCount = Math.max(1, ...quoteTrend.days.map((day) => day.count));
    const days = quoteTrend.days.map((day, index) => {
      const x = chartLeft + index * (chartWidth / Math.max(1, quoteTrend.days.length - 1));
      const metricValue = getDashboardGraphMetricValue(day);
      return {
        ...day,
        x,
        metricValue,
        metricY: chartBottom - (metricValue / maxMetric) * chartHeight,
        countY: chartBottom - (day.count / maxCount) * chartHeight,
      };
    });
    return {
      days,
      metricPoints: days.map((day) => `${day.x},${day.metricY}`).join(" "),
      countPoints: days.map((day) => `${day.x},${day.countY}`).join(" "),
      metricAreaPoints: `${chartLeft},${chartBottom} ${days.map((day) => `${day.x},${day.metricY}`).join(" ")} ${chartRight},${chartBottom}`,
      chartLeft,
      chartRight,
      chartTop,
      chartBottom,
      maxMetric,
    };
  }, [quoteTrend.days, dashboardGraphMetric]);
  const activeMobileTrendDay = mobileQuoteTrend.days[activeTrendIndex] || mobileQuoteTrend.days[mobileQuoteTrend.days.length - 1];
  useEffect(() => {
    if (!isTrendRangeMenuOpen) return;
    const closeRangeMenu = (event: MouseEvent | TouchEvent) => {
      if (!trendRangeMenuRef.current?.contains(event.target as Node)) {
        setIsTrendRangeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeRangeMenu);
    document.addEventListener("touchstart", closeRangeMenu);
    return () => {
      document.removeEventListener("mousedown", closeRangeMenu);
      document.removeEventListener("touchstart", closeRangeMenu);
    };
  }, [isTrendRangeMenuOpen]);

  useEffect(() => {
    const latestIndexWithRequests = quoteTrend.days.reduce((latest, day, index) => (
      day.count > 0 ? index : latest
    ), -1);
    setActiveTrendIndex(latestIndexWithRequests >= 0 ? latestIndexWithRequests : quoteTrend.days.length - 1);
  }, [quoteTrend.days]);

  const pipelineByStatus = useMemo(() => quoteStatuses.map(([statusKey, label]) => ({
    key: statusKey,
    label,
    count: quoteStatusCounts[statusKey],
    value: quotes
      .filter((quote) => (quote.status || "new") === statusKey)
      .reduce((sum, quote) => sum + Number(quote.total_cost || 0), 0),
  })), [quoteStatusCounts, quotes]);
  const catalogueDistribution = useMemo(() => [
    { label: "Panels", value: counts.panels },
    { label: "Controllers", value: counts.controllers },
    { label: "Batteries", value: counts.batteries },
    { label: "Inverters", value: counts.inverters },
    { label: "Protection", value: counts.protection },
  ], [counts]);
  const productsWithoutPrice = products.filter((product) => Number(product.price || 0) <= 0);
  const productsWithoutDefault = ["panel", "battery", "hybrid-inverter", "non-hybrid-inverter", "controller"].filter(
    (category) => !products.some((product) => product.category === category && product.is_default)
  );
  const catalogueMode = activeSection === "products" || activeSection === "protection" || activeSection === "accessories";
  const visibleGroups = useMemo(() => {
    const productKeys = new Set(["panel", "controller", "battery", "hybrid-inverter", "non-hybrid-inverter"]);
    const protectionKeys = new Set(["protection-breakers", "protection-surge-avr", "protection-switchgear"]);
    const accessoryKeys = new Set(["protection-cables", "protection-mounting", "protection-consumables"]);
    if (activeSection === "protection") return groups.filter((group) => protectionKeys.has(group.key));
    if (activeSection === "accessories") return groups.filter((group) => accessoryKeys.has(group.key));
    return groups.filter((group) => productKeys.has(group.key));
  }, [activeSection, groups]);
  const filteredNewsPosts = useMemo(() => {
    const search = newsSearch.trim().toLowerCase();
    return newsPosts
      .filter((post) => {
        const categoryMatch = newsCategoryFilter === "all" || post.category === newsCategoryFilter;
        const statusMatch = newsPublishFilter === "all" || post.status === newsPublishFilter;
        const searchMatch = !search || [
          post.title,
          post.slug,
          post.category,
          post.excerpt,
          post.author,
          post.status,
        ].join(" ").toLowerCase().includes(search);
        return categoryMatch && statusMatch && searchMatch;
      })
      .sort((first, second) => new Date(second.updated_at || second.created_at).getTime() - new Date(first.updated_at || first.created_at).getTime());
  }, [newsCategoryFilter, newsPosts, newsPublishFilter, newsSearch]);
  const catalogueMeta = {
    products: {
      title: "Products",
      eyebrow: "Catalogue",
      detail: "Manage solar panels, charge controllers, batteries, and inverters used by the calculator.",
      badge: `${counts.panels + counts.controllers + counts.batteries + counts.inverters} items`,
    },
    protection: {
      title: "Protective equipment",
      eyebrow: "Switchgear",
      detail: "Manage breakers, SPDs, AVRs, knife switches, combiner boxes, and breaker boxes.",
      badge: `${visibleGroups.reduce((sum, group) => sum + group.products.length, 0)} items`,
    },
    accessories: {
      title: "Cables and mounting",
      eyebrow: "Accessories",
      detail: "Manage AC, PV, earthing, battery cables, rails, fasteners, lugs, tape, and zip ties.",
      badge: `${visibleGroups.reduce((sum, group) => sum + group.products.length, 0)} items`,
    },
  }[catalogueMode ? activeSection : "products"];

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products || []);
      setStatus("");
    } catch {
      setStatus("Could not load database catalogue.");
    }
  };

  const loadQuotes = async () => {
    try {
      const response = await fetch("/api/quote-requests");
      const data = await response.json();
      setQuotes(data.quote_requests || []);
      setQuoteStatus("");
    } catch {
      setQuoteStatus("Could not load client requests.");
    }
  };

  const loadChatConversations = async () => {
    try {
      const response = await fetch("/api/chat-conversations");
      const data = await response.json();
      setChatConversations(Array.isArray(data.conversations) ? data.conversations : []);
      setChatStatusMessage("");
    } catch {
      setChatStatusMessage("Could not load messages.");
    }
  };

  const loadChatThread = async (id: number) => {
    try {
      const response = await fetch(`/api/chat-conversations/${id}`);
      const data = await response.json();
      if (data.conversation) {
        setChatConversations((current) => {
          const exists = current.some((chat) => chat.id === data.conversation.id);
          return exists
            ? current.map((chat) => chat.id === data.conversation.id ? data.conversation : chat)
            : [data.conversation, ...current];
        });
      }
      setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      setChatStatusMessage("");
    } catch {
      setChatStatusMessage("Could not load this conversation.");
    }
  };

  const loadNewsPosts = async () => {
    try {
      const response = await fetch("/api/news-posts?includeDrafts=true");
      const data = await response.json();
      setNewsPosts(Array.isArray(data.posts) ? data.posts : []);
      setNewsStatus("");
    } catch {
      setNewsStatus("Could not load news posts.");
    }
  };

  const loadFeaturedVideos = async () => {
    try {
      const response = await fetch("/api/featured-videos?includeDrafts=true");
      const data = await response.json();
      setFeaturedVideos(Array.isArray(data.videos) ? data.videos : []);
      setVideoStatus("");
    } catch {
      setVideoStatus("Could not load featured videos.");
    }
  };

  const loadTeamMembers = async () => {
    try {
      const response = await fetch("/api/admin-users");
      const data = await response.json();
      const serverUsers = Array.isArray(data.users) ? data.users : [];
      if (serverUsers.length) {
        setTeamMembers(serverUsers);
        return;
      }
      const legacyUsers = JSON.parse(window.localStorage.getItem(legacyTeamStorageKey) || "[]") as TeamMember[];
      const migratableUsers = Array.isArray(legacyUsers)
        ? legacyUsers.filter((member) => member.name && member.password_hash)
        : [];
      for (const member of migratableUsers) {
        await fetch("/api/admin-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: member.name,
            email: member.email,
            role: member.role,
            password_hash: member.password_hash,
          }),
        });
      }
      if (migratableUsers.length) {
        window.localStorage.removeItem(legacyTeamStorageKey);
        const migratedResponse = await fetch("/api/admin-users");
        const migratedData = await migratedResponse.json();
        setTeamMembers(Array.isArray(migratedData.users) ? migratedData.users : []);
        return;
      }
      setTeamMembers([]);
    } catch {
      setTeamMembers(defaultTeamMembers);
    }
  };

  const loadMasterPasswordStatus = async () => {
    try {
      const response = await fetch("/api/admin-settings/master-password");
      const data = await response.json();
      if (response.ok) setMasterPasswordConfigured(Boolean(data.configured));
    } catch {
      setMasterPasswordConfigured(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadQuotes();
    loadChatConversations();
    loadNewsPosts();
    loadFeaturedVideos();
    loadTeamMembers();
    if (canManageTeam) loadMasterPasswordStatus();
  }, []);

  useEffect(() => {
    if (!selectedQuoteId && quotes.length) {
      setSelectedQuoteId(quotes[0].id);
    }
  }, [quotes, selectedQuoteId]);

  useEffect(() => {
    if (!selectedChatId && chatConversations.length) {
      setSelectedChatId(chatConversations[0].id);
    }
  }, [chatConversations, selectedChatId]);

  useEffect(() => {
    if (selectedChat) {
      loadChatThread(selectedChat.id);
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    if (activeSection !== "dashboard" && activeSection !== "requests" && activeSection !== "messages") return;
    const timer = window.setInterval(() => {
      loadQuotes();
      if (activeSection === "messages") {
        loadChatConversations();
        if (selectedChatId) loadChatThread(selectedChatId);
      }
    }, 20000);
    return () => window.clearInterval(timer);
  }, [activeSection, selectedChatId]);

  useEffect(() => {
    if (selectedQuote) {
      setBaselineQuoteStatus(selectedQuote.status || "new");
      setStageNoteDraft("");
    }
  }, [selectedQuote?.id]);

  const patchQuoteLocal = (id: number, patch: Partial<QuoteRequest>) => {
    setQuotes((current) => current.map((quote) => (
      quote.id === id ? { ...quote, ...patch } : quote
    )));
  };

  const stageNotesWithDraft = (quote: QuoteRequest, fallbackNote = "") => {
    const note = (stageNoteDraft || fallbackNote).trim();
    const previousStage = baselineQuoteStatus || quote.stage_notes?.[quote.stage_notes.length - 1]?.status;
    const transitionNote = previousStage && previousStage !== quote.status
      ? [{
          status: quote.status || "new",
          note: `Stage moved from ${quoteStatusLabel(previousStage)} to ${quoteStatusLabel(quote.status)}.`,
          employee: currentUser?.name || quote.assigned_to || "TRI-P staff",
          created_at: new Date().toISOString(),
        }]
      : [];
    if (!note) return [...(quote.stage_notes || []), ...transitionNote];
    return [
      ...(quote.stage_notes || []),
      ...transitionNote,
      {
        status: quote.status || "new",
        note,
        employee: currentUser?.name || quote.assigned_to || "TRI-P staff",
        created_at: new Date().toISOString(),
      },
    ];
  };

  const updateQuoteRequest = async (id: number, patch: Partial<QuoteRequest>, successMessage = "Request updated.") => {
    setQuoteStatus("Saving request...");
    try {
      const response = await fetch(`/api/quote-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed.");
      if (data.quote_request) {
        patchQuoteLocal(id, data.quote_request);
        setBaselineQuoteStatus(data.quote_request.status || "new");
      }
      setQuoteStatus(successMessage);
    } catch {
      setQuoteStatus("Request update failed.");
    }
  };

  const saveSelectedQuote = async () => {
    if (!selectedQuote) return;
    if (!canEditCrm) {
      setQuoteStatus("Your role can view CRM records only.");
      return;
    }
    const stage_notes = stageNotesWithDraft(
      selectedQuote,
      `${quoteStatusLabel(selectedQuote.status)} stage updated.`
    );
    await updateQuoteRequest(selectedQuote.id, {
      status: selectedQuote.status || "new",
      admin_note: selectedQuote.admin_note || "",
      assigned_to: currentUser?.name || selectedQuote.assigned_to || "",
      follow_up_date: selectedQuote.follow_up_date || "",
      last_contacted_at: selectedQuote.last_contacted_at || "",
      stage_notes,
    });
    setStageNoteDraft("");
  };

  const markSelectedContacted = async () => {
    if (!selectedQuote) return;
    if (!canEditCrm) {
      setQuoteStatus("Your role can view CRM records only.");
      return;
    }
    const action = contactActions.find(([key]) => key === contactAction);
    const nextStatus = selectedQuote.status === "new" ? "contacted" : selectedQuote.status || "contacted";
    const contactedQuote = { ...selectedQuote, status: "contacted" as QuoteStatus };
    await updateQuoteRequest(selectedQuote.id, {
      status: nextStatus,
      admin_note: selectedQuote.admin_note || "",
      assigned_to: currentUser?.name || selectedQuote.assigned_to || "",
      follow_up_date: selectedQuote.follow_up_date || "",
      last_contacted_at: new Date().toISOString(),
      stage_notes: stageNotesWithDraft({ ...contactedQuote, status: nextStatus }, action?.[2] || "Contact attempt logged."),
    }, action?.[1] || "Contact logged.");
    setStageNoteDraft("");
  };

  const copyWhatsAppMessage = async () => {
    if (!selectedQuote) return;
    if (!canEditCrm) {
      setQuoteStatus("Your role can view CRM records only.");
      return;
    }
    const requestType = quoteRequestTypeKey(selectedQuote);
    const message = [
      `Hello ${selectedQuote.client_name || "there"}, this is TRI-P Tech.`,
      isGeneralEnquiry(selectedQuote)
        ? "We received your message from the TRI-P Tech website."
        : requestType === "cctv"
          ? "We received your CCTV quote request."
          : `We received your solar quote request of ${formatNaira(selectedQuote.total_cost)}.`,
      isGeneralEnquiry(selectedQuote)
        ? "Our team will review it and follow up shortly."
        : requestType === "cctv"
          ? "Our team will review the camera coverage and follow up shortly."
          : "Our team will confirm the final setup after reviewing your site/load details.",
    ].join(" ");
    try {
      await navigator.clipboard.writeText(message);
      setQuoteStatus("WhatsApp message copied.");
    } catch {
      setQuoteStatus("Could not copy message.");
    }
  };

  const sendChatReply = async () => {
    if (!selectedChat || !chatReply.trim()) return;
    if (!canEditCrm) {
      setChatStatusMessage("Your role can view messages only.");
      return;
    }
    setChatStatusMessage("Sending reply...");
    try {
      const response = await fetch(`/api/chat-conversations/${selectedChat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: chatReply.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reply failed.");
      setChatReply("");
      if (data.conversation) {
        setChatConversations((current) => current.map((chat) => chat.id === data.conversation.id ? data.conversation : chat));
      }
      setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      setChatStatusMessage("Reply sent.");
    } catch {
      setChatStatusMessage("Reply could not be sent.");
    }
  };

  const updateSelectedChat = async (patch: Partial<ChatConversation>, successMessage = "Conversation updated.") => {
    if (!selectedChat) return;
    if (!canEditCrm) {
      setChatStatusMessage("Your role can view messages only.");
      return;
    }
    setChatStatusMessage("Updating conversation...");
    try {
      const response = await fetch(`/api/chat-conversations/${selectedChat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: patch.status ?? selectedChat.status,
          assigned_to: patch.assigned_to ?? selectedChat.assigned_to,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed.");
      if (data.conversation) {
        setChatConversations((current) => current.map((chat) => chat.id === data.conversation.id ? data.conversation : chat));
      }
      setChatStatusMessage(successMessage);
    } catch {
      setChatStatusMessage("Conversation update failed.");
    }
  };

  const addTeamMember = async () => {
    if (!canManageTeam) {
      setQuoteStatus("Only Admin can manage team users.");
      return;
    }
    const name = teamForm.name.trim();
    const email = teamForm.email.trim();
    const password = teamForm.password.trim();
    if (!name) {
      setQuoteStatus("Enter a staff name.");
      return;
    }
    if (password.length < 6) {
      setQuoteStatus("Use at least 6 characters for the password.");
      return;
    }
    const duplicate = teamMembers.some((member) =>
      normalized(member.name) === normalized(name) ||
      (email && normalized(member.email) === normalized(email))
    );
    if (duplicate) {
      setQuoteStatus("That staff member already exists.");
      return;
    }
    setQuoteStatus("Saving team member...");
    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role: teamForm.role, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Team member could not be saved.");
      setTeamForm({ name: "", email: "", role: "Sales", password: "" });
      await loadTeamMembers();
      setQuoteStatus("Team member added.");
    } catch {
      setQuoteStatus("Team member could not be saved.");
    }
  };

  const removeTeamMember = async (id: string | number) => {
    if (!canManageTeam) {
      setQuoteStatus("Only Admin can remove users.");
      return;
    }
    setQuoteStatus("Removing team member...");
    try {
      const response = await fetch(`/api/admin-users/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
      await loadTeamMembers();
      setQuoteStatus("Team member removed.");
    } catch {
      setQuoteStatus("Team member could not be removed.");
    }
  };

  const updateTeamRole = async (id: string | number, role: TeamRole) => {
    if (!canManageTeam) {
      setQuoteStatus("Only Admin can change roles.");
      return;
    }
    const member = teamMembers.find((item) => item.id === id);
    if (!member) return;
    setQuoteStatus("Updating team role...");
    try {
      const response = await fetch(`/api/admin-users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...member, role }),
      });
      if (!response.ok) throw new Error(await apiErrorMessage(response, "Team role could not be updated."));
      await loadTeamMembers();
      setQuoteStatus("Team role updated.");
    } catch (error) {
      setQuoteStatus(error instanceof Error ? error.message : "Team role could not be updated.");
    }
  };

  const resetTeamPassword = async (member: TeamMember) => {
    if (!canManageTeam) {
      setQuoteStatus("Only Admin can reset passwords.");
      return;
    }
    const draft = (passwordDrafts[String(member.id)] || "").trim();
    if (draft.length < 6) {
      setQuoteStatus("Use at least 6 characters for the new password.");
      return;
    }
    setQuoteStatus("Resetting password...");
    try {
      const response = await fetch(`/api/admin-users/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...member, password: draft }),
      });
      if (!response.ok) throw new Error("Password reset failed.");
      setPasswordDrafts((current) => ({ ...current, [String(member.id)]: "" }));
      await loadTeamMembers();
      setQuoteStatus("Password reset.");
    } catch {
      setQuoteStatus("Password could not be reset.");
    }
  };

  const updateMasterPassword = async () => {
    if (!canManageTeam) {
      setQuoteStatus("Only Admin can change the master password.");
      return;
    }
    const password = masterPasswordForm.password.trim();
    const confirm = masterPasswordForm.confirm.trim();
    if (password.length < 8) {
      setQuoteStatus("Use at least 8 characters for the master password.");
      return;
    }
    if (password !== confirm) {
      setQuoteStatus("Master password confirmation does not match.");
      return;
    }
    setQuoteStatus("Updating master password...");
    try {
      const response = await fetch("/api/admin-settings/master-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Password update failed.");
      setMasterPasswordForm({ password: "", confirm: "" });
      setMasterPasswordConfigured(true);
      setQuoteStatus("Master password updated.");
    } catch {
      setQuoteStatus("Master password could not be updated.");
    }
  };

  const resetNewsForm = () => {
    setEditingNewsId(null);
    setNewsForm({
      ...emptyNewsForm,
      author: currentUser?.name || emptyNewsForm.author,
    });
  };

  const saveNewsPost = async () => {
    if (!canManageNews) {
      setNewsStatus("Your role cannot manage news.");
      return;
    }
    const title = newsForm.title.trim();
    if (!title) {
      setNewsStatus("Enter a news title.");
      return;
    }
    if (!newsForm.excerpt.trim()) {
      setNewsStatus("Enter a short excerpt.");
      return;
    }
    const payload = {
      ...newsForm,
      title,
      slug: newsForm.slug.trim() || newsSlug(title),
      author: newsForm.author.trim() || currentUser?.name || "TRI-P Tech",
      category: newsForm.category || "Company Updates",
      status: newsForm.status || "draft",
      is_featured: Boolean(newsForm.is_featured),
    };
    const wasEditing = Boolean(editingNewsId);
    setNewsStatus(wasEditing ? "Updating news post..." : "Saving news post...");
    try {
      const response = await fetch(editingNewsId ? `/api/news-posts/${editingNewsId}` : "/api/news-posts", {
        method: editingNewsId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "News save failed.");
      resetNewsForm();
      await loadNewsPosts();
      setNewsStatus(wasEditing ? "News post updated." : "News post saved.");
    } catch {
      setNewsStatus("News post could not be saved.");
    }
  };

  const editNewsPost = (post: NewsPost) => {
    setEditingNewsId(post.id);
    setNewsForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.cover_image,
      author: post.author,
      status: post.status,
      is_featured: post.is_featured,
    });
    setNewsStatus("");
  };

  const uploadNewsCoverImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNewsStatus("Upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setNewsStatus("Image is too large. Use an image below 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewsForm((current) => ({
        ...current,
        cover_image: String(reader.result || ""),
      }));
      setNewsStatus("Image added to preview.");
    };
    reader.onerror = () => setNewsStatus("Image could not be loaded.");
    reader.readAsDataURL(file);
  };

  const deleteNewsPost = async (id: number) => {
    if (!canManageTeam) {
      setNewsStatus("Only Admin can delete news posts.");
      return;
    }
    setNewsStatus("Deleting news post...");
    try {
      const response = await fetch(`/api/news-posts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
      await loadNewsPosts();
      if (editingNewsId === id) resetNewsForm();
      setNewsStatus("News post deleted.");
    } catch {
      setNewsStatus("News post could not be deleted.");
    }
  };

  const resetVideoForm = () => {
    setEditingVideoId(null);
    setVideoForm(emptyVideoForm);
  };

  const saveFeaturedVideo = async () => {
    if (!canManageNews) {
      setVideoStatus("Your role cannot manage videos.");
      return;
    }
    if (!videoForm.title.trim()) {
      setVideoStatus("Enter a video title.");
      return;
    }
    if (!videoForm.youtube_url.trim()) {
      setVideoStatus("Paste the YouTube link.");
      return;
    }
    const wasEditing = Boolean(editingVideoId);
    setVideoStatus(wasEditing ? "Updating video..." : "Saving video...");
    try {
      const response = await fetch(editingVideoId ? `/api/featured-videos/${editingVideoId}` : "/api/featured-videos", {
        method: editingVideoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...videoForm,
          title: videoForm.title.trim(),
          youtube_url: videoForm.youtube_url.trim(),
          summary: videoForm.summary.trim(),
          thumbnail_url: videoForm.thumbnail_url.trim(),
          sort_order: Number(videoForm.sort_order || 0),
          is_published: Boolean(videoForm.is_published),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Video save failed.");
      resetVideoForm();
      await loadFeaturedVideos();
      setVideoStatus(wasEditing ? "Video updated." : "Video saved.");
    } catch {
      setVideoStatus("Video could not be saved.");
    }
  };

  const editFeaturedVideo = (video: FeaturedVideo) => {
    setEditingVideoId(video.id);
    setVideoForm({
      title: video.title,
      youtube_url: video.youtube_url,
      summary: video.summary,
      thumbnail_url: video.thumbnail_url,
      sort_order: video.sort_order,
      is_published: video.is_published,
    });
    setVideoStatus("");
  };

  const deleteFeaturedVideo = async (id: number) => {
    if (!canManageTeam) {
      setVideoStatus("Only Admin can delete videos.");
      return;
    }
    setVideoStatus("Deleting video...");
    try {
      const response = await fetch(`/api/featured-videos/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
      await loadFeaturedVideos();
      if (editingVideoId === id) resetVideoForm();
      setVideoStatus("Video deleted.");
    } catch {
      setVideoStatus("Video could not be deleted.");
    }
  };

  const scrollToCatalogueGroup = (groupKey: string, targetSection: SolarAdminSection = activeSection) => {
    setCatalogueSearch("");
    setCatalogueCategoryFilter("all");
    setCatalogueBrandFilter("all");
    setCatalogueHealthFilter("all");
    if (targetSection !== activeSection) {
      onSectionChange?.(targetSection);
    }
    setOpenGroups((current) => ({ ...current, [groupKey]: true }));
    setHighlightedGroup(groupKey);
    window.setTimeout(() => {
      document.getElementById(`catalogue-group-${groupKey}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, targetSection === activeSection ? 50 : 180);
    window.setTimeout(() => setHighlightedGroup(""), 1800);
  };

  const saveProduct = async () => {
    if (!canManageCatalogue) {
      setStatus("Your role cannot manage catalogue items.");
      return;
    }
    const payload = productPayload(form);
    const validationError = validateProductPayload(payload);
    if (validationError) {
      setStatus(validationError);
      return;
    }
    if (duplicateProduct(products, payload)) {
      setStatus("This product already exists for the same brand, category, capacity, and voltage.");
      return;
    }
    setStatus("Saving product...");
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await apiErrorMessage(response, "Product could not be saved."));
      setForm((current) => ({ ...emptyForm, category: current.category }));
      setAddProductOpen(false);
      await loadProducts();
      setStatus("Product saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Product could not be saved.");
    }
  };

  const updateProduct = async (id: number, nextForm = editingForm) => {
    if (!canManageCatalogue) {
      setStatus("Your role cannot manage catalogue items.");
      return;
    }
    const payload = productPayload(nextForm);
    const validationError = validateProductPayload(payload);
    if (validationError) {
      setStatus(validationError);
      return;
    }
    if (duplicateProduct(products, payload, id)) {
      setStatus("This product already exists for the same brand, category, capacity, and voltage.");
      return;
    }
    setStatus("Saving product...");
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await apiErrorMessage(response, "Product could not be updated."));
      setEditingId(null);
      await loadProducts();
      setStatus("Product updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Product could not be updated.");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!canManageCatalogue) {
      setStatus("Your role cannot delete catalogue items.");
      return;
    }
    setStatus("Deleting product...");
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      await loadProducts();
      setStatus("Product deleted.");
    } catch {
      setStatus("Product could not be deleted.");
    }
  };

  const makeDefault = async (product: DbProduct) => {
    if (!canManageCatalogue) {
      setStatus("Your role cannot change catalogue defaults.");
      return;
    }
    await updateProduct(product.id, { ...product, is_default: true });
  };

  const seedDefaults = async () => {
    if (!canManageCatalogue) {
      setStatus("Your role cannot manage catalogue items.");
      return;
    }
    setStatus("Saving starter catalogue...");
    try {
      const response = await fetch("/api/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: starterProducts }),
      });
      if (!response.ok) throw new Error("Seed failed.");
      await loadProducts();
      setStatus("Starter catalogue saved to database.");
    } catch {
      setStatus("Starter catalogue could not be saved.");
    }
  };

  const exportCatalogueCsv = () => {
    const headers = ["Category", "Brand", "Model", "Capacity", "Capacity label", "Voltage/poles", "Price", "Surge VA", "Hybrid PV current", "Default"];
    const rows = filteredProductsForCatalogue.map((product) => [
      categoryLabel(product.category),
      product.manufacturer,
      product.model,
      product.capacity,
      product.capacity_label,
      product.voltage,
      product.price,
      product.surge_va,
      product.hybrid_pv_current_a,
      product.is_default ? "Yes" : "No",
    ]);
    const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triptech-catalogue-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const startEdit = (product: DbProduct) => {
    setEditingId(product.id);
    setEditingForm({
      category: product.category,
      manufacturer: product.manufacturer,
      model: product.model,
      capacity: product.capacity,
      capacity_label: product.capacity_label,
      voltage: product.voltage,
      price: product.price,
      surge_va: product.surge_va,
      hybrid_pv_current_a: product.hybrid_pv_current_a,
      is_default: product.is_default,
    });
  };

  const formField = (
    target: ProductForm,
    setTarget: (updater: (current: ProductForm) => ProductForm) => void,
    key: keyof ProductForm,
    label: string,
    type: "text" | "number" = "text",
    helper = "",
    required = false
  ) => {
    const fieldHintId = `${label}-${String(key)}`;
    return (
      <div
        className="relative text-xs font-bold text-[#4f6a72]"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFieldHintOpen("");
          }
        }}
      >
        <span className="flex items-center gap-1">
          <span>{label}{required ? <span className="ml-0.5 text-[#d12f2f]">*</span> : null}</span>
          {helper ? (
            <span className="relative inline-flex">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setFieldHintOpen((current) => (current === fieldHintId ? "" : fieldHintId));
                }}
                className="grid h-4 w-4 place-items-center rounded-full border border-[#bddbd4] bg-[#eef8f5] text-[10px] font-black text-[#117865] transition hover:border-[#117865] hover:bg-[#dff7ef] focus:outline-none focus:ring-2 focus:ring-[#c9f4e6]"
                aria-label={`Show help for ${label}`}
                aria-expanded={fieldHintOpen === fieldHintId}
              >
                i
              </button>
              {fieldHintOpen === fieldHintId ? (
                <span className="absolute left-1/2 top-5 z-30 w-60 -translate-x-1/2 rounded-md border border-[#bddbd4] bg-[#082c3a] px-3 py-2 text-[11px] font-semibold leading-4 text-white shadow-xl">
                  {helper}
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
        <input
          type={type}
          min={type === "number" ? 0 : undefined}
          aria-label={label}
          value={String(target[key] ?? "")}
          onChange={(event) => setTarget((current) => ({
            ...current,
            [key]: type === "number" ? Number(event.target.value) : event.target.value,
          }))}
          className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865] focus:ring-2 focus:ring-[#c9f4e6]"
        />
      </div>
    );
  };
  const dashboardDetails = {
    requests: {
      title: "Request activity",
      body: `${quotes.length} client request${quotes.length === 1 ? "" : "s"} stored in the database. Latest request: ${latestQuote ? `${latestQuote.client_name || "Client"} on ${formatDate(latestQuote.created_at)}` : "none yet"}.`,
      action: "Open client requests",
      section: "requests" as SolarAdminSection,
      rows: [
        ["With email", quotes.filter((quote) => quote.email).length.toLocaleString()],
        ["With phone", quotes.filter((quote) => quote.phone).length.toLocaleString()],
        ["Latest value", latestQuote ? formatNaira(latestQuote.total_cost) : formatNaira(0)],
      ],
    },
    value: {
      title: "Pipeline value",
      body: `Current saved estimate value is ${formatNaira(totalEstimateValue)}. Average request value is ${formatNaira(averageEstimateValue)}.`,
      action: "Review requests",
      section: "requests" as SolarAdminSection,
      rows: [
        ["Total value", formatNaira(totalEstimateValue)],
        ["Average value", formatNaira(averageEstimateValue)],
        ["Highest request", formatNaira(highestQuoteValue)],
      ],
    },
    catalogue: {
      title: "Catalogue health",
      body: `${products.length} catalogue item${products.length === 1 ? "" : "s"} are available across solar panels, batteries, inverters, controllers, protection, cables, and accessories.`,
      action: "Open catalogue",
      section: "products" as SolarAdminSection,
      rows: [
        ["Panels", counts.panels.toLocaleString()],
        ["Batteries", counts.batteries.toLocaleString()],
        ["Protection/accessories", counts.protection.toLocaleString()],
      ],
    },
    alerts: {
      title: "Admin attention",
      body: productsWithoutPrice.length || productsWithoutDefault.length
        ? "Some catalogue entries need attention before public quoting is fully clean."
        : "No obvious catalogue alerts right now. Pricing and key defaults look ready.",
      action: "Check products",
      section: "products" as SolarAdminSection,
      rows: [
        ["No price", productsWithoutPrice.length.toLocaleString()],
        ["Default gaps", productsWithoutDefault.length.toLocaleString()],
        ["Product groups", groups.length.toLocaleString()],
      ],
    },
  }[dashboardView];

  const openCrmPreset = (preset: RequestPriorityFilter = "all", status: QuoteStatus | "all" = "all") => {
    setRequestPriorityFilter(preset);
    setRequestStatusFilter(status);
    setRequestOwnerFilter("all");
    setRequestSearch("");
    if (preset === "overdue" || preset === "due-soon") setRequestSort("follow-up");
    if (preset === "high-value") setRequestSort("value");
    onSectionChange?.("requests");
  };

  return (
    <div className={`min-h-screen text-[#082c3a] [font-family:Arial,sans-serif] ${activeSection === "requests" ? "bg-[#041722] lg:bg-transparent" : ""}`}>
      {activeSection === "dashboard" ? (
      <section id="dashboard-overview" className="flex flex-col overflow-hidden rounded-lg border border-[#cfe5df] bg-white shadow-[0_18px_45px_rgba(8,44,58,0.08)]">
        <div className="block bg-[#f4faf8] p-0 sm:p-3 md:hidden">
          <div className="overflow-hidden rounded-none border-y border-[#cfe5df] bg-white shadow-[0_20px_48px_rgba(8,44,58,0.12)] sm:rounded-[28px] sm:border">
            <div className="space-y-4 p-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#117865]">Dashboard</p>
                <h2 className="mt-1 text-2xl font-black text-[#082c3a]">Today at a glance</h2>
                <p className="mt-1 text-xs leading-5 text-[#4f6a72]">Graph first, then the work queue. See what changed before opening details.</p>
              </div>

              <div className="rounded-[24px] border border-[#cfe5df] bg-white p-3 shadow-[0_18px_38px_rgba(17,120,101,0.10)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#60777f]">{selectedDashboardGraphMetric.label}</p>
                    <strong className="mt-1 block truncate text-lg font-black leading-none text-[#117865]">{dashboardGraphMetric === "requests" ? `${quotes.length} requests` : dashboardGraphMetric === "average" ? formatNaira(averageEstimateValue) : formatNaira(totalEstimateValue)}</strong>
                  </div>
                  <div ref={trendRangeMenuRef} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsTrendRangeMenuOpen((open) => !open)}
                      className="min-w-[78px] rounded-full border border-[#cfe5df] bg-[#f4faf8] px-3 py-2 text-center text-[10px] font-black leading-tight text-[#082c3a] shadow-sm transition active:scale-[0.98]"
                      aria-label="Change graph period"
                      aria-haspopup="menu"
                      aria-expanded={isTrendRangeMenuOpen}
                    >
                      Last {trendRange} days
                    </button>
                    {isTrendRangeMenuOpen ? (
                      <div className="absolute right-0 top-[calc(100%+0.45rem)] z-30 w-32 rounded-2xl border border-[#cfe5df] bg-white p-1.5 shadow-[0_18px_36px_rgba(8,44,58,0.18)]" role="menu">
                        {([7, 14, 30, 90] as TrendRange[]).map((range) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => {
                              setTrendRange(range);
                              setIsTrendRangeMenuOpen(false);
                            }}
                            className={`w-full rounded-xl px-3 py-2 text-left text-[11px] font-black transition active:scale-[0.98] ${trendRange === range ? "bg-[#117865] text-white" : "text-[#082c3a] hover:bg-[#eef8f5]"}`}
                            role="menuitem"
                          >
                            Last {range} days
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-[#f4faf8] p-1">
                  {dashboardGraphMetricOptions.map((metric) => (
                    <button
                      key={metric.key}
                      type="button"
                      onClick={() => setDashboardGraphMetric(metric.key)}
                      className={`rounded-xl px-2 py-2 text-center text-[10px] font-black leading-tight transition active:scale-[0.98] ${
                        dashboardGraphMetric === metric.key
                          ? "bg-[#117865] text-white shadow-[0_10px_22px_rgba(17,120,101,0.18)]"
                          : "text-[#4f6a72] hover:bg-white hover:text-[#082c3a]"
                      }`}
                    >
                      {metric.shortLabel}
                    </button>
                  ))}
                </div>

                <div className="relative mt-3 overflow-hidden rounded-[18px] border border-[#edf4f2] bg-gradient-to-b from-[#f7fbfa] to-white px-0 py-2">
                  {activeMobileTrendDay ? (
                    <div className="absolute right-3 top-3 z-10 rounded-2xl bg-[#082c3a] px-3 py-2 text-right text-white shadow-[0_12px_28px_rgba(8,44,58,0.22)]">
                      <span className="block text-[9px] font-black uppercase tracking-[0.08em] text-white/80">{activeMobileTrendDay.label.replace(" 2026", "")}</span>
                      <strong className="block text-xs font-black text-[#67f5c5]">{formatDashboardGraphMetricValue(activeMobileTrendDay.metricValue)}</strong>
                      <small className="block text-[9px] font-bold text-white/90">{activeMobileTrendDay.count} request{activeMobileTrendDay.count === 1 ? "" : "s"}</small>
                    </div>
                  ) : null}
                  <svg viewBox="0 0 320 190" className="block h-56 w-full" role="img" aria-label="Mobile quote value trend chart">
                    <defs>
                      <linearGradient id="mobileQuoteArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#117865" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#117865" stopOpacity="0.04" />
                      </linearGradient>
                    </defs>
                    <rect x="8" y="10" width="304" height="154" rx="18" fill="#fbfdfc" />
                    {[30, 61, 92, 123, 154].map((y) => <line key={y} x1="22" x2="298" y1={y} y2={y} stroke="#d8e7e3" strokeWidth="1" />)}
                    <polygon points={mobileQuoteTrend.metricAreaPoints} fill="url(#mobileQuoteArea)" />
                    <polyline points={mobileQuoteTrend.metricPoints} fill="none" stroke="#117865" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    {dashboardGraphMetric !== "requests" ? <polyline points={mobileQuoteTrend.countPoints} fill="none" stroke="#082c3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 5" /> : null}
                    {mobileQuoteTrend.days.map((day, index) => {
                      const isActive = index === activeTrendIndex;
                      return (
                        <g key={day.key} onMouseEnter={() => setActiveTrendIndex(index)} onFocus={() => setActiveTrendIndex(index)} onClick={() => setActiveTrendIndex(index)} tabIndex={0} role="button" aria-label={`Inspect ${day.label}`} className="cursor-pointer">
                          <rect x={Math.max(0, day.x - 16)} y="10" width="32" height="154" fill="transparent" />
                          {isActive ? <line x1={day.x} x2={day.x} y1="18" y2="160" stroke="#94cbc0" strokeWidth="1.5" strokeDasharray="4 4" /> : null}
                          {isActive ? <circle cx={day.x} cy={day.metricY} r="9" fill="#117865" opacity="0.13" /> : null}
                          <circle cx={day.x} cy={day.metricY} r={isActive ? 4.7 : 3.2} fill="#117865" stroke="#ffffff" strokeWidth="2" />
                          {dashboardGraphMetric !== "requests" ? <circle cx={day.x} cy={day.countY} r={isActive ? 4 : 2.8} fill="#082c3a" stroke="#ffffff" strokeWidth="1.5" /> : null}
                          {(index === 0 || index === Math.floor(mobileQuoteTrend.days.length / 2) || index === mobileQuoteTrend.days.length - 1) ? (
                            <text x={day.x} y="178" textAnchor="middle" fontSize="9" fontWeight={isActive ? "800" : "600"} fill={isActive ? "#082c3a" : "#60777f"}>{day.label.replace(" 2026", "")}</text>
                          ) : null}
                        </g>
                      );
                    })}
                  </svg>
                  <div className="mt-1 flex items-center justify-between px-2 text-[10px] font-bold text-[#60777f]">
                    <span className="inline-flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-[#117865]" /> {selectedDashboardGraphMetric.shortLabel}</span>
                    <span className="inline-flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-[#082c3a]" /> Requests</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => openCrmPreset("all")} className="rounded-2xl border border-[#cfe5df] bg-white p-3 text-left shadow-sm transition active:scale-[0.98]">
                  <span className="block text-[10px] font-black text-[#60777f]">New requests</span>
                  <strong className="mt-2 block text-xl font-black text-[#082c3a]">{quotes.length}</strong>
                </button>
                <button type="button" onClick={() => openCrmPreset("due-soon")} className="rounded-2xl border border-[#cfe5df] bg-white p-3 text-left shadow-sm transition active:scale-[0.98]">
                  <span className="block text-[10px] font-black text-[#60777f]">Needs follow-up</span>
                  <strong className="mt-2 block text-xl font-black text-[#082c3a]">{overdueQuotes.length}</strong>
                </button>
                <button type="button" onClick={() => onSectionChange?.("messages")} className="rounded-2xl border border-[#cfe5df] bg-white p-3 text-left shadow-sm transition active:scale-[0.98]">
                  <span className="block text-[10px] font-black text-[#60777f]">Unread chats</span>
                  <strong className="mt-2 block text-xl font-black text-[#082c3a]">{chatCounts.waiting || 0}</strong>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#082c3a]">Pipeline</h3>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {pipelineByStatus.slice(0, 4).map((item) => (
                    <button key={item.key} type="button" onClick={() => openCrmPreset("all", item.key)} className="flex min-h-[74px] flex-col items-center justify-center rounded-2xl border border-[#cfe5df] bg-[#ecfff7] px-2 py-3 text-center transition active:scale-[0.98]">
                      <strong className="block text-lg font-black text-[#117865]">{item.count}</strong>
                      <span className="mt-1 block w-full text-center text-[10px] font-black leading-tight text-[#4f6a72]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#082c3a]">Next action</h3>
                  <span className="rounded-full bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#9b6a00]">due soon</span>
                </div>
                {(overdueQuotes[0] || openQuotes[0] || quotes[0]) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const nextQuote = overdueQuotes[0] || openQuotes[0] || quotes[0];
                      if (nextQuote) setSelectedQuoteId(nextQuote.id);
                      onSectionChange?.("requests");
                    }}
                    className="mt-2 grid w-full grid-cols-[42px_1fr_auto] items-center gap-3 rounded-2xl border border-[#8ee8c1] bg-white p-3 text-left shadow-sm transition active:scale-[0.98]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dff2ed] text-sm font-black text-[#117865]">
                      {(overdueQuotes[0] || openQuotes[0] || quotes[0])?.client_name?.slice(0, 2).toUpperCase() || "TA"}
                    </span>
                    <span>
                      <strong className="block text-sm text-[#082c3a]">{(overdueQuotes[0] || openQuotes[0] || quotes[0])?.client_name || "Client request"}</strong>
                      <small className="mt-1 block text-xs text-[#60777f]">{(overdueQuotes[0] || openQuotes[0] || quotes[0])?.location || (overdueQuotes[0] || openQuotes[0] || quotes[0])?.phone || "Review enquiry"}</small>
                    </span>
                    <span className="rounded-full bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#9b6a00]">Open</span>
                  </button>
                ) : (
                  <p className="mt-2 rounded-2xl border border-[#cfe5df] bg-white p-3 text-sm text-[#60777f]">No client request needs action right now.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
        <div className="order-1 bg-[#082c3a] p-4 text-white md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#68d8bd]">Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold">Solar operations command</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#cfe5df]">
              Monitor quote activity, catalogue health, and items that need attention before clients receive final pricing.
            </p>
          </div>
          <div className="rounded-full border border-[#3f7b73] bg-white/10 px-4 py-2 text-sm font-bold text-[#dff2ed]">
            Live database
          </div>
          </div>
        </div>

        <div className="order-3 grid grid-cols-2 gap-2 bg-[#f7fbfa] p-3 sm:gap-3 sm:p-4 md:order-2 md:grid-cols-4">
          {[
            ["requests", "Open requests", openQuotes.length.toLocaleString(), `${quotes.length.toLocaleString()} total enquiries`],
            ["value", "Pipeline value", formatNaira(totalEstimateValue), `${formatNaira(wonValue)} won`],
            ["catalogue", "Catalogue items", products.length.toLocaleString(), "Products and accessories"],
            ["alerts", "Attention", (overdueQuotes.length + productsWithoutPrice.length + productsWithoutDefault.length).toLocaleString(), "Overdue or catalogue gaps"],
          ].map(([key, title, value, detail]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDashboardView(key as typeof dashboardView)}
              onMouseEnter={() => setDashboardView(key as typeof dashboardView)}
              onFocus={() => setDashboardView(key as typeof dashboardView)}
              className={`rounded-lg border p-3 text-left shadow-sm transition sm:p-4 ${
                dashboardView === key
                  ? "border-[#117865] bg-white shadow-[0_18px_38px_rgba(17,120,101,0.16)]"
                  : "border-[#d8e7e3] bg-white/80 hover:-translate-y-0.5 hover:border-[#117865] hover:bg-white hover:shadow-[0_14px_32px_rgba(17,120,101,0.14)]"
              }`}
            >
              <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#60777f]">{title}</span>
              <strong className="mt-2 block text-xl text-[#082c3a] sm:text-2xl">{value}</strong>
              <small className="mt-1 block text-[#60777f]">{detail}</small>
            </button>
          ))}
        </div>

        <div className="order-2 bg-white px-3 py-3 sm:px-4 sm:pb-4 md:order-3">
          <div
            className="overflow-hidden rounded-lg border border-[#cfe5df] bg-white shadow-sm transition hover:border-[#bddbd4] hover:shadow-[0_18px_45px_rgba(8,44,58,0.10)]"
            onMouseLeave={() => setActiveTrendIndex(quoteTrend.days.length - 1)}
          >
            <div className="grid grid-cols-3 border-b border-[#d8e7e3]">
              <div className="border-r border-[#d8e7e3] bg-white px-3 py-3 sm:px-5 sm:py-4">
                <span className="block text-xs font-bold text-[#60777f]">Quote value</span>
                <strong className="mt-1 block text-xl text-[#082c3a] sm:text-2xl">{formatNaira(totalEstimateValue)}</strong>
                <small className="mt-1 block text-[#60777f]">{quoteTrend.rangeLabel} trend</small>
              </div>
              <div className="border-r border-[#d8e7e3] bg-[#fbfdfc] px-3 py-3 sm:px-5 sm:py-4">
                <span className="block text-xs font-bold text-[#60777f]">Requests</span>
                <strong className="mt-1 block text-xl text-[#082c3a] sm:text-2xl">{quotes.length}</strong>
                <small className="mt-1 block text-[#60777f]">Submitted enquiries</small>
              </div>
              <div className="bg-[#fbfdfc] px-3 py-3 sm:px-5 sm:py-4">
                <span className="block text-xs font-bold text-[#60777f]">Selected day</span>
                <strong className="mt-1 block text-xl text-[#117865] sm:text-2xl">{formatNaira(activeTrendDay?.value || 0)}</strong>
                <small className="mt-1 block text-[#60777f]">{activeTrendDay?.label || "Today"} | {activeTrendDay?.count || 0} request{(activeTrendDay?.count || 0) === 1 ? "" : "s"}</small>
              </div>
            </div>
            <div className="px-3 pt-3 sm:px-5 sm:pt-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#082c3a]">Quote trend</h3>
                  <p className="mt-1 text-xs text-[#60777f]">Hover across the line to inspect each day or date group.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                  <div className="inline-flex rounded-full border border-[#d8e7e3] bg-[#fbfdfc] p-1">
                    {([7, 14, 30, 90] as TrendRange[]).map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setTrendRange(range)}
                        className={`rounded-full px-3 py-1 transition ${
                          trendRange === range ? "bg-[#117865] text-white shadow-[0_8px_18px_rgba(17,120,101,0.20)]" : "text-[#60777f] hover:bg-white hover:text-[#082c3a] hover:shadow-sm"
                        }`}
                      >
                        {range}D
                      </button>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-2 text-[#117865]">
                    <span className="h-2 w-6 rounded-full bg-[#117865]" />
                    Estimate value
                  </span>
                  <span className="inline-flex items-center gap-2 text-[#082c3a]">
                    <span className="h-2 w-6 rounded-full bg-[#082c3a]" />
                    Request count
                  </span>
                </div>
              </div>
              <div className="-mx-4 mt-3">
                <svg viewBox="0 0 1500 270" className="block h-44 w-full sm:h-64 md:h-72" role="img" aria-label="Interactive quote trend line chart">
                  <defs>
                    <linearGradient id="quoteValueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#117865" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#117865" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="24" width="1500" height="205" rx="8" fill="#fbfdfc" />
                  {[36, 80, 123, 167, 210].map((y, index) => (
                    <g key={y}>
                      <line x1={quoteTrend.chartLeft} x2={quoteTrend.chartRight} y1={y} y2={y} stroke="#d8e7e3" strokeWidth="1" />
                      <text x="1492" y={y + 4} textAnchor="end" fontSize="12" fill="#60777f">{index === 0 ? formatNaira(quoteTrend.maxValue) : index === 4 ? "0" : ""}</text>
                    </g>
                  ))}
                  <polygon points={quoteTrend.valueAreaPoints} fill="url(#quoteValueFill)" />
                  <polyline points={quoteTrend.valuePoints} fill="none" stroke="#117865" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={quoteTrend.countPoints} fill="none" stroke="#082c3a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 5" />
                  {activeTrendDay ? (
                    <g>
                      <line x1={activeTrendDay.x} x2={activeTrendDay.x} y1={quoteTrend.chartTop} y2={quoteTrend.chartBottom} stroke="#8cb8ad" strokeWidth="1.5" strokeDasharray="4 4" />
                      <rect x={Math.max(60, Math.min(1284, activeTrendDay.x - 78))} y="34" width="156" height="64" rx="10" fill="#082c3a" />
                      <text x={Math.max(138, Math.min(1362, activeTrendDay.x))} y="55" textAnchor="middle" fontSize="12" fontWeight="700" fill="#cfe5df">{activeTrendDay.label}</text>
                      <text x={Math.max(138, Math.min(1362, activeTrendDay.x))} y="74" textAnchor="middle" fontSize="14" fontWeight="700" fill="#68d8bd">{formatNaira(activeTrendDay.value)}</text>
                      <text x={Math.max(138, Math.min(1362, activeTrendDay.x))} y="90" textAnchor="middle" fontSize="11" fill="#ffffff">{activeTrendDay.count} request{activeTrendDay.count === 1 ? "" : "s"}</text>
                    </g>
                  ) : null}
                  {quoteTrend.days.map((day, index) => {
                    const isActive = index === activeTrendIndex;
                    return (
                      <g key={day.key}>
                        <rect
                          x={Math.max(0, day.x - 62)}
                          y="24"
                          width={Math.min(124, 1500 - Math.max(0, day.x - 62))}
                          height="205"
                          fill="transparent"
                          onMouseEnter={() => setActiveTrendIndex(index)}
                          onFocus={() => setActiveTrendIndex(index)}
                          onClick={() => setActiveTrendIndex(index)}
                          className="cursor-pointer"
                          tabIndex={0}
                        />
                        {isActive ? <circle cx={day.x} cy={day.valueY} r="13" fill="#117865" opacity="0.12" /> : null}
                        <circle cx={day.x} cy={day.valueY} r={isActive ? "6.5" : "3.5"} fill="#117865" stroke="#ffffff" strokeWidth={isActive ? "3" : "1.5"} />
                        <circle cx={day.x} cy={day.countY} r={isActive ? "5" : "2.8"} fill="#082c3a" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={Math.max(24, Math.min(1476, day.x))} y="248" textAnchor="middle" fontSize="13" fontWeight={isActive ? "700" : "500"} fill={isActive ? "#082c3a" : "#60777f"}>{day.label}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="order-4 grid gap-4 bg-white px-4 pb-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#082c3a]">Request pipeline</h3>
                <p className="mt-1 text-xs text-[#60777f]">Status spread across quote requests.</p>
              </div>
              <strong className="text-xl text-[#117865]">{quotes.length}</strong>
            </div>
            <div className="mt-4 grid gap-3">
              {pipelineByStatus.map((item) => {
                const width = quotes.length ? Math.max(6, Math.round((item.count / quotes.length) * 100)) : 0;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => openCrmPreset("all", item.key)}
                    className="grid gap-1 rounded-md p-2 text-left transition hover:bg-white hover:shadow-[0_10px_22px_rgba(8,44,58,0.08)]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#4f6a72]">{item.label}</span>
                      <span className="text-[#60777f]">{item.count} {"\u00b7"} {formatNaira(item.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-[#117865] transition-all" style={{ width: `${width}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#082c3a]">Catalogue mix</h3>
                <p className="mt-1 text-xs text-[#60777f]">Database distribution by item type.</p>
              </div>
              <strong className="text-xl text-[#117865]">{products.length}</strong>
            </div>
            <div className="mt-4 grid gap-2">
              {catalogueDistribution.map((item) => {
                const width = products.length ? Math.max(6, Math.round((item.value / products.length) * 100)) : 0;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onSectionChange?.(item.label === "Protection" ? "protection" : "products")}
                    className="grid grid-cols-[92px_1fr_40px] items-center gap-2 rounded-md p-1 text-left text-xs transition hover:bg-white hover:shadow-[0_10px_22px_rgba(8,44,58,0.08)]"
                  >
                    <span className="font-bold text-[#4f6a72]">{item.label}</span>
                    <div className="h-7 overflow-hidden rounded-md bg-white">
                      <div className="flex h-full items-center rounded-md bg-[#dff2ed] px-2 text-[#117865]" style={{ width: `${width}%` }}>
                        {width > 18 ? `${width}%` : ""}
                      </div>
                    </div>
                    <strong className="text-right text-[#082c3a]">{item.value}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="order-5 grid gap-4 bg-white px-4 pb-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#082c3a]">Value snapshot</h3>
            <div className="mt-4 grid gap-3">
              {[
                ["Pipeline", totalEstimateValue],
                ["Average", averageEstimateValue],
                ["Highest", highestQuoteValue],
              ].map(([label, value]) => {
                const width = highestQuoteValue ? Math.max(8, Math.round((Number(value) / highestQuoteValue) * 100)) : 0;
                return (
                  <div key={String(label)} className="rounded-md p-2 transition hover:bg-white hover:shadow-[0_10px_22px_rgba(8,44,58,0.08)]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#4f6a72]">{label}</span>
                      <span className="text-[#60777f]">{formatNaira(Number(value))}</span>
                    </div>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-[#082c3a]" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#082c3a]">Recent requests</h3>
            <div className="mt-3 grid gap-2">
              {quotes.slice(0, 5).map((quote) => (
                <button
                  key={quote.id}
                  type="button"
                  onClick={() => {
                    setSelectedQuoteId(quote.id);
                    onSectionChange?.("requests");
                  }}
                  className="grid grid-cols-[1fr_auto] rounded-md border border-[#d8e7e3] bg-white px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 hover:border-[#117865] hover:bg-[#f4faf8] hover:shadow-[0_12px_26px_rgba(17,120,101,0.13)]"
                >
                  <span>
                    <strong className="block text-[#082c3a]">{quote.client_name || "Client"}</strong>
                    <small className="text-[#60777f]">{quote.location || quote.phone || "No location"}</small>
                  </span>
                  <span className="text-right">
                    <strong className="block text-[#117865]">{formatNaira(quote.total_cost)}</strong>
                    <small className="text-[#60777f]">{quoteStatusLabel(quote.status)}</small>
                  </span>
                </button>
              ))}
              {!quotes.length ? <p className="rounded-md bg-white p-3 text-sm text-[#60777f]">No client requests yet.</p> : null}
            </div>
          </div>
        </div>

        <div className="order-6 mx-4 mb-4 grid gap-4 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4 lg:grid-cols-[1fr_360px]">
          <div>
            <h3 className="text-lg font-bold text-[#082c3a]">{dashboardDetails.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#60777f]">{dashboardDetails.body}</p>
            <button
              type="button"
              onClick={() => dashboardDetails.section === "requests" ? openCrmPreset(dashboardView === "value" ? "high-value" : "all") : onSectionChange?.(dashboardDetails.section)}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#117865] px-4 text-sm font-bold text-white transition hover:bg-[#0d6757]"
            >
              {dashboardDetails.action}
            </button>
          </div>
          <div className="grid gap-2">
            {dashboardDetails.rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md border border-[#d8e7e3] bg-white px-3 py-2 text-sm">
                <span className="font-semibold text-[#60777f]">{label}</span>
                <strong className="text-[#082c3a]">{value}</strong>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>
      ) : null}

      {activeSection === "messages" ? (
      <section id="website-messages" className="rounded-lg border border-[#d8e7e3] bg-white p-3 shadow-sm md:p-5">


        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <input
            value={chatSearch}
            onChange={(event) => setChatSearch(event.target.value)}
            placeholder="Search name, phone, email, page, message..."
            className="h-11 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
          />
          <select
            value={chatStatusFilter}
            onChange={(event) => setChatStatusFilter(event.target.value as ChatStatus | "all")}
            className="h-11 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
          >
            <option value="all">All chats</option>
            {chatStatuses.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {chatStatusMessage ? <p className="mt-3 text-sm font-semibold text-[#117865]">{chatStatusMessage}</p> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[390px_1fr]">
          <div className="overflow-hidden rounded-lg border border-[#d8e7e3] bg-white">
            <div className="flex items-center justify-between bg-[#fbfdfc] px-3 py-2 text-xs font-bold uppercase text-[#60777f]">
              <span>{filteredChatConversations.length} conversation{filteredChatConversations.length === 1 ? "" : "s"}</span>
              <button
                type="button"
                onClick={() => {
                  setChatSearch("");
                  setChatStatusFilter("all");
                }}
                className="text-[#117865] hover:text-[#082c3a]"
              >
                Clear
              </button>
            </div>
            <div className="max-h-[640px] overflow-y-auto">
              {filteredChatConversations.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full border-t border-[#edf4f2] px-3 py-3 text-left transition ${
                    selectedChat?.id === chat.id ? "bg-[#eef8f5]" : "bg-white hover:bg-[#fbfdfc]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <strong className="block truncate text-sm text-[#082c3a]">{chat.visitor_name || "Website visitor"}</strong>
                      <small className="mt-1 block truncate text-xs text-[#60777f]">{chat.phone || chat.email || chat.page_url || "No contact yet"}</small>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        chat.channel === "whatsapp" ? "border-[#bddbd4] bg-[#e8f8ef] text-[#0f7a43]" : "border-[#d8e7e3] bg-[#f4faf8] text-[#60777f]"
                      }`}>
                        {chat.channel === "whatsapp" ? "WhatsApp" : "Website"}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                        chat.status === "waiting" ? "border-[#ead7a8] bg-[#fff8e7] text-[#8a6417]"
                          : chat.status === "closed" ? "border-[#d8e7e3] bg-[#f4faf8] text-[#60777f]"
                            : "border-[#bddbd4] bg-[#eef8f5] text-[#117865]"
                      }`}>
                        {chatStatuses.find(([key]) => key === chat.status)?.[1] || "Open"}
                      </span>
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#4f6a72]">{chat.last_message || "No message yet"}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#60777f]">
                    <span>{chat.assigned_to || "Unassigned"}</span>
                    <span>{formatDate(chat.last_message_at)}</span>
                  </div>
                </button>
              ))}
              {!filteredChatConversations.length ? (
                <div className="border-t border-[#edf4f2] p-4 text-sm text-[#60777f]">
                  No matching conversations yet.
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-3 sm:p-4">
            {selectedChat ? (
              <div className="flex min-h-[640px] flex-col">
                <div className="rounded-lg bg-[#082c3a] p-3 text-white sm:p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <span className={`mb-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase ${
                        selectedChat.channel === "whatsapp" ? "border-[#68d8bd] bg-[#e8f8ef] text-[#68d8bd]" : "border-white/20 bg-white/10 text-[#cfe5df]"
                      }`}>
                        {selectedChat.channel === "whatsapp" ? "WhatsApp" : "Website"}
                      </span>
                      <h3 className="text-lg font-bold sm:text-xl">{selectedChat.visitor_name || "Website visitor"}</h3>
                      <p className="mt-1 text-sm text-[#cfe5df]">{selectedChat.phone || "No phone"} | {selectedChat.email || "No email"}</p>
                      <p className="mt-1 break-all text-xs text-[#9fc8bf]">{selectedChat.page_url || "No page captured"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateSelectedChat({ assigned_to: currentUser?.name || selectedChat.assigned_to }, "Assigned to you.")}
                        className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
                      >
                        Assign to me
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedChat({ status: selectedChat.status === "closed" ? "open" : "closed" }, selectedChat.status === "closed" ? "Conversation reopened." : "Conversation closed.")}
                        className="rounded-full bg-[#68d8bd] px-3 py-2 text-xs font-bold text-[#082c3a] hover:bg-[#9ee8d7]"
                      >
                        {selectedChat.status === "closed" ? "Reopen" : "Close"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="text-xs font-bold text-[#4f6a72]">
                    Status
                    <select
                      value={selectedChat.status}
                      onChange={(event) => updateSelectedChat({ status: event.target.value as ChatStatus })}
                      disabled={!canEditCrm}
                      className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                    >
                      {chatStatuses.map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-[#4f6a72]">
                    Assigned staff
                    <select
                      value={selectedChat.assigned_to || ""}
                      onChange={(event) => updateSelectedChat({ assigned_to: event.target.value })}
                      disabled={!canEditCrm}
                      className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                    >
                      <option value="">Unassigned</option>
                      {staffOptions.map((staff) => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex-1 overflow-y-auto rounded-lg border border-[#d8e7e3] bg-white p-4">
                  <div className="space-y-3">
                    {chatMessages.map((message) => {
                      const fromVisitor = message.sender === "visitor";
                      return (
                        <div key={message.id} className={`flex ${fromVisitor ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                            fromVisitor ? "bg-[#f4faf8] text-[#082c3a]" : "bg-[#117865] text-white"
                          }`}>
                            <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                            <small className={`mt-1 block text-[10px] ${fromVisitor ? "text-[#60777f]" : "text-white/75"}`}>
                              {message.author || (fromVisitor ? "Visitor" : "TRI-P Tech")} | {formatDate(message.created_at)}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                    {!chatMessages.length ? <p className="text-sm text-[#60777f]">No messages in this conversation yet.</p> : null}
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  <textarea
                    value={chatReply}
                    onChange={(event) => setChatReply(event.target.value)}
                    rows={3}
                    disabled={!canEditCrm || selectedChat.status === "closed"}
                    placeholder={selectedChat.status === "closed" ? "Reopen the conversation before replying." : selectedChat.channel === "whatsapp" ? "Reply through WhatsApp..." : "Type staff reply..."}
                    className="w-full resize-none rounded-md border border-[#bddbd4] px-3 py-2 text-sm text-[#082c3a]"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <a
                      href={selectedChat.phone ? `https://wa.me/${selectedChat.phone.replace(/\D/g, "")}` : "#"}
                      target="_blank"
                      className={`inline-flex h-10 items-center rounded-md border border-[#bddbd4] px-4 text-sm font-bold text-[#082c3a] transition hover:bg-white ${selectedChat.phone ? "" : "pointer-events-none opacity-50"}`}
                    >
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={sendChatReply}
                      disabled={!canEditCrm || selectedChat.status === "closed" || !chatReply.trim()}
                      className="h-10 rounded-md bg-[#117865] px-5 text-sm font-bold text-white transition hover:bg-[#0f6b5b] disabled:bg-[#9bbab2]"
                    >
                      Send reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div>
                  <h3 className="text-lg font-bold text-[#082c3a]">No conversation selected</h3>
                  <p className="mt-2 text-sm text-[#60777f]">New website and WhatsApp messages will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      ) : null}

      {activeSection === "team" && !canManageTeam ? (
      <section className="rounded-lg border border-[#d8e7e3] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">Team</p>
        <h2 className="mt-1 text-xl font-bold text-[#082c3a]">Admin access required</h2>
        <p className="mt-2 text-sm leading-6 text-[#60777f]">Your role can use the admin area, but only Admin users can add users, remove users, or change roles.</p>
      </section>
      ) : null}

      {activeSection === "team" && canManageTeam ? (
      <section id="team-management" className="rounded-lg border border-[#d8e7e3] bg-white p-3 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 border-b border-[#edf4f2] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">Team</p>
            <h2 className="mt-1 text-xl font-bold text-[#082c3a]">Users and roles</h2>
            <p className="mt-1 text-sm text-[#60777f]">Manage the staff names used for CRM ownership and follow-up activity.</p>
          </div>
          <span className="rounded-full border border-[#bddbd4] bg-[#eef8f5] px-3 py-1 text-xs font-bold text-[#117865]">
            {teamMembers.length} user{teamMembers.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[360px_1fr]">
          <div className="grid gap-4">
          <div className="min-w-0 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-3 sm:p-4">
            <h3 className="text-sm font-bold text-[#082c3a]">Add user</h3>
            <div className="mt-4 grid gap-3">
              <label className="text-xs font-bold text-[#4f6a72]">
                Name
                <input
                  value={teamForm.name}
                  onChange={(event) => setTeamForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                  placeholder="Staff name"
                />
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Email
                <input
                  value={teamForm.email}
                  onChange={(event) => setTeamForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                  placeholder="name@tri-p.tech"
                />
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Role
                <select
                  value={teamForm.role}
                  onChange={(event) => setTeamForm((current) => ({ ...current, role: event.target.value as TeamRole }))}
                  className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                >
                  {teamRoleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Login password
                <input
                  value={teamForm.password}
                  onChange={(event) => setTeamForm((current) => ({ ...current, password: event.target.value }))}
                  type="password"
                  className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                  placeholder="Minimum 6 characters"
                />
              </label>
              <button
                type="button"
                onClick={addTeamMember}
                className="h-11 rounded-md bg-[#117865] px-4 text-sm font-bold text-white transition hover:bg-[#0f6b5b]"
              >
                Add user
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#60777f]">
              Team users can log in with their assigned password and receive access based on their role.
            </p>
          </div>

          </div>

          <div className="overflow-hidden rounded-lg border border-[#d8e7e3] md:overflow-x-auto">
            <div className="grid grid-cols-[1.1fr_1fr_160px_240px_80px] bg-[#fbfdfc] px-4 py-3 text-xs font-bold uppercase text-[#60777f]">
              <span>User</span>
              <span>Email</span>
              <span>Role</span>
              <span>Password</span>
              <span className="rounded-md bg-[#fbfdfc] p-2 text-left text-xs md:bg-transparent md:p-0 md:text-right md:text-sm">Action</span>
            </div>
            <div>
              {teamMembers.map((member) => (
                <div key={member.id} className="grid grid-cols-[1.1fr_1fr_160px_240px_80px] items-center gap-3 border-t border-[#edf4f2] px-4 py-3 text-sm">
                  <div>
                    <strong className="block text-[#082c3a]">{member.name}</strong>
                    <small className="text-[#60777f]">
                      {quotes.filter((quote) => quote.assigned_to === member.name).length} assigned request(s)
                    </small>
                  </div>
                  <span className="truncate text-[#4f6a72]">{member.email || "No email"}</span>
                  <select
                    value={member.role}
                    onChange={(event) => updateTeamRole(member.id, event.target.value as TeamRole)}
                    className="h-10 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                  >
                    {teamRoleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      value={passwordDrafts[String(member.id)] || ""}
                      onChange={(event) => setPasswordDrafts((current) => ({ ...current, [String(member.id)]: event.target.value }))}
                      type="password"
                      className="h-10 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => resetTeamPassword(member)}
                      className="rounded-md border border-[#bddbd4] px-3 text-xs font-bold text-[#082c3a] transition hover:bg-[#f4faf8]"
                    >
                      Reset
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(member.id)}
                    className="justify-self-end rounded-md bg-[#f7e9e9] px-3 py-2 text-xs font-bold text-[#9b1c1c] transition hover:bg-[#f3dada]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {quoteStatus ? <p className="mt-4 text-sm font-semibold text-[#117865]">{quoteStatus}</p> : null}
      </section>
      ) : null}

      {activeSection === "settings" && !canManageTeam ? (
      <section className="rounded-lg border border-[#d8e7e3] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">Settings</p>
        <h2 className="mt-1 text-xl font-bold text-[#082c3a]">Admin access required</h2>
        <p className="mt-2 text-sm leading-6 text-[#60777f]">Only Admin users can change system settings.</p>
      </section>
      ) : null}

      {activeSection === "settings" && canManageTeam ? (
      <section id="admin-settings" className="rounded-lg border border-[#d8e7e3] bg-white p-3 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 border-b border-[#edf4f2] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">Settings</p>
            <h2 className="mt-1 text-xl font-bold text-[#082c3a]">Security settings</h2>
            <p className="mt-1 text-sm text-[#60777f]">Manage system-level access controls for the solar admin.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            masterPasswordConfigured ? "bg-[#eef8f5] text-[#117865]" : "bg-[#fff6df] text-[#8a6417]"
          }`}>
            {masterPasswordConfigured ? "Custom master password" : "Default master password"}
          </span>
        </div>

        <div className="mt-5 max-w-[520px]">
          <div className="min-w-0 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-3 sm:p-4">
            <h3 className="text-sm font-bold text-[#082c3a]">Change master password</h3>
            <p className="mt-1 text-xs leading-5 text-[#60777f]">
              {masterPasswordConfigured
                ? "A custom master password is active. Updating it will replace the current master password."
                : "The default master password is still active. Set a custom password before going live."}
            </p>
            <div className="mt-4 grid gap-3">
              <label className="text-xs font-bold text-[#4f6a72]">
                New master password
                <input
                  value={masterPasswordForm.password}
                  onChange={(event) => setMasterPasswordForm((current) => ({ ...current, password: event.target.value }))}
                  type="password"
                  className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                  placeholder="Minimum 8 characters"
                />
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Confirm password
                <input
                  value={masterPasswordForm.confirm}
                  onChange={(event) => setMasterPasswordForm((current) => ({ ...current, confirm: event.target.value }))}
                  type="password"
                  className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                  placeholder="Repeat password"
                />
              </label>
              <button
                type="button"
                onClick={updateMasterPassword}
                className="h-11 rounded-md bg-[#082c3a] px-4 text-sm font-bold text-white transition hover:bg-[#117865]"
              >
                Update master password
              </button>
            </div>
          </div>

        </div>

        {quoteStatus ? <p className="mt-4 text-sm font-semibold text-[#117865]">{quoteStatus}</p> : null}
      </section>
      ) : null}

      {activeSection === "help" ? (
      <section id="admin-help" className="rounded-lg border border-[#d8e7e3] bg-white p-3 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 border-b border-[#edf4f2] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">Help</p>
            <h2 className="mt-1 text-xl font-bold text-[#082c3a]">Admin guide</h2>
            <p className="mt-1 text-sm text-[#60777f]">Quick reference for staff using the solar admin system.</p>
          </div>
          <span className="rounded-full border border-[#bddbd4] bg-[#eef8f5] px-3 py-1 text-xs font-bold text-[#117865]">
            Internal guide
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {[
            {
              title: "How access works",
              items: [
                "Master password gives full Admin access.",
                "Team passwords log staff in based on their assigned role.",
                "Catalogue, CRM, team, and settings changes require a valid admin session.",
              ],
            },
            {
              title: "Client requests",
              items: [
                "New quote requests enter the CRM pipeline automatically.",
                "Use status, follow-up date, handled-by, and stage notes to track movement.",
                "Contact notes should be short and tied to the current pipeline stage.",
              ],
            },
            {
              title: "Product catalogue",
              items: [
                "Products added here feed the calculator recommendations immediately after saving.",
                "Use accurate brand, capacity, voltage, price, and default selections.",
                "Avoid duplicate products under the same brand/category/capacity/voltage.",
              ],
            },
            {
              title: "Calculator and quotes",
              items: [
                "The calculator uses load entries, selected brands, assumptions, and catalogue prices.",
                "Final quote requests are saved to the database and sent by email.",
                "Excel quote generation is available after admin login.",
              ],
            },
            {
              title: "Messages",
              items: [
                "Use Messages to review website and WhatsApp conversations from one workspace.",
                "Refresh the page when you need the latest chat activity.",
              ],
            },
          ].map((section) => (
            <div key={section.title} className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4">
              <h3 className="text-sm font-bold text-[#082c3a]">{section.title}</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#4f6a72]">
                {section.items.map((item) => (
                  <li key={item} className="rounded-md border border-[#edf4f2] bg-white px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      ) : null}

      {activeSection === "news" && !canManageNews ? (
      <section className="rounded-lg border border-[#d8e7e3] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">News</p>
        <h2 className="mt-1 text-xl font-bold text-[#082c3a]">News access required</h2>
        <p className="mt-2 text-sm leading-6 text-[#60777f]">Your role can view admin areas, but cannot create or update public news posts.</p>
      </section>
      ) : null}

      {activeSection === "news" && canManageNews ? (
      <section id="admin-news" className="rounded-lg border border-[#d8e7e3] bg-white p-3 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 border-b border-[#edf4f2] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">News</p>
            <h2 className="mt-1 text-xl font-bold text-[#082c3a]">News posts</h2>
            <p className="mt-1 text-sm text-[#60777f]">Publish company updates, solar education, project stories, and customer notices.</p>
          </div>
          <button
            type="button"
            onClick={loadNewsPosts}
            className="h-10 rounded-md border border-[#bddbd4] px-4 text-sm font-bold text-[#082c3a] transition hover:bg-[#f4faf8]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.75fr)]">
          <div className="min-w-0 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-[#082c3a]">{editingNewsId ? "Edit post" : "Create post"}</h3>
              {editingNewsId ? (
                <button
                  type="button"
                  onClick={resetNewsForm}
                  className="rounded-full border border-[#bddbd4] px-3 py-1 text-xs font-bold text-[#082c3a] transition hover:bg-white"
                >
                  New post
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-bold text-[#4f6a72] md:col-span-2">
                Title
                <input
                  value={newsForm.title}
                  onChange={(event) => setNewsForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: current.slug ? current.slug : newsSlug(event.target.value),
                  }))}
                  className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                  placeholder="e.g. Practical solar sizing in Nigeria"
                />
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Category
                <select
                  value={newsForm.category}
                  onChange={(event) => setNewsForm((current) => ({ ...current, category: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                >
                  {newsCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Status
                <select
                  value={newsForm.status}
                  onChange={(event) => setNewsForm((current) => ({ ...current, status: event.target.value as NewsStatus }))}
                  className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Slug
                <input
                  value={newsForm.slug}
                  onChange={(event) => setNewsForm((current) => ({ ...current, slug: newsSlug(event.target.value) }))}
                  className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                  placeholder="post-url-slug"
                />
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Author
                <input
                  value={newsForm.author}
                  onChange={(event) => setNewsForm((current) => ({ ...current, author: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                />
              </label>
              <div className="rounded-lg border border-[#d8e7e3] bg-white p-3 md:col-span-2">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                  <label className="min-w-0 flex-1 text-xs font-bold text-[#4f6a72]">
                    Cover image upload
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => uploadNewsCoverImage(event.target.files?.[0])}
                      className="mt-1 block w-full rounded-md border border-[#bddbd4] bg-white px-3 py-2 text-sm text-[#082c3a] file:mr-3 file:rounded-full file:border-0 file:bg-[#eef8f5] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#117865]"
                    />
                  </label>
                  {newsForm.cover_image ? (
                    <button
                      type="button"
                      onClick={() => setNewsForm((current) => ({ ...current, cover_image: "" }))}
                      className="h-10 rounded-md border border-[#efc3c3] px-4 text-sm font-bold text-[#9b1c1c] transition hover:bg-[#fff2f2]"
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
                <label className="mt-3 block text-xs font-bold text-[#4f6a72]">
                  Or paste hosted image URL
                  <input
                    value={newsForm.cover_image.startsWith("data:") ? "" : newsForm.cover_image}
                    onChange={(event) => setNewsForm((current) => ({ ...current, cover_image: event.target.value }))}
                    className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                    placeholder="Optional direct image link"
                  />
                </label>
                <p className="mt-2 text-xs leading-5 text-[#60777f]">
                  Upload JPG, PNG, or WebP under 2MB. Google Drive page links are not direct image links.
                </p>
              </div>
              <label className="text-xs font-bold text-[#4f6a72] md:col-span-2">
                Excerpt
                <textarea
                  value={newsForm.excerpt}
                  onChange={(event) => setNewsForm((current) => ({ ...current, excerpt: event.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-[#bddbd4] px-3 py-2 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                  placeholder="Short summary shown on the news page"
                />
              </label>
              <label className="text-xs font-bold text-[#4f6a72] md:col-span-2">
                Body
                <textarea
                  value={newsForm.body}
                  onChange={(event) => setNewsForm((current) => ({ ...current, body: event.target.value }))}
                  rows={8}
                  className="mt-1 w-full rounded-md border border-[#bddbd4] px-3 py-2 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                  placeholder="Full post or update"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-bold text-[#082c3a]">
                <input
                  type="checkbox"
                  checked={newsForm.is_featured}
                  onChange={(event) => setNewsForm((current) => ({ ...current, is_featured: event.target.checked }))}
                  className="h-4 w-4"
                />
                Feature this post
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveNewsPost}
                className="rounded-full bg-[#117865] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0d6757]"
              >
                {editingNewsId ? "Save changes" : "Save post"}
              </button>
              <a href="/news" className="rounded-full border border-[#bddbd4] px-5 py-3 text-sm font-bold text-[#082c3a] transition hover:bg-white">
                Open news page
              </a>
            </div>
            {newsStatus ? <p className="mt-3 text-sm font-semibold text-[#117865]">{newsStatus}</p> : null}
          </div>

          <aside className="rounded-lg border border-[#d8e7e3] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#edf4f2] pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">Preview</p>
                <h3 className="mt-1 text-base font-bold text-[#082c3a]">Before publishing</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                newsForm.status === "published" ? "bg-[#e8f4ff] text-[#0b5f8a]" : "bg-[#fff8e7] text-[#8a6417]"
              }`}>
                {newsForm.status}
              </span>
            </div>
            <article className="mt-4 overflow-hidden rounded-lg border border-[#d8e7e3] bg-[#fbfdfc]">
              {newsForm.cover_image ? (
                <img
                  src={newsForm.cover_image}
                  alt=""
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-[#082c3a] px-6 text-center text-white">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8bd7c8]">
                    News preview
                  </span>
                </div>
              )}
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-bold text-[#117865]">
                    {newsForm.category || "Company Updates"}
                  </span>
                  {newsForm.is_featured ? (
                    <span className="rounded-full bg-[#082c3a] px-3 py-1 text-xs font-bold text-white">
                      Featured
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-xl font-extrabold leading-tight text-[#082c3a]">
                  {newsForm.title.trim() || "News post title"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#60777f]">
                  {newsForm.excerpt.trim() || "The post excerpt will appear here so the team can review the summary before saving."}
                </p>
                <div className="mt-4 border-t border-[#edf4f2] pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#60777f]">
                    {newsForm.author.trim() || currentUser?.name || "TRI-P Tech"}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-[#4f6a72]">
                    {(newsForm.body.trim()
                      ? newsForm.body.split("\n").filter(Boolean).slice(0, 3)
                      : ["The first few lines of the post body will preview here."]).map((paragraph, index) => (
                      <p key={`${paragraph}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </aside>

          <div className="rounded-lg border border-[#d8e7e3] bg-white p-4 xl:col-span-2">
            <div className="flex flex-col gap-3 border-b border-[#edf4f2] pb-3 lg:flex-row lg:items-end">
              <label className="min-w-0 flex-1 text-xs font-bold text-[#4f6a72]">
                Search posts
                <input
                  value={newsSearch}
                  onChange={(event) => setNewsSearch(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                  placeholder="Search title, category, author..."
                />
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Category
                <select
                  value={newsCategoryFilter}
                  onChange={(event) => setNewsCategoryFilter(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865] lg:w-48"
                >
                  <option value="all">All categories</option>
                  {newsCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-[#4f6a72]">
                Status
                <select
                  value={newsPublishFilter}
                  onChange={(event) => setNewsPublishFilter(event.target.value as NewsStatus | "all")}
                  className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865] lg:w-40"
                >
                  <option value="all">All status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid max-h-[680px] gap-3 overflow-y-auto pr-1">
              {filteredNewsPosts.map((post) => (
                <article key={post.id} className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4 transition hover:border-[#117865] hover:bg-white hover:shadow-[0_14px_32px_rgba(17,120,101,0.12)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#eef8f5] px-2 py-1 text-[11px] font-bold text-[#117865]">{post.category}</span>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${post.status === "published" ? "bg-[#e8f4ff] text-[#0b5f8a]" : "bg-[#fff8e7] text-[#8a6417]"}`}>
                          {post.status}
                        </span>
                        {post.is_featured ? <span className="rounded-full bg-[#082c3a] px-2 py-1 text-[11px] font-bold text-white">Featured</span> : null}
                      </div>
                      <h3 className="mt-3 text-base font-bold text-[#082c3a]">{post.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#60777f]">{post.excerpt}</p>
                      <p className="mt-2 text-xs text-[#60777f]">
                        {post.author || "TRI-P Tech"} - Updated {formatDate(post.updated_at || post.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => editNewsPost(post)} className="h-9 rounded-md bg-[#eef7f4] px-3 text-xs font-bold text-[#082c3a] transition hover:bg-[#dff0eb]">
                        Edit
                      </button>
                      {canManageTeam ? (
                        <button type="button" onClick={() => deleteNewsPost(post.id)} className="h-9 rounded-md bg-[#f7e9e9] px-3 text-xs font-bold text-[#9b1c1c] transition hover:bg-[#f4dede]">
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
              {!filteredNewsPosts.length ? (
                <div className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-5 text-sm text-[#60777f]">
                  No news posts match this view.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-[#d8e7e3] bg-white p-4 xl:col-span-2">
            <div className="flex flex-col gap-3 border-b border-[#edf4f2] pb-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">Featured videos</p>
                <h3 className="mt-1 text-base font-bold text-[#082c3a]">Homepage YouTube section</h3>
                <p className="mt-1 text-sm text-[#60777f]">Add direct YouTube links here. Published videos appear on the homepage.</p>
              </div>
              <a
                href="https://www.youtube.com/@TRI-PTECH"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#bddbd4] px-4 py-2 text-sm font-bold text-[#082c3a] transition hover:bg-[#f4faf8]"
              >
                Open YouTube
              </a>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
              <div className="min-w-0 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-[#082c3a]">{editingVideoId ? "Edit video" : "Add video"}</h4>
                  {editingVideoId ? (
                    <button
                      type="button"
                      onClick={resetVideoForm}
                      className="rounded-full border border-[#bddbd4] px-3 py-1 text-xs font-bold text-[#082c3a] transition hover:bg-white"
                    >
                      New video
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 grid gap-3">
                  <label className="text-xs font-bold text-[#4f6a72]">
                    Title
                    <input
                      value={videoForm.title}
                      onChange={(event) => setVideoForm((current) => ({ ...current, title: event.target.value }))}
                      className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                      placeholder="Video title"
                    />
                  </label>
                  <label className="text-xs font-bold text-[#4f6a72]">
                    YouTube link
                    <input
                      value={videoForm.youtube_url}
                      onChange={(event) => setVideoForm((current) => ({ ...current, youtube_url: event.target.value }))}
                      className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </label>
                  <label className="text-xs font-bold text-[#4f6a72]">
                    Summary
                    <textarea
                      value={videoForm.summary}
                      onChange={(event) => setVideoForm((current) => ({ ...current, summary: event.target.value }))}
                      rows={3}
                      className="mt-1 w-full rounded-md border border-[#bddbd4] px-3 py-2 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                      placeholder="Short description for the homepage"
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-bold text-[#4f6a72]">
                      Thumbnail URL
                      <input
                        value={videoForm.thumbnail_url}
                        onChange={(event) => setVideoForm((current) => ({ ...current, thumbnail_url: event.target.value }))}
                        className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                        placeholder="Optional"
                      />
                    </label>
                    <label className="text-xs font-bold text-[#4f6a72]">
                      Order
                      <input
                        type="number"
                        value={videoForm.sort_order}
                        onChange={(event) => setVideoForm((current) => ({ ...current, sort_order: Number(event.target.value || 0) }))}
                        className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#082c3a]">
                    <input
                      type="checkbox"
                      checked={videoForm.is_published}
                      onChange={(event) => setVideoForm((current) => ({ ...current, is_published: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Published
                  </label>
                  <button
                    type="button"
                    onClick={saveFeaturedVideo}
                    className="w-fit rounded-full bg-[#117865] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0d6757]"
                  >
                    {editingVideoId ? "Save video" : "Add video"}
                  </button>
                  {videoStatus ? <p className="text-sm font-semibold text-[#117865]">{videoStatus}</p> : null}
                </div>
              </div>

              <div className="grid gap-3">
                {featuredVideos.map((video) => (
                  <article key={video.id} className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4 transition hover:border-[#117865] hover:bg-white hover:shadow-[0_14px_32px_rgba(17,120,101,0.12)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#eef8f5] px-2 py-1 text-[11px] font-bold text-[#117865]">Order {video.sort_order}</span>
                          <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${video.is_published ? "bg-[#e8f4ff] text-[#0b5f8a]" : "bg-[#fff8e7] text-[#8a6417]"}`}>
                            {video.is_published ? "Published" : "Hidden"}
                          </span>
                        </div>
                        <h4 className="mt-3 text-base font-bold text-[#082c3a]">{video.title}</h4>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#60777f]">{video.summary || video.youtube_url}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => editFeaturedVideo(video)} className="h-9 rounded-md bg-[#eef7f4] px-3 text-xs font-bold text-[#082c3a] transition hover:bg-[#dff0eb]">
                          Edit
                        </button>
                        {canManageTeam ? (
                          <button type="button" onClick={() => deleteFeaturedVideo(video.id)} className="h-9 rounded-md bg-[#f7e9e9] px-3 text-xs font-bold text-[#9b1c1c] transition hover:bg-[#f4dede]">
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
                {!featuredVideos.length ? (
                  <div className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-5 text-sm text-[#60777f]">
                    No featured videos yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {activeSection === "requests" ? (
      <>
      <section className="min-h-[100svh] overflow-hidden rounded-[26px] border border-[#0b3d4d] bg-[#041722] shadow-[0_22px_55px_rgba(8,44,58,0.18)] lg:hidden">
        <div className="relative min-h-[100svh] bg-[#041722] p-5 pb-24 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,217,123,0.18),transparent_34%),linear-gradient(180deg,#041722_0%,#061c28_54%,#041722_100%)]" />
          <div className="relative z-10 flex h-full min-h-[calc(100svh-7rem)] flex-col justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#16e08f]">TRI-P CRM</p>
              <h2 className="mt-3 text-3xl font-black leading-tight">Ouch, this needs a desktop.</h2>
            </div>

            <div className="flex flex-1 items-center py-8">
            <div className="relative w-full overflow-hidden rounded-[22px] border border-[#16e08f]/70 bg-white/8 p-4 shadow-[0_18px_50px_rgba(0,217,123,0.12)] backdrop-blur-md">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-[#16e08f]/35" />
              <div className="grid grid-cols-[105px_1fr] items-center gap-4">
                <div className="relative h-36 overflow-hidden rounded-2xl border border-[#16e08f]/35 bg-[#062333]">
                  <img
                    src="/images/tri-p-wizard-guide-step-7.png"
                    alt="TRI-P guide"
                    className="absolute inset-x-0 bottom-0 mx-auto h-44 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#16e08f]">TRI-P guide</p>
                  <p className="mt-2 text-lg font-black leading-7">Please open CRM on a laptop or desktop.</p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
      <section id="client-requests" className="hidden rounded-lg border border-[#d8e7e3] bg-white p-3 shadow-sm md:p-5 lg:block">
        <div className="flex flex-col gap-3 border-b border-[#edf4f2] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">CRM</p>
            <h2 className="mt-1 text-xl font-bold text-[#082c3a]">Client request pipeline</h2>
            <p className="mt-1 text-sm text-[#60777f]">Track enquiries from request received to inspection, quote, and close.</p>
          </div>
          <button
            type="button"
            onClick={loadQuotes}
            className="h-10 rounded-md border border-[#bddbd4] px-4 text-sm font-bold text-[#082c3a] transition hover:bg-[#f4faf8]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4 md:gap-3 md:grid-cols-4">
          {[
            ["Active leads", openQuotes.length, "Requests not won/lost", "text-[#117865]"],
            ["Overdue", overdueQuotes.length, "Needs follow-up now", "text-[#9b2f2f]"],
            ["Due soon", dueSoonQuotes.length, "Next 3 days", "text-[#8a6417]"],
            ["High value", hotLeads.length, "Above \u20a65m estimate", "text-[#117865]"],
          ].map(([label, value, detail, tone]) => {
            const preset = label === "Overdue" ? "overdue" : label === "Due soon" ? "due-soon" : label === "High value" ? "high-value" : "open";
            return (
            <button key={String(label)} type="button" onClick={() => openCrmPreset(preset as RequestPriorityFilter)} className={`rounded-md border p-2.5 text-left transition active:scale-[0.99] md:rounded-lg md:p-3 ${requestPriorityFilter === preset ? "border-[#117865] bg-[#eef8f5]" : "border-[#d8e7e3] bg-[#fbfdfc] hover:bg-white"}`}>
              <span className="block text-xs font-bold uppercase tracking-[0.1em] text-[#60777f]">{label}</span>
              <strong className={`mt-1 block text-xl md:text-2xl ${tone}`}>{value}</strong>
              <small className="mt-1 block text-[#60777f]">{detail}</small>
            </button>
          )})}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-4 md:grid-cols-4 xl:grid-cols-7">
          {pipelineByStatus.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setRequestStatusFilter(item.key)}
              className={`rounded-md border px-3 py-2 text-left transition active:scale-[0.99] ${
                requestStatusFilter === item.key ? "border-[#117865] bg-[#eef8f5]" : "border-[#d8e7e3] bg-[#fbfdfc] hover:bg-[#f4faf8]"
              }`}
            >
              <span className="block text-lg font-bold text-[#082c3a]">{item.count}</span>
              <span className="text-xs font-bold text-[#60777f]">{item.label}</span>
              <small className="mt-1 block text-[#117865]">{formatNaira(item.value)}</small>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRequestStatusFilter("all")}
            className={`rounded-md border px-3 py-2 text-left transition active:scale-[0.99] ${
              requestStatusFilter === "all" ? "border-[#117865] bg-[#eef8f5]" : "border-[#d8e7e3] bg-[#fbfdfc] hover:bg-[#f4faf8]"
            }`}
          >
            <span className="block text-lg font-bold text-[#117865]">{formatNaira(totalEstimateValue)}</span>
            <span className="text-xs font-bold text-[#60777f]">Pipeline</span>
          </button>
        </div>

        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 md:mt-4 xl:grid-cols-[1fr_180px_180px_180px_160px]">
          <input
            value={requestSearch}
            onChange={(event) => setRequestSearch(event.target.value)}
            placeholder="Search client, phone, email, location..."
            className="h-11 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
          />
          <select
            value={requestStatusFilter}
            onChange={(event) => setRequestStatusFilter(event.target.value as QuoteStatus | "all")}
            className="h-11 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
          >
            <option value="all">All statuses</option>
            {quoteStatuses.map(([statusKey, label]) => (
              <option key={statusKey} value={statusKey}>{label}</option>
            ))}
          </select>
          <select
            value={requestOwnerFilter}
            onChange={(event) => setRequestOwnerFilter(event.target.value)}
            className="h-11 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
          >
            <option value="all">All staff</option>
            <option value="unassigned">Unassigned</option>
            {staffOptions.map((staff) => (
              <option key={staff} value={staff}>{staff}</option>
            ))}
          </select>
          <select
            value={requestPriorityFilter}
            onChange={(event) => setRequestPriorityFilter(event.target.value as RequestPriorityFilter)}
            className="h-11 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
          >
            <option value="all">All priorities</option>
            <option value="open">Open leads</option>
            <option value="overdue">Overdue</option>
            <option value="due-soon">Due soon</option>
            <option value="high-value">High value</option>
            <option value="unassigned">Unassigned</option>
          </select>
          <select
            value={requestSort}
            onChange={(event) => setRequestSort(event.target.value as typeof requestSort)}
            className="h-11 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
          >
            <option value="newest">Newest first</option>
            <option value="value">Highest value</option>
            <option value="follow-up">Follow-up date</option>
            <option value="last-contact">Last contact</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#60777f]">Showing {filteredQuotes.length} of {quotes.length} requests</span>
          {requestStatusFilter !== "all" ? <span className="rounded-full bg-[#eef8f5] px-2 py-1 font-bold text-[#117865]">{quoteStatusLabel(requestStatusFilter)}</span> : null}
          {requestOwnerFilter !== "all" ? <span className="rounded-full bg-[#eef8f5] px-2 py-1 font-bold text-[#117865]">{requestOwnerFilter === "unassigned" ? "Unassigned" : requestOwnerFilter}</span> : null}
          {requestPriorityFilter !== "all" ? <span className="rounded-full bg-[#eef8f5] px-2 py-1 font-bold text-[#117865]">{requestPriorityFilter.replace("-", " ")}</span> : null}
          {(requestSearch || requestStatusFilter !== "all" || requestOwnerFilter !== "all" || requestPriorityFilter !== "all") ? (
            <button
              type="button"
              onClick={() => {
                setRequestSearch("");
                setRequestStatusFilter("all");
                setRequestOwnerFilter("all");
                setRequestPriorityFilter("all");
                setRequestSort("newest");
              }}
              className="rounded-full border border-[#bddbd4] px-3 py-1 font-bold text-[#082c3a] transition hover:bg-[#f4faf8]"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {quoteStatus ? <p className="mt-3 text-sm font-semibold text-[#117865]">{quoteStatus}</p> : null}

        <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-[minmax(360px,0.95fr)_1.25fr] lg:gap-4">
          <div className="overflow-hidden rounded-lg border border-[#d8e7e3] md:overflow-x-auto">
            <div className="hidden min-w-[640px] grid-cols-[1.3fr_0.75fr_0.75fr_0.75fr] bg-[#fbfdfc] px-3 py-2 text-xs font-bold uppercase text-[#60777f] md:grid">
              <span>Client</span>
              <span>Owner</span>
              <span>Status</span>
              <span className="text-right">Estimate</span>
            </div>
            <div className="max-h-[430px] min-w-0 overflow-y-auto md:max-h-[620px] md:min-w-[640px]">
              {filteredQuotes.length ? filteredQuotes.map((quote) => {
                const priority = leadPriority(quote);
                return (
                  <button
                    key={quote.id}
                    type="button"
                    onClick={() => setSelectedQuoteId(quote.id)}
                    className={`grid w-full grid-cols-2 gap-2 border-t border-[#edf4f2] px-3 py-3 text-left text-sm transition active:scale-[0.995] md:grid-cols-[1.3fr_0.75fr_0.75fr_0.75fr] ${
                      selectedQuote?.id === quote.id ? "bg-[#eef8f5]" : "bg-white hover:bg-[#fbfdfc]"
                    }`}
                  >
                    <span className="col-span-2 min-w-0 md:col-span-1">
                      <strong className="block truncate text-[#082c3a]">{quote.client_name || "Client"}</strong>
                      <small className="mt-1 block truncate text-[#60777f]">{quote.phone || quote.email || "No contact"}</small>
                      <span className="mt-2 flex flex-wrap gap-1">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${priority.className}`}>
                          {priority.label}
                        </span>
                        <span className="inline-flex rounded-full border border-[#bddbd4] bg-[#eef8f5] px-2 py-0.5 text-[11px] font-bold text-[#117865]">
                          {quoteRequestType(quote)}
                        </span>
                      </span>
                    </span>
                    <span className="rounded-md bg-[#fbfdfc] p-2 text-xs md:bg-transparent md:p-0 md:text-sm">
                      <small className="mb-1 block font-bold uppercase text-[#60777f] md:hidden">Owner</small>
                      <strong className="block truncate text-[#082c3a]">{quote.assigned_to || "Unassigned"}</strong>
                      <small className="mt-1 block text-[#60777f]">
                        {roleForStaff(quote.assigned_to) || "No role"} {"\u00b7"} {formatShortDate(quote.last_contacted_at || "")}
                      </small>
                    </span>
                    <span className="rounded-md bg-[#fbfdfc] p-2 text-xs md:bg-transparent md:p-0 md:text-sm">
                      <small className="mb-1 block font-bold uppercase text-[#60777f] md:hidden">Status</small>
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${quoteStatusClass(quote.status)}`}>
                        {quoteStatusLabel(quote.status)}
                      </span>
                      <small className="mt-2 block text-[#60777f]">{formatShortDate(quote.follow_up_date)}</small>
                    </span>
                    <span className="rounded-md bg-[#fbfdfc] p-2 text-left text-xs md:bg-transparent md:p-0 md:text-right md:text-sm">
                      <small className="mb-1 block font-bold uppercase text-[#60777f] md:hidden">Estimate</small>
                      <strong className="block text-[#117865]">{formatNaira(quote.total_cost)}</strong>
                      <small className="mt-1 block text-[#60777f]">
                        {isGeneralEnquiry(quote)
                          ? "Message"
                          : quoteRequestTypeKey(quote) === "cctv"
                            ? `${quote.quote?.cameraCount || 0} camera(s)`
                            : `${Math.round(Number(quote.daily_energy_wh || 0)).toLocaleString()} Wh`}
                      </small>
                    </span>
                  </button>
                );
              }) : (
                <div className="border-t border-[#edf4f2] p-4 text-sm text-[#60777f]">No matching client requests.</div>
              )}
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-3 sm:p-4">
            {selectedQuote ? (() => {
              const recommendation = quoteRecommendation(selectedQuote);
              const priority = leadPriority(selectedQuote);
              const isGeneral = isGeneralEnquiry(selectedQuote);
              const selectedRequestType = quoteRequestTypeKey(selectedQuote);
              return (
                <div className="space-y-4">
                  <div className="rounded-lg bg-[#082c3a] p-3 text-white sm:p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold sm:text-xl">{selectedQuote.client_name || "Client"}</h3>
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${quoteStatusClass(selectedQuote.status)}`}>
                          {quoteStatusLabel(selectedQuote.status)}
                        </span>
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${priority.className}`}>
                          {priority.label}
                        </span>
                        <span className="rounded-full border border-[#bddbd4] bg-[#eef8f5] px-2 py-1 text-xs font-bold text-[#117865]">
                          {quoteRequestType(selectedQuote)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#cfe5df]">{selectedQuote.phone || "No phone"} | {selectedQuote.email || "No email"}</p>
                      <p className="text-sm text-[#cfe5df]">{selectedQuote.location || "No location"} | {formatDate(selectedQuote.created_at)}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <strong className="block text-xl text-[#68d8bd] sm:text-2xl">{isGeneral ? "Message" : formatNaira(selectedQuote.total_cost)}</strong>
                      <span className="text-xs font-bold uppercase text-[#cfe5df]">{isGeneral ? "Request type" : "Opportunity value"}</span>
                    </div>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                    {quoteOverviewMetrics(selectedQuote, recommendation).map(([label, value]) => (
                      <div key={label} className="rounded-md border border-[#d8e7e3] bg-white p-2.5 sm:p-3">
                        <span className="block text-xs font-bold uppercase text-[#60777f]">{label}</span>
                        <strong className="mt-1 block text-sm text-[#082c3a]">{value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                    <div className="space-y-4">
                      {isGeneral ? (
                      <div className="rounded-md border border-[#d8e7e3] bg-white p-2.5 sm:p-3">
                        <h4 className="text-sm font-bold text-[#082c3a]">Website enquiry</h4>
                        <dl className="mt-3 grid gap-2 text-sm">
                          {[
                            ["Source", selectedQuote.quote?.source || selectedQuote.location || "Contact page"],
                            ["Message", quoteMessage(selectedQuote)],
                          ].map(([label, value]) => (
                            <div key={label} className="grid gap-1 border-b border-[#edf4f2] pb-2 last:border-b-0 last:pb-0 sm:grid-cols-[90px_1fr] sm:gap-3">
                              <dt className="font-bold text-[#60777f]">{label}</dt>
                              <dd className="text-[#082c3a]">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      ) : selectedRequestType === "cctv" ? (
                      <div className="rounded-md border border-[#d8e7e3] bg-white p-2.5 sm:p-3">
                        <h4 className="text-sm font-bold text-[#082c3a]">CCTV scope</h4>
                        <dl className="mt-3 grid gap-2 text-sm">
                          {[
                            ["Property", selectedQuote.quote?.propertyType || "Not specified"],
                            ["Cameras", `${selectedQuote.quote?.cameraCount || 0}`],
                            ["Entry points", `${selectedQuote.quote?.entryPoints || 0}`],
                            ["Exit points", `${selectedQuote.quote?.exitPoints || 0}`],
                            ["Remote viewing", selectedQuote.quote?.remoteViewing || "Not set"],
                          ].map(([label, value]) => (
                            <div key={label} className="grid gap-1 border-b border-[#edf4f2] pb-2 last:border-b-0 last:pb-0 sm:grid-cols-[110px_1fr] sm:gap-3">
                              <dt className="font-bold text-[#60777f]">{label}</dt>
                              <dd className="text-[#082c3a]">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      ) : (
                      <div className="rounded-md border border-[#d8e7e3] bg-white p-2.5 sm:p-3">
                        <h4 className="text-sm font-bold text-[#082c3a]">Recommended setup</h4>
                        <dl className="mt-3 grid gap-2 text-sm">
                          {[
                            ["Panels", recommendation.selectedPanel?.label ? `${recommendation.panelCount || 1} x ${recommendation.selectedPanel.label}` : "Not available"],
                            ["Battery", recommendation.selectedBattery?.label ? `${recommendation.batteryCount || 1} x ${recommendation.selectedBattery.label}` : "Not available"],
                            ["Inverter", recommendation.selectedInverter?.label ? `${recommendation.inverterCount || 1} x ${recommendation.selectedInverter.label}` : "Not available"],
                            ["Controller", recommendation.selectedController?.label ? `${recommendation.controllerCount || 1} x ${recommendation.selectedController.label}` : "Not needed"],
                          ].map(([label, value]) => (
                            <div key={label} className="grid gap-1 border-b border-[#edf4f2] pb-2 last:border-b-0 last:pb-0 sm:grid-cols-[90px_1fr] sm:gap-3">
                              <dt className="font-bold text-[#60777f]">{label}</dt>
                              <dd className="text-[#082c3a]">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      )}

                      {!isGeneral && selectedRequestType !== "cctv" ? (
                      <div className="rounded-md border border-[#d8e7e3] bg-white p-2.5 sm:p-3">
                        <h4 className="text-sm font-bold text-[#082c3a]">Loads</h4>
                        <div className="mt-2 max-h-52 overflow-x-auto overflow-y-auto">
                          {selectedQuote.quote?.loads?.length ? (
                            <table className="min-w-[360px] w-full text-left text-xs">
                              <thead className="sticky top-0 bg-white text-[#60777f]">
                                <tr>
                                  <th className="py-2">Appliance</th>
                                  <th className="py-2 text-right">Qty</th>
                                  <th className="py-2 text-right">W</th>
                                  <th className="py-2 text-right">Hrs</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedQuote.quote.loads.map((load, index) => (
                                  <tr key={`${selectedQuote.id}-load-${index}`} className="border-t border-[#edf4f2]">
                                    <td className="py-2">{load.appliance || "Appliance"}</td>
                                    <td className="py-2 text-right">{load.quantity || 0}</td>
                                    <td className="py-2 text-right">{load.watts || 0}</td>
                                    <td className="py-2 text-right">{Number(load.dayHours || 0) + Number(load.nightHours || 0)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-sm text-[#60777f]">No loads stored.</p>
                          )}
                        </div>
                      </div>
                      ) : null}

                      <div className="rounded-md border border-[#d8e7e3] bg-white p-2.5 sm:p-3">
                        <h4 className="text-sm font-bold text-[#082c3a]">Quote items</h4>
                        <div className="mt-2 max-h-56 overflow-x-auto overflow-y-auto">
                          {recommendation.quoteLines?.length ? (
                            <table className="min-w-[360px] w-full text-left text-xs">
                              <thead className="sticky top-0 bg-white text-[#60777f]">
                                <tr>
                                  <th className="py-2">Item</th>
                                  <th className="py-2 text-right">Qty</th>
                                  <th className="py-2 text-right">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recommendation.quoteLines.map((line, index) => (
                                  <tr key={`${selectedQuote.id}-line-${index}`} className="border-t border-[#edf4f2]">
                                    <td className="py-2">
                                      <strong className="block text-[#082c3a]">{line.name || "Item"}</strong>
                                      <span className="block text-[#60777f]">{line.description || ""}</span>
                                    </td>
                                    <td className="py-2 text-right">{line.quantity || 0}</td>
                                    <td className="py-2 text-right">{formatNaira(line.amount || 0)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-sm text-[#60777f]">No quote items stored.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-[#d8e7e3] bg-white p-2.5 sm:p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-bold text-[#082c3a]">Follow-up</h4>
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${priority.className}`}>{priority.label}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-[#fbfdfc] p-3 text-xs text-[#60777f]">
                        <span>
                          <strong className="block text-[#4f6a72]">Created</strong>
                          {formatDate(selectedQuote.created_at)}
                        </span>
                        <span>
                          <strong className="block text-[#4f6a72]">Last contact</strong>
                          {formatDate(selectedQuote.last_contacted_at || "")}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                          <div className="text-xs font-bold text-[#4f6a72]">
                            Handled by
                            <div className="mt-1 min-h-10 rounded-md border border-[#bddbd4] bg-[#fbfdfc] px-3 py-2 text-sm text-[#082c3a]">
                              <strong className="block">{currentUser?.name || "Admin user"}</strong>
                              <span className="mt-0.5 inline-flex rounded-full bg-[#eef8f5] px-2 py-0.5 text-[11px] font-bold text-[#117865]">
                                {currentUser?.role || "Admin"}
                              </span>
                            </div>
                          </div>
                          <label className="text-xs font-bold text-[#4f6a72]">
                          Status
                          <select
                            value={selectedQuote.status || "new"}
                            onChange={(event) => patchQuoteLocal(selectedQuote.id, { status: event.target.value as QuoteStatus })}
                            disabled={!canEditCrm}
                            className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                          >
                            {quoteStatuses.map(([statusKey, label]) => (
                              <option key={statusKey} value={statusKey}>{label}</option>
                            ))}
                          </select>
                          </label>
                        </div>
                        <label className="text-xs font-bold text-[#4f6a72]">
                          Follow-up date
                          <input
                            type="date"
                            value={selectedQuote.follow_up_date || ""}
                            onChange={(event) => patchQuoteLocal(selectedQuote.id, { follow_up_date: event.target.value })}
                            disabled={!canEditCrm}
                            className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                          />
                        </label>
                        <label className="text-xs font-bold text-[#4f6a72]">
                          Stage note
                          <textarea
                            value={stageNoteDraft}
                            onChange={(event) => setStageNoteDraft(event.target.value)}
                            rows={3}
                            disabled={!canEditCrm}
                            className="mt-1 w-full resize-none rounded-md border border-[#bddbd4] px-3 py-2 text-sm text-[#082c3a]"
                            placeholder={`Add note for ${quoteStatusLabel(selectedQuote.status)} stage...`}
                          />
                        </label>
                        <label className="text-xs font-bold text-[#4f6a72]">
                          Internal summary
                          <textarea
                            value={selectedQuote.admin_note || ""}
                            onChange={(event) => patchQuoteLocal(selectedQuote.id, { admin_note: event.target.value })}
                            rows={2}
                            disabled={!canEditCrm}
                            className="mt-1 w-full resize-none rounded-md border border-[#bddbd4] px-3 py-2 text-sm text-[#082c3a]"
                            placeholder="Short current summary for the team..."
                          />
                        </label>
                        <div className="grid gap-2 rounded-md border border-[#d8e7e3] bg-[#fbfdfc] p-3">
                          <label className="text-xs font-bold text-[#4f6a72]">
                            Contact action
                            <select
                              value={contactAction}
                              onChange={(event) => setContactAction(event.target.value as ContactAction)}
                              disabled={!canEditCrm}
                              className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a]"
                            >
                              {contactActions.map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={saveSelectedQuote}
                              disabled={!canEditCrm}
                              className="h-10 rounded-md bg-[#117865] px-3 text-sm font-bold text-white transition hover:bg-[#0f6b5b]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={markSelectedContacted}
                              disabled={!canEditCrm}
                              className="h-10 rounded-md bg-[#082c3a] px-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(8,44,58,0.18)] transition hover:bg-[#0d3f50] active:scale-[0.99]"
                            >
                              Log action
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={copyWhatsAppMessage}
                            disabled={!canEditCrm}
                            className="h-10 rounded-md border border-[#bddbd4] px-4 text-sm font-bold text-[#082c3a] transition hover:bg-[#f4faf8]"
                          >
                            Copy WhatsApp message
                          </button>
                        </div>
                        <div className="rounded-md border border-[#d8e7e3] bg-[#fbfdfc] p-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold uppercase tracking-[0.1em] text-[#4f6a72]">Stage notes</h5>
                            <span className="text-xs text-[#60777f]">{selectedQuote.stage_notes?.length || 0} entries</span>
                          </div>
                          <div className="mt-3 grid max-h-56 gap-3 overflow-y-auto pr-1">
                            {selectedQuote.stage_notes?.length ? selectedQuote.stage_notes.slice().reverse().map((entry, index) => (
                              <div key={`${entry.created_at}-${index}`} className="border-l-2 border-[#117865] pl-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${quoteStatusClass(entry.status)}`}>
                                    {quoteStatusLabel(entry.status)}
                                  </span>
                                  <strong className="text-xs text-[#082c3a]">{entry.employee || "TRI-P staff"}</strong>
                                  <span className="text-xs text-[#60777f]">{formatDate(entry.created_at)}</span>
                                </div>
                                <p className="mt-1 text-sm leading-5 text-[#4f6a72]">{entry.note}</p>
                              </div>
                            )) : (
                              <p className="text-sm text-[#60777f]">No stage notes yet. Add a stage note before saving or logging contact.</p>
                            )}
                          </div>
                        </div>
                        <div className="rounded-md bg-[#fbfdfc] p-3 text-xs leading-5 text-[#60777f]">
                          Last contacted: {formatDate(selectedQuote.last_contacted_at || "")}
                        </div>
                        <div className="rounded-md bg-[#fbfdfc] p-3 text-xs leading-5 text-[#60777f]">
                          Site note: {selectedQuote.site_note || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="p-6 text-sm text-[#60777f]">Select a client request to review details.</div>
            )}
          </div>
        </div>
      </section>
      </>
      ) : null}

      {catalogueMode && !canManageCatalogue ? (
      <section className="rounded-lg border border-[#d8e7e3] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">Catalogue</p>
        <h2 className="mt-1 text-xl font-bold text-[#082c3a]">Catalogue access required</h2>
        <p className="mt-2 text-sm leading-6 text-[#60777f]">Your role can use the CRM, but cannot add, remove, or change product and protection catalogue items.</p>
      </section>
      ) : null}

      {catalogueMode && canManageCatalogue ? (
      <>
      <section id="product-catalogue" className="rounded-lg border border-[#d8e7e3] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#117865]">{catalogueMeta.eyebrow}</p>
            <h2 className="mt-1 text-xl font-bold text-[#082c3a]">{catalogueMeta.title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#60777f]">
              {catalogueMeta.detail} Duplicate checks apply within the same brand, model, category, capacity, and voltage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddProductOpen(true)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#117865] px-5 text-sm font-bold text-white transition hover:bg-[#0d6757]"
          >
            Add product
          </button>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-5">
        {[
          ["Solar panels", counts.panels, "panel", "products"],
          ["Charge controllers", counts.controllers, "controller", "products"],
          ["Batteries", counts.batteries, "battery", "products"],
          ["Inverters", counts.inverters, "hybrid-inverter", "products"],
          [
            activeSection === "accessories" ? "Accessories" : "Protection/accessories",
            counts.protection,
            activeSection === "accessories" ? "protection-cables" : "protection-breakers",
            activeSection === "accessories" ? "accessories" : "protection",
          ],
        ].map(([title, count, groupKey, targetSection]) => (
          <button
            key={String(title)}
            type="button"
            onClick={() => scrollToCatalogueGroup(String(groupKey), targetSection as SolarAdminSection)}
            className="rounded-lg border border-[#d8e7e3] bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#117865] hover:bg-[#f4faf8] hover:shadow-[0_14px_32px_rgba(17,120,101,0.16)] focus:outline-none focus:ring-2 focus:ring-[#117865]/25"
          >
            <strong className="block text-sm text-[#082c3a]">{title}</strong>
            <span className="mt-1 block text-xs text-[#60777f]">{count} options</span>
          </button>
        ))}
      </div>

      {addProductOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[#02151d]/70 px-3 py-4 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-product-title"
        >
          <button
            type="button"
            aria-label="Close add product form"
            onClick={() => setAddProductOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />
          <section className="relative z-[81] max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#bddbd4] bg-white shadow-[0_28px_90px_rgba(2,21,29,0.38)]">
            <div className="sticky top-0 z-10 border-b border-[#d8e7e3] bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#117865]">Catalogue</p>
                  <h3 id="add-product-title" className="mt-1 text-xl font-black text-[#082c3a]">Add product</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#60777f]">
                    Choose a category and fill only the details that apply.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddProductOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#bddbd4] bg-[#f4faf8] text-lg font-black text-[#082c3a] transition hover:border-[#117865] hover:bg-[#e6f5f0]"
                  aria-label="Close"
                >
                  x
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid gap-3 rounded-xl border border-[#d8e7e3] bg-[#f7fbfa] p-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-xs font-bold text-[#4f6a72]">
                  <span>Category<span className="ml-0.5 text-[#d12f2f]">*</span></span>
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] bg-white px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
                  >
                    {categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                {([
                  ["manufacturer", "Brand / manufacturer", "text"],
                  ["model", "Model / name", "text"],
                  ["capacity_label", "Display label", "text"],
                  ["capacity", "Capacity", "number"],
                  ["voltage", form.category === "knife-switch" ? "Poles" : "Voltage", "number"],
                  ["price", "Price", "number"],
                  ["surge_va", "Surge VA", "number"],
                  ["hybrid_pv_current_a", "Hybrid PV current", "number"],
                ] as Array<[keyof ProductForm, string, "text" | "number"]>)
                  .filter(([key]) => productFieldApplies(form.category, key))
                  .map(([key, label, type]) => formField(form, setForm, key, productFieldLabel(form.category, key, label), type, productFieldHelp(form.category, key), isRequiredProductField(form.category, key)))}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-[#edf4f2] pt-4 sm:flex-row sm:items-center sm:justify-between">


                <div className="flex flex-col gap-3 sm:flex-row">
                  {editingId ? (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="h-11 rounded-full bg-[#f7e9e9] px-5 text-sm font-bold text-[#9b1c1c] transition hover:bg-[#f2dcdc]"
                    >
                      Cancel edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setAddProductOpen(false)}
                    className="h-11 rounded-full bg-[#eef7f4] px-5 text-sm font-bold text-[#082c3a] transition hover:bg-[#dff0eb]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProduct}
                    className="h-11 rounded-full bg-[#117865] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(17,120,101,0.22)] transition hover:bg-[#0d6757]"
                  >
                    Save product
                  </button>
                </div>
              </div>
              {status ? <p className={`mt-4 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${catalogueStatusClass(status)}`}>{status}</p> : null}
            </div>
          </section>
        </div>
      ) : status ? (
        <p className={`rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${catalogueStatusClass(status)}`}>{status}</p>
      ) : null}
      <section className="rounded-lg border border-[#d8e7e3] bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1 text-xs font-bold text-[#4f6a72]">
            Search catalogue
            <input
              value={catalogueSearch}
              onChange={(event) => setCatalogueSearch(event.target.value)}
              placeholder="Search brand, model, capacity, category..."
              className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
            />
          </label>
          <label className="text-xs font-bold text-[#4f6a72]">
            Category
            <select
              value={catalogueCategoryFilter}
              onChange={(event) => setCatalogueCategoryFilter(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] lg:w-52"
            >
              <option value="all">All categories</option>
              {categoryOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-[#4f6a72]">
            Brand
            <select
              value={catalogueBrandFilter}
              onChange={(event) => setCatalogueBrandFilter(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] lg:w-48"
            >
              <option value="all">All brands</option>
              {catalogueBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-[#4f6a72]">
            Health
            <select
              value={catalogueHealthFilter}
              onChange={(event) => setCatalogueHealthFilter(event.target.value as CatalogueHealthFilter)}
              className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] lg:w-48"
            >
              <option value="all">All items</option>
              <option value="default">Defaults only</option>
              <option value="missing-price">Missing price</option>
              <option value="missing-capacity">Missing capacity</option>
              <option value="missing-voltage">Missing voltage</option>
            </select>
          </label>
          {activeSection === "products" ? (
            <button
              type="button"
              onClick={exportCatalogueCsv}
              className="h-10 rounded-md border border-[#bddbd4] px-4 text-sm font-bold text-[#082c3a] transition hover:bg-[#f4faf8]"
            >
              Export CSV
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#60777f]">Showing {filteredProductsForCatalogue.length} of {products.length} items</span>
          {(catalogueSearch || catalogueCategoryFilter !== "all" || catalogueBrandFilter !== "all" || catalogueHealthFilter !== "all") ? (
            <button
              type="button"
              onClick={() => {
                setCatalogueSearch("");
                setCatalogueCategoryFilter("all");
                setCatalogueBrandFilter("all");
                setCatalogueHealthFilter("all");
              }}
              className="rounded-full border border-[#bddbd4] px-3 py-1 font-bold text-[#082c3a] transition hover:bg-[#f4faf8]"
            >
              Clear catalogue filters
            </button>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4">
        {visibleGroups.map((group) => (
          <details
            key={group.key}
            id={`catalogue-group-${group.key}`}
            open={openGroups[group.key] ?? activeSection === "products"}
            onToggle={(event) => {
              const isOpen = event.currentTarget.open;
              setOpenGroups((current) => ({
                ...current,
                [group.key]: isOpen,
              }));
            }}
            className={`scroll-mt-24 overflow-hidden rounded-lg border bg-white shadow-sm transition ${
              highlightedGroup === group.key
                ? "border-[#117865] shadow-[0_0_0_4px_rgba(17,120,101,0.14),0_18px_40px_rgba(17,120,101,0.16)]"
                : "border-[#d8e7e3]"
            }`}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 bg-[#fbfdfc] px-5 py-4">
              <h3 className="text-lg font-bold text-[#082c3a]">{group.title}</h3>
              <span className="text-sm text-[#60777f]">{group.products.length} options</span>
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm text-[#082c3a]">
                <thead>
                  <tr className="border-y border-[#d8e7e3] bg-[#fbfdfc] text-xs uppercase text-[#4f6a72]">
                    <th className="p-3">Product</th>
                    <th className="p-3">Voltage</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Default</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.products
                    .slice()
                    .sort((a, b) => `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`))
                    .map((product) => {
                      const isEditing = editingId === product.id;
                      const isInverter = product.category.includes("inverter");
                      return (
                        <tr key={product.id} className="border-b border-[#d8e7e3] align-top text-[#082c3a]">
                          {isEditing ? (
                            <>
                              <td className="space-y-2 p-3 text-[#082c3a]">
                                <input value={editingForm.manufacturer} onChange={(event) => setEditingForm((current) => ({ ...current, manufacturer: event.target.value }))} className="h-9 w-full rounded-md border border-[#bddbd4] px-2 text-[#082c3a]" />
                                <input value={editingForm.model} onChange={(event) => setEditingForm((current) => ({ ...current, model: event.target.value }))} className="h-9 w-full rounded-md border border-[#bddbd4] px-2 text-[#082c3a]" />
                                {isInverter ? (
                                  <label className="block text-[11px] font-bold text-[#4f6a72]">
                                    {productFieldLabel(editingForm.category, "surge_va", "Surge / peak output (VA)")}
                                    <input type="number" min={0} value={editingForm.surge_va} onChange={(event) => setEditingForm((current) => ({ ...current, surge_va: Number(event.target.value) }))} placeholder="e.g. 5000" title={productFieldHelp(editingForm.category, "surge_va")} aria-label={productFieldLabel(editingForm.category, "surge_va", "Surge / peak output (VA)")} className="mt-1 h-9 w-full rounded-md border border-[#bddbd4] px-2 text-[#082c3a] outline-none focus:border-[#117865]" />
                                    <span className="mt-1 block text-[10px] font-semibold leading-4 text-[#60777f]">{productFieldHelp(editingForm.category, "surge_va")}</span>
                                  </label>
                                ) : null}
                                {product.category === "hybrid-inverter" ? (
                                  <label className="block text-[11px] font-bold text-[#4f6a72]" title={productFieldHelp(editingForm.category, "hybrid_pv_current_a")}>
                                    {productFieldLabel(editingForm.category, "hybrid_pv_current_a", "Hybrid PV input current limit (A)")}
                                    <input type="number" min={0} value={editingForm.hybrid_pv_current_a} onChange={(event) => setEditingForm((current) => ({ ...current, hybrid_pv_current_a: Number(event.target.value) }))} placeholder="e.g. 100" title={productFieldHelp(editingForm.category, "hybrid_pv_current_a")} aria-label={productFieldLabel(editingForm.category, "hybrid_pv_current_a", "Hybrid PV input current limit (A)")} className="mt-1 h-9 w-full rounded-md border border-[#bddbd4] px-2 text-[#082c3a] outline-none focus:border-[#117865]" />
                                    <span className="mt-1 block text-[10px] font-semibold leading-4 text-[#60777f]">{productFieldHelp(editingForm.category, "hybrid_pv_current_a")}</span>
                                  </label>
                                ) : null}
                              </td>
                              <td className="p-3 text-[#082c3a]">
                                {productFieldApplies(editingForm.category, "voltage") ? (
                                  <input type="number" value={editingForm.voltage} onChange={(event) => setEditingForm((current) => ({ ...current, voltage: Number(event.target.value) }))} className="h-9 w-24 rounded-md border border-[#bddbd4] px-2 text-[#082c3a]" />
                                ) : (
                                  <span className="text-[#60777f]">N/A</span>
                                )}
                              </td>
                              <td className="space-y-2 p-3 text-[#082c3a]">
                                <input type="number" value={editingForm.capacity} onChange={(event) => setEditingForm((current) => ({ ...current, capacity: Number(event.target.value) }))} className="h-9 w-32 rounded-md border border-[#bddbd4] px-2 text-[#082c3a]" />
                                <input value={editingForm.capacity_label} onChange={(event) => setEditingForm((current) => ({ ...current, capacity_label: event.target.value }))} className="h-9 w-40 rounded-md border border-[#bddbd4] px-2 text-[#082c3a]" />
                              </td>
                              <td className="p-3 text-[#082c3a]"><input type="number" value={editingForm.price} onChange={(event) => setEditingForm((current) => ({ ...current, price: Number(event.target.value) }))} className="h-9 w-32 rounded-md border border-[#bddbd4] px-2 text-[#082c3a]" /></td>
                              <td className="p-3 text-[#117865]">{product.is_default ? "\u2605" : ""}</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => updateProduct(product.id)} title="Save product" className="h-9 w-9 rounded-md bg-[#e8f4ff] font-bold text-[#0b5f8a]">{"\u2713"}</button>
                                  <button type="button" onClick={() => setEditingId(null)} title="Cancel edit" className="h-9 w-9 rounded-md bg-[#f7e9e9] font-bold text-[#9b1c1c]">{"\u00d7"}</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-3 text-[#082c3a]">
                                <strong>{product.manufacturer}</strong> {product.model}
                                {isInverter ? <small className="mt-1 block text-[#60777f]">{(product.surge_va || product.capacity * 2).toLocaleString()}VA surge{product.hybrid_pv_current_a ? `, ${product.hybrid_pv_current_a}A PV` : ""}</small> : null}
                                <small className="mt-1 block text-[#60777f]">{categoryLabel(product.category)}</small>
                              </td>
                              <td className="p-3 text-[#082c3a]">{voltageLabel(product)}</td>
                              <td className="p-3 text-[#082c3a]">{displayCapacity(product)}</td>
                              <td className="p-3 text-[#082c3a]">{rowPrice(product)}</td>
                              <td className="p-3 text-[#117865]" title={product.is_default ? "Default product" : ""}>{product.is_default ? "\u2605" : ""}</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => makeDefault(product)} title="Make default" className="h-9 w-9 rounded-md bg-[#e8f4ff] font-bold text-[#0b5f8a]">{"\u2605"}</button>
                                  <button type="button" onClick={() => startEdit(product)} title="Edit product" className="h-9 w-9 rounded-md bg-[#eef7f4] font-bold text-[#082c3a]">{"\u270e"}</button>
                                  <button type="button" onClick={() => deleteProduct(product.id)} title="Delete product" className="h-9 w-9 rounded-md bg-[#f7e9e9] font-bold text-[#9b1c1c]">{"\u00d7"}</button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </details>
        ))}
        {!visibleGroups.some((group) => group.products.length) ? (
          <div className="rounded-lg border border-[#d8e7e3] bg-white p-5 text-sm text-[#60777f]">
            No items in this section yet. Add a product above or load the starter catalogue.
          </div>
        ) : null}
      </div>
      </>
      ) : null}
    </div>
  );
}






























