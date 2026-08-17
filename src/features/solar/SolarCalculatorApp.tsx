"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IoArrowBack,
  IoArrowForward,
  IoBatteryChargingOutline,
  IoCalculatorOutline,
  IoFlashOutline,
  IoHomeOutline,
  IoLocationOutline,
  IoClose,
  IoMenu,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoSnowOutline,
  IoStorefrontOutline,
  IoSunnyOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { appliances, defaultAssumptions, defaultCatalogue } from "./defaults";
import { calculateSolarRecommendation, defaultLoadCycle, manufacturerOptions } from "./engine";
import { formatNaira, formatVa, formatW, formatWh } from "./format";
import type {
  BatteryProduct,
  Catalogue,
  ControllerProduct,
  InverterProduct,
  InverterType,
  LoadEntry,
  PanelProduct,
  ProtectionProduct,
  ProtectionKind,
  SolarAssumptions,
} from "./types";

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

const wizardTransferStorageKey = "triptech-solar-wizard-transfer";

function dbCatalogue(products: DbProduct[]): Catalogue | null {
  if (!products.length) return null;
  const panels: PanelProduct[] = [];
  const batteries: BatteryProduct[] = [];
  const inverters: InverterProduct[] = [];
  const controllers: ControllerProduct[] = [];
  const protection: ProtectionProduct[] = [];
  const protectionKinds = new Set<ProtectionKind>([
    "dc-breaker",
    "ac-breaker",
    "dc-spd",
    "ac-spd",
    "avr",
    "knife-switch",
    "combiner-box",
    "breaker-box",
    "ac-cable",
    "pv-cable",
    "battery-cable",
    "earthing-cable",
    "solar-rail",
    "mounting",
    "nails-fasteners",
    "lugs",
    "tape",
    "zip-tie",
  ]);

  products.forEach((product) => {
    const label = product.capacity_label || product.model;
    if (product.category === "panel") {
      panels.push({
        id: `db-panel-${product.id}`,
        manufacturer: product.manufacturer,
        label,
        watts: product.capacity,
        price: product.price,
        isDefault: product.is_default,
      });
    } else if (product.category === "battery") {
      batteries.push({
        id: `db-battery-${product.id}`,
        manufacturer: product.manufacturer,
        label,
        voltage: product.voltage as 12 | 24 | 48,
        ah: product.voltage ? Math.round(product.capacity / product.voltage) : 0,
        wh: product.capacity,
        price: product.price,
        isDefault: product.is_default,
      });
    } else if (product.category === "hybrid-inverter" || product.category === "non-hybrid-inverter") {
      const type: InverterType = product.category === "hybrid-inverter" ? "hybrid" : "non-hybrid";
      inverters.push({
        id: `db-inverter-${product.id}`,
        manufacturer: product.manufacturer,
        label,
        type,
        kva: product.capacity / 1000,
        va: product.capacity,
        voltage: product.voltage as 12 | 24 | 48,
        surgeVa: product.surge_va || product.capacity * 2,
        hybridPvCurrentA: product.hybrid_pv_current_a || undefined,
        price: product.price,
        isDefault: product.is_default,
      });
    } else if (product.category === "controller") {
      controllers.push({
        id: `db-controller-${product.id}`,
        manufacturer: product.manufacturer,
        label,
        amps: product.capacity,
        price: product.price,
        isDefault: product.is_default,
      });
    } else if (protectionKinds.has(product.category as ProtectionKind)) {
      protection.push({
        id: `db-protection-${product.id}`,
        manufacturer: product.manufacturer,
        label,
        kind: product.category as ProtectionKind,
        capacity: product.capacity || 1,
        poles: product.voltage || undefined,
        price: product.price,
        isDefault: product.is_default,
      });
    }
  });

  return {
    panels: panels.length ? panels : defaultCatalogue.panels,
    batteries: batteries.length ? batteries : defaultCatalogue.batteries,
    inverters: inverters.length ? inverters : defaultCatalogue.inverters,
    controllers: controllers.length ? controllers : defaultCatalogue.controllers,
    protection: protection.length ? protection : defaultCatalogue.protection,
  };
}

const newLoad = (applianceName = "18W LED light"): LoadEntry => {
  const appliance = appliances.find((item) => item.name === applianceName) || appliances[0];
  return {
    id: crypto.randomUUID(),
    appliance: appliance.name,
    quantity: 1,
    watts: appliance.watts,
    dayHours: 3,
    nightHours: 0,
    cyclePercent: defaultLoadCycle(appliance.name),
  };
};

const wizardLoad = (
  applianceName: string,
  quantity: number,
  dayHours: number,
  nightHours: number,
  cyclePercent?: number
): LoadEntry => {
  const load = newLoad(applianceName);
  return {
    ...load,
    quantity,
    dayHours,
    nightHours,
    cyclePercent: cyclePercent ?? load.cyclePercent,
  };
};

function grouped<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const group = key(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

function clampNumber(value: unknown, min: number, max: number) {
  const numericValue = Number(value || 0);
  return Math.min(max, Math.max(min, numericValue));
}

const applianceCategoryOrder = [
  "Lighting",
  "Fans & ventilation",
  "TV & entertainment",
  "Charging & internet",
  "Office & IT",
  "Refrigeration",
  "Kitchen",
  "Laundry & cleaning",
  "Security",
  "Pumps & motors",
  "Air conditioning",
  "Commercial & services",
  "Medical",
  "Custom",
];

const wizardProjectTypes = [
  {
    id: "student",
    title: "Student / individual",
    subtitle: "Very small budget setup for lights, charging, and a few essentials.",
  },
  {
    id: "home",
    title: "Home",
    subtitle: "Flats, bungalows, duplexes, and family homes.",
  },
  {
    id: "business",
    title: "Shop or office",
    subtitle: "Business loads, computers, lighting, POS, and CCTV.",
  },
  {
    id: "cooling",
    title: "Home with AC",
    subtitle: "For clients who want air conditioning included.",
  },
];

const wizardFanOptions = ["Solar fan", "Rechargeable fan", "Standing fan", "Ceiling fan", "Wall fan", "Extractor fan"];

function isWizardFanLoad(applianceName: string) {
  return applianceName.toLowerCase().includes("fan");
}

const wizardProfiles = [
  {
    id: "student-basic",
    projectType: "student",
    title: "Student basic",
    subtitle: "One or two lights and phone charging only. No fridge, freezer, or heavy load.",
    rooms: 1,
    loads: [
      ["9W LED bulb", 2, 2, 5, 100],
      ["Phone charger", 1, 2, 2, 100],
      ["Solar fan", 0, 1, 3, 100],
      ["Rechargeable fan", 0, 1, 3, 100],
      ["WiFi router", 0, 4, 4, 100],
      ["Laptop", 0, 3, 1, 100],
      ["24 inch LED TV", 0, 3, 1, 100],
      ["30 inch LED TV", 0, 3, 1, 100],
    ] as [string, number, number, number, number][],
  },
  {
    id: "student-comfort",
    projectType: "student",
    title: "Student comfort",
    subtitle: "Lights, phone charging, router, and a rechargeable fan.",
    rooms: 1,
    loads: [
      ["9W LED bulb", 2, 3, 5, 100],
      ["Phone charger", 2, 2, 2, 100],
      ["WiFi router", 1, 4, 4, 100],
      ["Solar fan", 0, 1, 3, 100],
      ["Rechargeable fan", 1, 1, 3, 100],
      ["Laptop", 0, 3, 1, 100],
      ["24 inch LED TV", 0, 3, 1, 100],
      ["30 inch LED TV", 0, 3, 1, 100],
      ["Decoder / DSTV box", 0, 3, 1, 100],
    ] as [string, number, number, number, number][],
  },
  {
    id: "self-contain",
    projectType: "home",
    title: "Self-contain or studio",
    subtitle: "Basic lighting, fan, TV, router, charging, and a small fridge.",
    rooms: 1,
    loads: [
      ["18W LED light", 4, 3, 5, 100],
      ["Standing fan", 1, 2, 7, 100],
      ["30 inch LED TV", 1, 4, 2, 100],
      ["24 inch LED TV", 0, 4, 2, 100],
      ["32 inch LED TV", 0, 4, 2, 100],
      ["43 inch LED TV", 0, 4, 2, 100],
      ["WiFi router", 1, 8, 8, 100],
      ["Phone charger", 2, 2, 1, 100],
      ["Small fridge / minibar", 1, 8, 8, 40],
      ["Solar fan", 0, 2, 6, 100],
      ["Ceiling fan", 0, 2, 6, 100],
      ["Wall fan", 0, 2, 6, 100],
    ] as [string, number, number, number, number][],
  },
  {
    id: "two-room-flat",
    projectType: "home",
    title: "2-room flat",
    subtitle: "Good for a small flat with essential comfort loads.",
    rooms: 2,
    loads: [
      ["18W LED light", 6, 3, 5, 100],
      ["Standing fan", 2, 2, 6, 100],
      ["32 inch LED TV", 1, 4, 2, 100],
      ["30 inch LED TV", 0, 4, 2, 100],
      ["43 inch LED TV", 0, 4, 2, 100],
      ["50 inch LED TV", 0, 4, 2, 100],
      ["WiFi router", 1, 8, 8, 100],
      ["Phone charger", 4, 2, 1, 100],
      ["Small fridge", 1, 8, 8, 40],
      ["Solar fan", 0, 2, 6, 100],
      ["Ceiling fan", 0, 2, 6, 100],
      ["Wall fan", 0, 2, 6, 100],
    ] as [string, number, number, number, number][],
  },
  {
    id: "three-bedroom",
    projectType: "home",
    title: "3-bedroom flat or bungalow",
    subtitle: "More rooms, more fans, fridge/freezer, TV, internet, and daily essentials.",
    rooms: 3,
    loads: [
      ["18W LED light", 10, 3, 6, 100],
      ["Ceiling fan", 4, 2, 7, 100],
      ["43 inch LED TV", 1, 5, 2, 100],
      ["32 inch LED TV", 1, 4, 2, 100],
      ["55 inch LED TV", 0, 5, 2, 100],
      ["65 inch LED TV", 0, 5, 2, 100],
      ["WiFi router", 1, 10, 10, 100],
      ["Phone charger", 6, 2, 1, 100],
      ["Medium fridge", 1, 8, 8, 40],
      ["Deep freezer", 1, 6, 4, 40],
    ] as [string, number, number, number, number][],
  },
  {
    id: "duplex",
    projectType: "home",
    title: "Duplex or larger home",
    subtitle: "Larger living space with more rooms, more lights, freezer, and entertainment loads.",
    rooms: 5,
    loads: [
      ["18W LED light", 16, 3, 6, 100],
      ["Ceiling fan", 6, 2, 7, 100],
      ["55 inch LED TV", 1, 5, 2, 100],
      ["43 inch LED TV", 1, 4, 2, 100],
      ["65 inch LED TV", 0, 5, 2, 100],
      ["75 inch LED TV", 0, 5, 2, 100],
      ["WiFi router", 1, 12, 12, 100],
      ["Phone charger", 8, 2, 1, 100],
      ["Large fridge", 1, 8, 8, 40],
      ["Deep freezer", 1, 7, 5, 40],
    ] as [string, number, number, number, number][],
  },
  {
    id: "small-shop",
    projectType: "business",
    title: "Small shop",
    subtitle: "Lighting, POS, internet, CCTV, and small customer-facing loads.",
    rooms: 1,
    loads: [
      ["18W LED light", 8, 9, 0, 100],
      ["POS terminal", 1, 9, 0, 100],
      ["Receipt printer", 0, 3, 0, 50],
      ["LED shop sign", 0, 7, 0, 100],
      ["WiFi router", 1, 10, 0, 100],
      ["CCTV camera", 4, 12, 12, 100],
      ["CCTV DVR/NVR", 1, 12, 12, 100],
      ["Standing fan", 1, 7, 0, 100],
      ["Solar fan", 0, 7, 0, 100],
      ["Wall fan", 0, 7, 0, 100],
      ["Phone charger", 2, 8, 0, 100],
      ["Ring light", 0, 6, 0, 100],
      ["Small speaker", 0, 5, 0, 100],
      ["Laptop", 0, 7, 0, 100],
      ["Computer monitor", 0, 7, 0, 100],
      ["Decoder / DSTV box", 0, 8, 0, 100],
      ["Sound bar", 0, 5, 0, 100],
      ["Small fridge / minibar", 0, 8, 0, 40],
      ["Printer", 0, 2, 0, 25],
      ["Cash register", 0, 8, 0, 100],
      ["Barcode scanner", 0, 8, 0, 100],
    ] as [string, number, number, number, number][],
  },
  {
    id: "office",
    projectType: "business",
    title: "Office",
    subtitle: "Lighting, computers, internet, CCTV, and shared office equipment.",
    rooms: 4,
    loads: [
      ["18W LED light", 16, 9, 0, 100],
      ["Laptop", 4, 8, 0, 100],
      ["Computer monitor", 4, 8, 0, 100],
      ["WiFi router", 1, 10, 0, 100],
      ["POS terminal", 2, 9, 0, 100],
      ["Receipt printer", 1, 3, 0, 50],
      ["CCTV camera", 6, 12, 12, 100],
      ["CCTV DVR/NVR", 1, 12, 12, 100],
      ["Phone charger", 6, 8, 0, 100],
      ["Printer", 1, 2, 0, 25],
      ["Scanner", 0, 2, 0, 25],
      ["Office copier", 0, 2, 0, 25],
      ["Projector", 0, 3, 0, 100],
      ["Network switch", 0, 10, 0, 100],
      ["Access control unit", 0, 10, 0, 100],
      ["Small fridge / minibar", 0, 8, 0, 40],
      ["Standing fan", 0, 7, 0, 100],
      ["Solar fan", 0, 7, 0, 100],
      ["Wall fan", 0, 7, 0, 100],
    ] as [string, number, number, number, number][],
  },
  {
    id: "one-ac-home",
    projectType: "cooling",
    title: "Home with AC",
    subtitle: "A practical starter setup with one AC included.",
    rooms: 3,
    acRooms: 1,
    loads: [
      ["18W LED light", 8, 3, 6, 100],
      ["Ceiling fan", 3, 2, 5, 100],
      ["43 inch LED TV", 1, 4, 2, 100],
      ["32 inch LED TV", 0, 4, 2, 100],
      ["55 inch LED TV", 0, 4, 2, 100],
      ["WiFi router", 1, 10, 10, 100],
      ["Medium fridge", 1, 8, 8, 40],
      ["1 HP AC", 1, 3, 4, 60],
    ] as [string, number, number, number, number][],
  },
  {
    id: "duplex-with-ac",
    projectType: "cooling",
    title: "Duplex with AC",
    subtitle: "Larger home starter setup with two AC points included.",
    rooms: 5,
    acRooms: 2,
    loads: [
      ["18W LED light", 16, 3, 6, 100],
      ["Ceiling fan", 5, 2, 5, 100],
      ["55 inch LED TV", 1, 5, 2, 100],
      ["43 inch LED TV", 1, 4, 2, 100],
      ["65 inch LED TV", 0, 5, 2, 100],
      ["75 inch LED TV", 0, 5, 2, 100],
      ["WiFi router", 1, 12, 12, 100],
      ["Large fridge", 1, 8, 8, 40],
      ["Deep freezer", 1, 7, 5, 40],
      ["1 HP AC", 2, 3, 4, 60],
    ] as [string, number, number, number, number][],
  },
];

const wizardBackupOptions = [
  {
    id: "evening",
    title: "Evening comfort",
    detail: "Good for basic evening and night use.",
    sunHours: 5.5,
    dayScale: 0.9,
    nightScale: 1,
    reserveMargin: 0.18,
  },
  {
    id: "workday",
    title: "Workday support",
    detail: "Better for offices, shops, and longer daytime use.",
    sunHours: 5,
    dayScale: 1.25,
    nightScale: 0.85,
    reserveMargin: 0.22,
  },
  {
    id: "strong",
    title: "Stronger backup",
    detail: "More conservative for homes that need longer backup.",
    sunHours: 4.5,
    dayScale: 1.1,
    nightScale: 1.45,
    reserveMargin: 0.35,
  },
];

function roomAwareWizardLoads(
  profile: (typeof wizardProfiles)[number],
  roomCount: number,
  acRoomCount: number,
  acAppliance: string
) {
  if (profile.projectType === "business" || profile.projectType === "student") return profile.loads;

  const rooms = Math.max(1, Math.min(20, Math.round(roomCount || 1)));
  const hasAc = profile.projectType === "cooling";
  const isSmallHome = profile.id === "self-contain" || profile.id === "two-room-flat";
  const acRooms = hasAc ? Math.max(1, Math.min(rooms, Math.round(acRoomCount || 1))) : 0;
  const livingAreaLights = profile.id.includes("duplex") ? 4 : 2;
  const fanCount = hasAc ? Math.max(1, rooms - acRooms) : rooms;
  const phoneChargerCount = Math.max(2, Math.min(10, rooms + 1));
  const primaryTv = rooms <= 1 ? "30 inch LED TV" : rooms <= 2 ? "32 inch LED TV" : rooms <= 4 ? "43 inch LED TV" : "55 inch LED TV";
  const loads: [string, number, number, number, number][] = [
    ["18W LED light", Math.max(2, rooms * 2 + livingAreaLights), 3, 6, 100],
    ["Ceiling fan", Math.max(1, fanCount), 2, 6, 100],
    ["24 inch LED TV", 0, 4, 2, 100],
    ["30 inch LED TV", primaryTv === "30 inch LED TV" ? 1 : 0, 4, 2, 100],
    ["32 inch LED TV", primaryTv === "32 inch LED TV" ? 1 : 0, 4, 2, 100],
    ["43 inch LED TV", primaryTv === "43 inch LED TV" || rooms >= 5 ? 1 : 0, 4, 2, 100],
    ["50 inch LED TV", 0, 4, 2, 100],
    ["55 inch LED TV", primaryTv === "55 inch LED TV" ? 1 : 0, 5, 2, 100],
    ["65 inch LED TV", 0, 5, 2, 100],
    ["75 inch LED TV", 0, 5, 2, 100],
    ["WiFi router", 1, 10, 10, 100],
    ["Phone charger", phoneChargerCount, 2, 1, 100],
    [rooms >= 4 ? "Large fridge" : rooms <= 2 ? "Small fridge" : "Medium fridge", 1, 8, isSmallHome ? 0 : 8, 40],
  ];

  if (rooms >= 3) loads.push(["Deep freezer", 1, 6, isSmallHome ? 0 : 4, 40]);
  loads.push(
    ["Decoder / DSTV box", 0, 4, 2, 100],
    ["Sound bar", 0, 4, 2, 100],
    ["Laptop", 0, 4, 2, 100],
    ["Computer monitor", 0, 4, 1, 100],
    ["Solar fan", 0, 2, 4, 100],
    ["Standing fan", 0, 2, 4, 100],
    ["Rechargeable fan", 0, 2, 4, 100],
    ["Wall fan", 0, 2, 4, 100],
    ["Outdoor security light", 0, 0, 10, 100],
    ["CCTV camera", 0, 12, 12, 100],
    ["CCTV DVR/NVR", 0, 12, 12, 100]
  );
  if (hasAc) loads.push([acAppliance, acRooms, 3, 4, 60]);
  return loads;
}

function applianceCategory(name: string) {
  const item = name.toLowerCase();
  if (item.includes("custom")) return "Custom";
  if (/\bac\b/.test(item) || item.includes("air condition")) return "Air conditioning";
  if (item.includes("pump") || item.includes("borehole")) return "Pumps & motors";
  if (item.includes("fridge") || item.includes("freezer")) return "Refrigeration";
  if (
    item.includes("microwave") ||
    item.includes("kettle") ||
    item.includes("blender") ||
    item.includes("processor") ||
    item.includes("rice cooker") ||
    item.includes("toaster") ||
    item.includes("hot plate") ||
    item.includes("air fryer") ||
    item.includes("warmer")
  ) return "Kitchen";
  if (
    item.includes("washing") ||
    item.includes("iron") ||
    item.includes("dryer") ||
    item.includes("vacuum")
  ) return "Laundry & cleaning";
  if (
    item.includes("tv") ||
    item.includes("television") ||
    item.includes("decoder") ||
    item.includes("dstv") ||
    item.includes("sound") ||
    item.includes("theatre") ||
    item.includes("game console")
  ) return "TV & entertainment";
  if (
    item.includes("charger") ||
    item.includes("router") ||
    item.includes("modem") ||
    item.includes("starlink") ||
    item.includes("power bank")
  ) return "Charging & internet";
  if (
    item.includes("laptop") ||
    item.includes("computer") ||
    item.includes("monitor") ||
    (item.includes("printer") && !item.includes("receipt")) ||
    item.includes("scanner") ||
    item.includes("copier") ||
    item.includes("server") ||
    item.includes("network switch") ||
    item.includes("ups")
  ) return "Office & IT";
  if (
    item.includes("cctv") ||
    item.includes("access control") ||
    item.includes("alarm") ||
    item.includes("fence")
  ) return "Security";
  if (
    item.includes("bulb") ||
    item.includes("light") ||
    item.includes("flood") ||
    item.includes("tube") ||
    item.includes("chandelier") ||
    item.includes("strip")
  ) return "Lighting";
  if (item.includes("fan") || item.includes("extractor")) return "Fans & ventilation";
  if (
    item.includes("pos") ||
    item.includes("receipt") ||
    item.includes("cash") ||
    item.includes("barcode") ||
    item.includes("shop") ||
    item.includes("restaurant") ||
    item.includes("salon") ||
    item.includes("sewing") ||
    item.includes("clippers") ||
    item.includes("amplifier") ||
    item.includes("mixer")
  ) return "Commercial & services";
  if (item.includes("medical") || item.includes("nebulizer") || item.includes("cpap")) return "Medical";
  return "Custom";
}

export default function SolarCalculatorApp({ mode = "wizard" }: { mode?: "wizard" | "manual" }) {
  const [loads, setLoads] = useState<LoadEntry[]>([
    newLoad("32 inch LED TV"),
    newLoad("Standing fan"),
    newLoad("18W LED light"),
  ]);
  const [entryMode, setEntryMode] = useState<"wizard" | "manual">(mode === "manual" ? "manual" : "wizard");
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardProjectTypeId, setWizardProjectTypeId] = useState("home");
  const [wizardProfileId, setWizardProfileId] = useState("two-room-flat");
  const [wizardBackupId, setWizardBackupId] = useState("evening");
  const [wizardRoomCount, setWizardRoomCount] = useState(2);
  const [wizardAcRoomCount, setWizardAcRoomCount] = useState(1);
  const [wizardAcAppliance, setWizardAcAppliance] = useState("1 HP AC");
  const [wizardFloorCount, setWizardFloorCount] = useState(1);
  const [wizardDraftLoads, setWizardDraftLoads] = useState<LoadEntry[]>([]);
  const [wizardSelectedLoadIds, setWizardSelectedLoadIds] = useState<Record<string, boolean>>({});
  const [wizardActiveLoadByCategory, setWizardActiveLoadByCategory] = useState<Record<string, string>>({});
  const [mobileWizardMenuOpen, setMobileWizardMenuOpen] = useState(false);
  const [catalogue, setCatalogue] = useState<Catalogue>(defaultCatalogue);
  const [inverterType, setInverterType] = useState<InverterType>("hybrid");
  const [assumptions, setAssumptions] = useState<SolarAssumptions>(defaultAssumptions);
  const [protectionSelection, setProtectionSelection] = useState<Record<string, boolean>>({});
  const [panelManufacturer, setPanelManufacturer] = useState("");
  const [batteryManufacturer, setBatteryManufacturer] = useState("");
  const [inverterManufacturer, setInverterManufacturer] = useState("");
  const [controllerManufacturer, setControllerManufacturer] = useState("");
  const [quoteStatus, setQuoteStatus] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [submittedQuoteSignature, setSubmittedQuoteSignature] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [siteNote, setSiteNote] = useState("");
  const quoteFormReady = Boolean(
    clientName.trim() &&
    clientEmail.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim()) &&
    phone.trim() &&
    location.trim()
  );

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        const nextCatalogue = dbCatalogue(data.products || []);
        if (nextCatalogue) setCatalogue(nextCatalogue);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (mode !== "manual") return;

    try {
      const savedTransfer = window.sessionStorage.getItem(wizardTransferStorageKey);
      if (!savedTransfer) return;
      const transfer = JSON.parse(savedTransfer) as {
        assumptions?: SolarAssumptions;
        inverterType?: InverterType;
        loads?: LoadEntry[];
      };
      const transferredLoads = Array.isArray(transfer.loads)
        ? transfer.loads.filter((load) => load.appliance && load.quantity > 0)
        : [];

      if (transferredLoads.length) {
        setLoads(transferredLoads.map((load) => ({ ...load, id: crypto.randomUUID() })));
      }
      if (transfer.assumptions) setAssumptions(transfer.assumptions);
      if (transfer.inverterType) setInverterType(transfer.inverterType);
      window.sessionStorage.removeItem(wizardTransferStorageKey);
    } catch {
      window.sessionStorage.removeItem(wizardTransferStorageKey);
    }
  }, [mode]);

  const recommendation = useMemo(
    () =>
      calculateSolarRecommendation(
        loads,
        assumptions,
        { inverterType, panelManufacturer, batteryManufacturer, inverterManufacturer, controllerManufacturer },
        catalogue,
        protectionSelection
      ),
    [assumptions, batteryManufacturer, catalogue, controllerManufacturer, inverterManufacturer, inverterType, loads, panelManufacturer, protectionSelection]
  );
  const currentQuoteSignature = useMemo(
    () =>
      JSON.stringify({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        phone: phone.trim(),
        location: location.trim(),
        siteNote: siteNote.trim(),
        loads: loads.map((load) => ({
          appliance: load.appliance,
          quantity: load.quantity,
          watts: load.watts,
          dayHours: load.dayHours,
          nightHours: load.nightHours,
          cyclePercent: load.cyclePercent,
        })),
        assumptions,
        inverterType,
        panelManufacturer,
        batteryManufacturer,
        inverterManufacturer,
        controllerManufacturer,
        protectionSelection,
        recommendation: recommendation
          ? {
              totalCost: recommendation.totalCost,
              dailyEnergyWh: recommendation.dailyEnergyWh,
              selectedVoltage: recommendation.selectedVoltage,
              panelCount: recommendation.panelCount,
              batteryCount: recommendation.batteryCount,
              inverterCount: recommendation.inverterCount,
              controllerCount: recommendation.controllerCount,
            }
          : null,
      }),
    [
      assumptions,
      batteryManufacturer,
      clientEmail,
      clientName,
      controllerManufacturer,
      inverterManufacturer,
      inverterType,
      loads,
      location,
      panelManufacturer,
      phone,
      protectionSelection,
      recommendation,
      siteNote,
    ]
  );
  const quoteAlreadySubmitted = quoteSubmitted && submittedQuoteSignature === currentQuoteSignature;

  useEffect(() => {
    if (quoteSubmitted && submittedQuoteSignature && submittedQuoteSignature !== currentQuoteSignature) {
      setQuoteSubmitted(false);
      setQuoteStatus("Changes detected. Submit again to send the updated quote request.");
    }
  }, [currentQuoteSignature, quoteSubmitted, submittedQuoteSignature]);

  const manufacturers = useMemo(() => manufacturerOptions(catalogue), [catalogue]);
  const applianceGroups = useMemo(() => {
    const groups = grouped(appliances, (appliance) => applianceCategory(appliance.name));
    return applianceCategoryOrder
      .map((category) => ({ category, items: groups[category] || [] }))
      .filter((group) => group.items.length);
  }, []);
  const protectionGroups = useMemo(
    () => grouped(recommendation?.protectionItems || [], (item) => item.group),
    [recommendation?.protectionItems]
  );
  const selectedWizardProjectType = wizardProjectTypes.find((type) => type.id === wizardProjectTypeId) || wizardProjectTypes[0];
  const availableWizardProfiles = wizardProfiles.filter((profile) => profile.projectType === wizardProjectTypeId);
  const selectedWizardProfile = wizardProfiles.find((profile) => profile.id === wizardProfileId) || wizardProfiles[0];
  const selectedWizardBackup = wizardBackupOptions.find((option) => option.id === wizardBackupId) || wizardBackupOptions[0];
  const selectedWizardIsDuplex = selectedWizardProfile.id.includes("duplex");
  const selectedWizardIsBusiness = selectedWizardProfile.projectType === "business";
  const wizardDraftGroups = useMemo(() => {
    const groups = grouped(wizardDraftLoads, (load) => applianceCategory(load.appliance));
    return applianceCategoryOrder
      .map((category) => {
        const categoryLoads = groups[category] || [];
        if (!categoryLoads.length) return null;
        const optionNames =
          category === "Fans & ventilation"
            ? wizardFanOptions.filter((fan) => appliances.some((appliance) => appliance.name === fan))
            : categoryLoads.map((load) => load.appliance);
        return { category, optionNames };
      })
      .filter(Boolean) as Array<{ category: string; optionNames: string[] }>;
  }, [wizardDraftLoads]);

  const buildWizardDraftLoads = (profileId = wizardProfileId, backupId = wizardBackupId, floorCount = wizardFloorCount) => {
    const profile = wizardProfiles.find((item) => item.id === profileId) || wizardProfiles[0];
    const backup = wizardBackupOptions.find((item) => item.id === backupId) || wizardBackupOptions[0];
    const starterLoads = roomAwareWizardLoads(profile, wizardRoomCount, wizardAcRoomCount, wizardAcAppliance);
    const draftLoads = starterLoads.map(([name, quantity, dayHours, nightHours, cycle]) =>
        wizardLoad(
          name,
          quantity,
          clampNumber(dayHours * backup.dayScale, 0, 12),
          clampNumber(nightHours * backup.nightScale, 0, 12),
          cycle
        )
      );
    setWizardDraftLoads(draftLoads);
    setWizardSelectedLoadIds(Object.fromEntries(draftLoads.map((load) => [load.id, true])));
    setWizardActiveLoadByCategory({});
    updateAssumption("sunHours", backup.sunHours);
    updateAssumption("reserveMargin", backup.reserveMargin);
    updateAssumption("floorCount", floorCount);
    setInverterType(profile.projectType === "business" ? "non-hybrid" : "hybrid");
    setWizardStep(6);
  };

  const continueAfterWizardHeight = (floorCount = wizardFloorCount) => {
    if (selectedWizardIsBusiness) {
      setWizardBackupId("workday");
      buildWizardDraftLoads(wizardProfileId, "workday", floorCount);
      return;
    }
    setWizardStep(5);
  };

  const applyWizardDraftLoads = () => {
    const selectedLoads = wizardDraftLoads.filter((load) => wizardSelectedLoadIds[load.id] && load.quantity > 0);
    setLoads(selectedLoads.length ? selectedLoads : wizardDraftLoads);
    setWizardStep(7);
  };

  const openSelectedLoadsInAdvancedMode = () => {
    const selectedLoads = loads.filter((load) => load.quantity > 0);
    if (!selectedLoads.length) return;

    window.sessionStorage.setItem(
      wizardTransferStorageKey,
      JSON.stringify({
        assumptions,
        inverterType,
        loads: selectedLoads,
      })
    );
    window.location.href = "/services/solar/calculator/manual";
  };

  const updateWizardDraftLoad = (id: string, patch: Partial<LoadEntry>) => {
    setWizardDraftLoads((current) =>
      current.map((load) => {
        if (load.id !== id) return load;
        const next = {
          ...load,
          ...patch,
        };
        if (patch.appliance) {
          const appliance = appliances.find((item) => item.name === patch.appliance);
          if (appliance) {
            next.watts = appliance.watts;
            next.cyclePercent = defaultLoadCycle(appliance.name);
          }
        }
        return {
          ...next,
          quantity: clampNumber(next.quantity, 0, 200),
          watts: clampNumber(next.watts, 0, 10000),
          dayHours: clampNumber(next.dayHours, 0, 12),
          nightHours: clampNumber(next.nightHours, 0, 12),
          cyclePercent: clampNumber(next.cyclePercent, 0, 100),
        };
      })
    );
  };

  const updateWizardGroupedLoadQuantity = (applianceName: string, quantity: number) => {
    const nextQuantity = clampNumber(quantity, 0, 200);
    const appliance = appliances.find((item) => item.name === applianceName);
    if (!appliance) return;
    const category = applianceCategory(applianceName);

    setWizardDraftLoads((current) => {
      const template = current.find((load) => applianceCategory(load.appliance) === category) || current[0];
      if (!template) return current;
      const currentExisting = current.find((load) => load.appliance === applianceName);
      if (currentExisting) {
        setWizardSelectedLoadIds((selected) => ({
          ...selected,
          [currentExisting.id]: nextQuantity > 0,
        }));
        return current.map((load) =>
          load.id === currentExisting.id
            ? {
                ...load,
                quantity: nextQuantity,
                watts: appliance.watts,
                cyclePercent: defaultLoadCycle(applianceName),
              }
            : load
        );
      }

      const targetId = crypto.randomUUID();
      const nextLoad: LoadEntry = {
        ...template,
        id: targetId,
        appliance: applianceName,
        quantity: nextQuantity,
        watts: appliance.watts,
        cyclePercent: defaultLoadCycle(applianceName),
      };
      const templateIndex = current.findIndex((load) => load.id === template.id);
      setWizardSelectedLoadIds((selected) => ({
        ...selected,
        [targetId]: nextQuantity > 0,
      }));
      if (templateIndex < 0) return [...current, nextLoad];
      return [...current.slice(0, templateIndex + 1), nextLoad, ...current.slice(templateIndex + 1)];
    });
    setWizardActiveLoadByCategory((current) => ({
      ...current,
      [category]: applianceName,
    }));
  };

  const updateLoad = (id: string, patch: Partial<LoadEntry>) => {
    setLoads((current) =>
      current.map((load) => {
        if (load.id !== id) return load;
        const next = { ...load, ...patch };
        if (patch.appliance) {
          const appliance = appliances.find((item) => item.name === patch.appliance);
          if (appliance) {
            next.watts = appliance.watts;
            next.cyclePercent = defaultLoadCycle(appliance.name);
          }
        }
        next.dayHours = clampNumber(next.dayHours, 0, 12);
        next.nightHours = clampNumber(next.nightHours, 0, 12);
        next.cyclePercent = clampNumber(next.cyclePercent, 0, 100);
        return next;
      })
    );
  };

  const updateAssumption = (key: keyof SolarAssumptions, value: number) => {
    setAssumptions((current) => ({
      ...current,
      [key]:
        key === "sunHours"
          ? Math.min(8, Math.max(1, value))
          : key === "floorCount"
            ? Math.min(10, Math.max(1, value))
            : value,
    }));
  };

  const setAllProtection = (checked: boolean) => {
    if (!recommendation) return;
    setProtectionSelection(Object.fromEntries(recommendation.protectionItems.map((item) => [item.id, checked])));
  };

  const saveQuoteRequest = async () => {
    if (!recommendation) {
      setQuoteSubmitted(false);
      setQuoteStatus("Add a valid load first.");
      return;
    }
    if (!quoteFormReady) {
      setQuoteSubmitted(false);
      setQuoteStatus("Enter client name, valid email, phone/WhatsApp, and location before requesting a quote.");
      return;
    }
    if (quoteAlreadySubmitted) {
      setQuoteStatus("This quote request has already been received. Change any detail to submit an updated request.");
      return;
    }
    setQuoteSubmitting(true);
    setQuoteSubmitted(false);
    setQuoteStatus("Saving quote request...");
    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName.trim(),
          email: clientEmail.trim(),
          phone: phone.trim(),
          location: location.trim(),
          site_note: siteNote,
            total_cost: recommendation.totalCost,
            daily_energy_wh: recommendation.dailyEnergyWh,
            system_voltage: recommendation.selectedVoltage,
            quote: {
              loads,
              assumptions,
              preferences: {
                inverterType,
                panelManufacturer,
                batteryManufacturer,
                inverterManufacturer,
                controllerManufacturer,
              },
              recommendation,
            },
          }),
        });
      if (!response.ok) throw new Error("Quote request failed.");
      const data = await response.json();
      const emailResult = data.email || {};
      setSubmittedQuoteSignature(currentQuoteSignature);
      setQuoteSubmitted(true);
      if (emailResult.clientSent && emailResult.internalSent) {
        setQuoteStatus("Quote request received. Confirmation email sent to client and TRI-P Tech.");
      } else if (emailResult.internalSent) {
        setQuoteStatus("Quote request received. TRI-P Tech has been notified.");
      } else {
        setQuoteStatus("Quote request received. Email notification will be handled by the team.");
      }
    } catch {
      setQuoteSubmitted(false);
      setQuoteStatus("Could not save quote request. Please try again.");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const excelSafe = (value: string | number) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const generateExcelQuote = async () => {
    if (!recommendation) {
      setQuoteStatus("Add a valid load first.");
      return;
    }
    const sessionResponse = await fetch("/api/admin-session");
    const sessionData = await sessionResponse.json().catch(() => ({}));
    const role = String(sessionData.user?.role || "");
    if (!sessionResponse.ok || !["Admin", "Sales", "Engineer"].includes(role)) {
      setQuoteStatus("Log in to admin before generating an Excel quote.");
      return;
    }
    const quoteDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const quoteRef = `TRIP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`;
    const rows = recommendation.quoteLines
      .map(
        (line, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${excelSafe(line.name)}</td>
            <td>${excelSafe(line.description)}</td>
            <td>${line.quantity}</td>
            <td>${Math.round(line.rate)}</td>
            <td>${Math.round(line.amount)}</td>
          </tr>`
      )
      .join("");
    const summaryRows = [
      ["Quote ref", quoteRef],
      ["Date", quoteDate],
      ["Client", clientName || "Client"],
      ["Phone / WhatsApp", phone || "Not provided"],
      ["Location", location || "Not provided"],
      ["Site note", siteNote || "Not provided"],
      ["Daily energy", formatWh(recommendation.dailyEnergyWh)],
      ["System voltage", `${recommendation.selectedVoltage}V`],
      ["PV configuration", recommendation.pvConfigurationLabel],
      ["Total", formatNaira(recommendation.totalCost)],
    ]
      .map(([label, value]) => `<tr><td>${excelSafe(label)}</td><td>${excelSafe(value)}</td></tr>`)
      .join("");
    const engineeringRows = recommendation.engineeringData
      .map((row) => `<tr><td>${excelSafe(row.label)}</td><td>${excelSafe(row.value)}</td></tr>`)
      .join("");
    const workbookHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Solar Quote</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
          <style>
            table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
            th { background: #082c3a; color: #ffffff; font-weight: 700; }
            th, td { border: 1px solid #d8e7e3; padding: 8px; vertical-align: top; }
            .title { color: #082c3a; font-size: 22px; font-weight: 800; }
            .brand { color: #117865; font-weight: 800; }
            .section { background: #eef7f4; color: #082c3a; font-weight: 800; }
            .money { mso-number-format:"\\20A6#,##0"; }
            .total { background: #eef7f4; color: #117865; font-weight: 800; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="6" class="brand">TRI-P Tech</td></tr>
            <tr><td colspan="6" class="title">Solar Quote</td></tr>
            <tr><td colspan="6">Estimate only. Final installation details must be confirmed by TRI-P engineers.</td></tr>
            <tr><td colspan="6"></td></tr>
            <tr><td colspan="2" class="section">Client and system summary</td><td colspan="4"></td></tr>
            ${summaryRows}
            <tr><td colspan="6"></td></tr>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate (NGN)</th>
              <th>Amount (NGN)</th>
            </tr>
            ${rows}
            <tr>
              <td colspan="5" class="total">Total estimated equipment cost</td>
              <td class="total money">${Math.round(recommendation.totalCost)}</td>
            </tr>
            <tr><td colspan="6"></td></tr>
            <tr><td colspan="2" class="section">Engineering data</td><td colspan="4"></td></tr>
            ${engineeringRows}
            <tr><td colspan="6"></td></tr>
            <tr><td colspan="6">Assumptions include solar efficiency, inverter efficiency, battery DoD, reserve margin, surge headroom, and 4hr battery recharge target.</td></tr>
          </table>
        </body>
      </html>`;
    const blob = new Blob([workbookHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quoteRef}-solar-quote.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setQuoteStatus("Excel quote downloaded.");
  };

  const brandNote = (kind: "panel" | "battery" | "inverter" | "controller") => {
    if (!recommendation) return "";
    const selected = {
      panel: panelManufacturer,
      battery: batteryManufacturer,
      inverter: inverterManufacturer,
      controller: controllerManufacturer,
    }[kind];
    return selected ? recommendation.warnings.find((warning) => warning.startsWith(selected)) || "" : "";
  };
  const showWizard = mode === "wizard";
  const showCalculator = mode === "manual";
  const wizardSelectedDraftLoads = useMemo(
    () => wizardDraftLoads.filter((load) => wizardSelectedLoadIds[load.id] && load.quantity > 0),
    [wizardDraftLoads, wizardSelectedLoadIds]
  );
  const wizardSelectedLoadCount = wizardSelectedDraftLoads.reduce((total, load) => total + load.quantity, 0);
  const wizardSelectedDailyWh = wizardSelectedDraftLoads.reduce(
    (total, load) => total + load.quantity * load.watts * (load.dayHours + load.nightHours) * (load.cyclePercent / 100),
    0
  );
  const wizardGuide = useMemo(() => {
    const projectTone = {
      student: {
        sideTitle: "Budget mode, but sensible.",
        message: "You picked a student or individual setup. I will keep the recommendation focused on essentials first.",
        suggestion: "Best move here: lights, charging, fan, and internet before anything that drains battery fast.",
      },
      home: {
        sideTitle: "Home comfort path.",
        message: "You picked a home setup. I will use the next answers to separate essential loads from comfort loads.",
        suggestion: "For homes, fridge, lights, fans, TV, and internet usually come before luxury loads.",
      },
      business: {
        sideTitle: "Business hours matter.",
        message: "You picked a shop or office setup. I will treat most usage as daytime unless you select night-running loads.",
        suggestion: "For business spaces, daytime solar support is usually cheaper and more practical than full-night backup.",
      },
      cooling: {
        sideTitle: "Cooling needs respect.",
        message: "You picked a setup with AC. I will size the inverter and battery more carefully because AC has real startup demand.",
        suggestion: "Only include the AC rooms that truly need backup. Every extra room can move the system into a bigger class.",
      },
    }[selectedWizardProjectType.id] || {
      sideTitle: "Tell me the project type.",
      message: "Choose the project type so I can ask better follow-up questions.",
      suggestion: "Pick the closest option. We can still refine the loads before the final estimate.",
    };

    const profileTone = selectedWizardIsBusiness
      ? {
          sideTitle: "Mostly daytime usage.",
          message: `${selectedWizardProfile.title} is a business-style space, so I will start with practical daytime loads.`,
          suggestion: "Keep night backup for security, CCTV, router, or any device that truly runs after closing.",
        }
      : selectedWizardIsDuplex
        ? {
            sideTitle: "Duplex path selected.",
            message: `${selectedWizardProfile.title} gives me a bigger-home starting point for likely rooms, cable allowance, and comfort loads.`,
            suggestion: "For duplexes, be careful with AC and pumping loads. They can change the inverter class quickly.",
          }
        : selectedWizardProfile.projectType === "cooling"
          ? {
              sideTitle: "AC profile active.",
              message: `${selectedWizardProfile.title} tells me cooling is part of the plan, so I will ask AC questions before estimating.`,
              suggestion: "A smaller AC selection with realistic hours usually gives a more useful first estimate.",
            }
          : {
              sideTitle: "Good starting profile.",
              message: `${selectedWizardProfile.title} gives me the likely room and appliance pattern for this estimate.`,
              suggestion: "If the closest option is not perfect, choose it anyway and adjust the appliance quantities later.",
            };
    const selectedCategoryTotals = wizardSelectedDraftLoads.reduce<Record<string, { count: number; wh: number; nightWh: number }>>((totals, load) => {
      const category = applianceCategory(load.appliance);
      const quantity = Number(load.quantity || 0);
      const wh = quantity * load.watts * (load.dayHours + load.nightHours) * (load.cyclePercent / 100);
      const nightWh = quantity * load.watts * load.nightHours * (load.cyclePercent / 100);
      const current = totals[category] || { count: 0, wh: 0, nightWh: 0 };
      totals[category] = {
        count: current.count + quantity,
        wh: current.wh + wh,
        nightWh: current.nightWh + nightWh,
      };
      return totals;
    }, {});
    const dominantCategory = Object.entries(selectedCategoryTotals).sort((a, b) => b[1].wh - a[1].wh)[0];
    const acWh = selectedCategoryTotals["Air conditioning"]?.wh || 0;
    const fridgeNightWh = selectedCategoryTotals.Refrigeration?.nightWh || 0;
    const securityNightWh = selectedCategoryTotals.Security?.nightWh || 0;
    const totalNightWh = wizardSelectedDraftLoads.reduce(
      (total, load) => total + load.quantity * load.watts * load.nightHours * (load.cyclePercent / 100),
      0
    );
    const nightShare = wizardSelectedDailyWh ? totalNightWh / wizardSelectedDailyWh : 0;
    const smartLoadAdvice = (() => {
      if (!wizardSelectedLoadCount) return "Select the appliances that truly matter. The estimate gets better when the list is honest.";
      if (acWh > wizardSelectedDailyWh * 0.45) return "AC is dominating this estimate. Reducing AC rooms or hours will have the biggest effect on cost.";
      if (selectedWizardProjectType.id === "student" && (fridgeNightWh || nightShare > 0.45)) {
        return "For a small budget setup, avoid heavy night loads. Keep night backup for lights, charging, router, and fan.";
      }
      if (selectedWizardIsBusiness && nightShare > 0.25) {
        return "This business setup has noticeable night demand. Confirm if those loads truly run after closing.";
      }
      if (fridgeNightWh && wizardSelectedDailyWh < 2500) {
        return "The fridge is adding night demand. For very small systems, consider daytime cooling first or a bigger battery.";
      }
      if (securityNightWh > 0 && selectedWizardIsBusiness) {
        return "CCTV/security can remain overnight while other shop or office loads stay daytime-only.";
      }
      if (dominantCategory?.[0]) return `${dominantCategory[0]} is currently the biggest part of the estimate. That is the first place to adjust if cost feels high.`;
      return "This load mix looks balanced. Remove non-essential items before requesting the final quote.";
    })();
    const systemClassAdvice = recommendation
      ? recommendation.selectedVoltage === 48
        ? "The engine moved this into a 48V class, which is the practical direction for stronger systems."
        : recommendation.selectedVoltage === 24
          ? "This is sitting in a 24V class, suitable for small-to-medium backup needs."
          : "This is still a 12V class estimate, so keep the load list very disciplined."
      : "";

    if (wizardStep === 0) {
      return {
        title: "Welcome to the TRI-P solar wizard.",
        sideTitle: "We start simple.",
        message: "I will help you build a practical estimate without making you wrestle with technical forms.",
        suggestion: "Start with the closest option. We can still refine the loads before the final estimate.",
      };
    }

    if (wizardStep === 1) {
      return {
        title: "We start with the space.",
        sideTitle: projectTone.sideTitle,
        message: projectTone.message,
        suggestion: projectTone.suggestion,
      };
    }

    if (wizardStep === 2) {
      return {
        title: "Now pick the closest building.",
        sideTitle: profileTone.sideTitle,
        message: profileTone.message,
        suggestion: profileTone.suggestion,
      };
    }

    if (wizardStep === 3) {
      return {
        title: "AC check, no surprises.",
        sideTitle: `${wizardAcRoomCount} AC room${wizardAcRoomCount === 1 ? "" : "s"}.`,
        message: `${wizardAcAppliance} is selected for ${wizardAcRoomCount} room${wizardAcRoomCount === 1 ? "" : "s"}. I will treat cooling as a serious load, not a casual appliance.`,
        suggestion:
          wizardAcRoomCount > 2
            ? "Multiple AC rooms will push the system up quickly. Consider confirming only the rooms that truly need backup."
            : wizardAcAppliance.includes("2 HP")
              ? "2 HP AC is a heavy comfort load. Keep its runtime realistic if budget matters."
            : "If the AC is not essential overnight, keep night use low for a more practical battery size.",
      };
    }

    if (wizardStep === 4) {
      return {
        title: "Height affects cable sense.",
        sideTitle:
          wizardFloorCount === 1
            ? "Simple cable run."
            : wizardFloorCount === 2
              ? "Two-floor allowance."
              : "Taller building noted.",
        message:
          wizardFloorCount === 1
            ? "Single-floor projects usually need less PV cable allowance, so I will keep the starter estimate lean."
            : `${wizardFloorCount} floors means more distance from roof to equipment. I will carry that into cable and accessory allowance.`,
        suggestion:
          wizardFloorCount > 2
            ? "For taller buildings, plan for extra PV cable and cleaner cable routing from the start."
            : "Single and two-floor installs are usually easier to keep neat and cost controlled.",
      };
    }

    if (wizardStep === 5) {
      return {
        title: selectedWizardIsBusiness ? "Business load: mostly daytime." : "Choose your backup mood.",
        sideTitle:
          selectedWizardBackup.id === "full-night"
            ? "Longer backup selected."
            : selectedWizardBackup.id === "evening"
              ? "Evening comfort selected."
              : selectedWizardBackup.title,
        message: selectedWizardIsBusiness
          ? "For shops and offices, I will lean the usage toward daytime operation unless the selected loads say otherwise."
          : `${selectedWizardBackup.title} backup is selected. I will adjust usage, reserve, and sun-hour assumptions around that comfort target.`,
        suggestion: selectedWizardIsBusiness
          ? "Daytime-first backup is usually the most cost-effective business setup."
          : selectedWizardBackup.id === "full-night"
            ? "Full-night comfort is possible, but it will noticeably increase battery cost."
            : "Evening backup is often the best balance between comfort and budget.",
      };
    }

    if (wizardStep === 6) {
      const loadMood = wizardSelectedLoadCount
        ? wizardSelectedDailyWh > 12000
          ? "Heavy load list."
          : wizardSelectedDailyWh > 4500
            ? "Medium load list."
            : "Light load list."
        : "No loads yet.";
      return {
        title: "Loads are joining the party.",
        sideTitle: loadMood,
        message: wizardSelectedLoadCount
          ? `${wizardSelectedLoadCount} item${wizardSelectedLoadCount === 1 ? "" : "s"} are active, about ${formatWh(Math.round(wizardSelectedDailyWh))} daily before the full sizing engine adds engineering margins.`
          : "Nothing is selected yet. Pick the loads that apply and I will prepare the starter estimate from them.",
        suggestion: smartLoadAdvice,
      };
    }

    return {
      title: "Estimate reveal time.",
      sideTitle: recommendation ? `${formatWh(recommendation.dailyEnergyWh)} daily need.` : "Estimate ready.",
      message: recommendation
        ? `The engine selected ${formatW(recommendation.panelCount * recommendation.selectedPanel.watts)} of panels, ${formatWh(recommendation.batteryCount * recommendation.selectedBattery.wh)} battery storage, and a ${formatVa(recommendation.selectedInverter.va)} inverter path.`
        : "Nice. The serious calculator engine has done the heavy lifting.",
      suggestion: recommendation
        ? `${systemClassAdvice} ${smartLoadAdvice}`.trim()
        : "If the result looks too small or too large, go back and adjust the selected loads.",
    };
  }, [
    recommendation,
    selectedWizardBackup.id,
    selectedWizardBackup.title,
    selectedWizardIsBusiness,
    selectedWizardIsDuplex,
    selectedWizardProfile.projectType,
    selectedWizardProfile.title,
    selectedWizardProjectType.id,
    selectedWizardProjectType.title,
    wizardAcAppliance,
    wizardAcRoomCount,
    wizardFloorCount,
    wizardSelectedDailyWh,
    wizardSelectedLoadCount,
    wizardStep,
  ]);
  const wizardMobileGuideImage =
    wizardStep >= 1 && wizardStep <= 7
      ? `/images/tri-p-wizard-guide-step-${wizardStep}.png`
      : "/images/tri-p-wizard-guide-welcome.png";
  const wizardMobileGuideThought = useMemo(() => {
    const project = selectedWizardProjectType.title;
    const profile = selectedWizardProfile.title;
    const floorLabel = wizardFloorCount === 1 ? "single floor" : `${wizardFloorCount} floors`;
    const roomLabel = wizardRoomCount === 1 ? "1 room" : `${wizardRoomCount} rooms`;
    const acLabel =
      selectedWizardProfile.projectType === "cooling"
        ? `${wizardAcRoomCount} AC room${wizardAcRoomCount === 1 ? "" : "s"} using ${wizardAcAppliance}`
        : "no AC path";
    const loadLabel =
      wizardSelectedLoadCount > 0
        ? `${wizardSelectedLoadCount} selected load${wizardSelectedLoadCount === 1 ? "" : "s"}`
        : "the selected loads";

    if (wizardStep === 1) {
      return "Tell me what we are powering first. I will handle the sizing logic behind the scene.";
    }

    if (wizardStep === 2) {
      return `${project} selected. Now I will narrow the property type so the starter loads fit the space.`;
    }

    if (wizardStep === 3) {
      return `${profile} selected with ${roomLabel}. Now I will check if AC should affect the inverter and battery size.`;
    }

    if (wizardStep === 4) {
      return `${profile} and ${acLabel} noted. Building height helps me estimate PV cable allowance.`;
    }

    if (wizardStep === 5) {
      return `${profile} on ${floorLabel}. Now choose the backup comfort so the battery is sized sensibly.`;
    }

    if (wizardStep === 6) {
      return `${selectedWizardBackup.title} backup selected. Review the suggested loads and keep only what applies.`;
    }

    if (wizardStep === 7) {
      return `I used ${loadLabel}, ${floorLabel}, and ${selectedWizardBackup.title} backup for this starter result.`;
    }

    return wizardGuide.message;
  }, [
    selectedWizardBackup.title,
    selectedWizardProfile.projectType,
    selectedWizardProfile.title,
    selectedWizardProjectType.title,
    wizardAcAppliance,
    wizardAcRoomCount,
    wizardFloorCount,
    wizardGuide.message,
    wizardRoomCount,
    wizardSelectedLoadCount,
    wizardStep,
  ]);
  const wizardWelcomeEquipment = [
    { label: "Solar", Icon: IoSunnyOutline },
    { label: "Inverter", Icon: IoFlashOutline },
    { label: "Battery", Icon: IoBatteryChargingOutline },
    { label: "Protection", Icon: IoShieldCheckmarkOutline },
  ];
  const wizardWelcomeFlow = [
    { label: "Project type", detail: "What are we sizing?", Icon: IoHomeOutline },
    { label: "Property", detail: "Pick the closest space.", Icon: IoLocationOutline },
    { label: "Loads", detail: "Confirm likely appliances.", Icon: IoFlashOutline },
    { label: "Backup", detail: "Choose your comfort target.", Icon: IoTimeOutline },
    { label: "Estimate", detail: "Get a practical result.", Icon: IoCalculatorOutline },
  ];
  const wizardWelcomeBenefits = [
    "Simple outside",
    "Practical recommendations",
    "Engineering logic inside",
  ];
  const wizardWelcomeMessages = [
    "Welcome! I will help you build a practical solar estimate through a few simple questions.",
    "Tell me what you want to power. I will handle the sizing logic behind the scene.",
    "Let us keep it simple outside while the real calculator does the engineering work.",
    "We will turn your appliance list, usage hours, and backup needs into a practical estimate.",
  ];
  const [wizardWelcomeMessageIndex, setWizardWelcomeMessageIndex] = useState(0);
  const wizardWelcomeMessage = wizardWelcomeMessages[wizardWelcomeMessageIndex];
  const wizardSectionRef = useRef<HTMLElement | null>(null);
  const mobileWizardMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setWizardWelcomeMessageIndex(Math.floor(Math.random() * wizardWelcomeMessages.length));
  }, [wizardWelcomeMessages.length]);

  useEffect(() => {
    if (wizardStep <= 0 || typeof window === "undefined" || window.innerWidth >= 768) return;
    window.setTimeout(() => {
      wizardSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, [wizardStep]);

  useEffect(() => {
    if (!mobileWizardMenuOpen) return;

    const closeMenuOnOutsideTap = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileWizardMenuRef.current?.contains(target)) return;
      setMobileWizardMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenuOnOutsideTap);
    document.addEventListener("touchstart", closeMenuOnOutsideTap);
    return () => {
      document.removeEventListener("mousedown", closeMenuOnOutsideTap);
      document.removeEventListener("touchstart", closeMenuOnOutsideTap);
    };
  }, [mobileWizardMenuOpen]);

  const wizardProgressPercent = wizardStep === 0 ? 8 : Math.min(100, Math.round((wizardStep / 7) * 100));
  const wizardProgressLabel = wizardStep === 0 ? "Welcome" : `Step ${wizardStep} of 7`;
  const goToPreviousWizardStep = () => {
    if (wizardStep <= 1) {
      setWizardStep(0);
      return;
    }
    if (wizardStep === 4) {
      setWizardStep(selectedWizardProfile.projectType === "cooling" ? 3 : 2);
      return;
    }
    if (wizardStep === 6) {
      setWizardStep(selectedWizardIsBusiness ? 4 : 5);
      return;
    }
    setWizardStep((currentStep) => Math.max(0, currentStep - 1));
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "Arial, sans-serif" }}>
      {showWizard ? (
      <section
        ref={wizardSectionRef}
        className={`relative flex flex-col overflow-hidden rounded-[22px] border border-white/12 bg-[#020d15] text-white shadow-[0_30px_90px_rgba(8,44,58,0.18)] sm:rounded-[28px] lg:h-[690px] lg:min-h-[690px] ${
          wizardStep === 0
            ? ""
            : "h-[calc(100svh-1.5rem)] min-h-[680px] sm:h-[calc(100svh-2rem)] sm:min-h-[720px]"
        }`}
      >
        <div className="absolute inset-0 bg-[url('/images/tri-p-wizard-hero-bg.png')] bg-cover bg-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020d15]/96 via-[#061f2a]/82 to-[#053d34]/64" />
        <div ref={mobileWizardMenuRef} className="relative z-30 flex items-center justify-between px-5 pb-1 pt-5 lg:hidden">
          <a
            href="/"
            aria-label="TRI-P Tech Limited home"
            className="inline-flex items-center"
            onClick={() => setMobileWizardMenuOpen(false)}
          >
            <img
              src="/images/logo/FLogo W MOD.png"
              alt="TRI-P Tech Limited"
              className="h-12 w-[148px] object-contain object-left"
            />
          </a>
          <button
            type="button"
            aria-label={mobileWizardMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileWizardMenuOpen((open) => !open)}
            className={`grid h-12 w-12 place-items-center rounded-2xl border text-2xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition ${
              mobileWizardMenuOpen
                ? "border-[#00d97b]/70 bg-[#0c3c35] text-white"
                : "border-white/18 bg-[#061f2a]/70 text-[#8ff0c7] hover:border-[#00d97b]/70 hover:text-white"
            }`}
          >
            {mobileWizardMenuOpen ? <IoClose /> : <IoMenu />}
          </button>
          {mobileWizardMenuOpen ? (
            <nav className="absolute left-5 right-5 top-[82px] z-40 overflow-hidden rounded-[24px] border border-[#16e08f]/35 bg-[#031822] text-white shadow-[0_22px_60px_rgba(0,0,0,0.34)]">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#8ff0c7]">
                  Navigation
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00d97b] shadow-[0_0_14px_rgba(0,217,123,0.8)]" />
              </div>
              <div className="grid gap-1 p-2">
              {[
                { href: "/", label: "Home", helper: "Return to the main site", Icon: IoHomeOutline },
                { href: "/services/solar", label: "Solar service", helper: "See the solar service page", Icon: IoSunnyOutline },
                { href: "/services/solar/calculator/manual", label: "Advanced calculator", helper: "Open detailed load entry", Icon: IoCalculatorOutline },
                { href: "/contact", label: "Contact us", helper: "Reach the TRI-P Tech team", Icon: IoPersonOutline },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileWizardMenuOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-[#0b322d]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#16e08f]/35 bg-[#082c3a] text-xl text-[#16e08f] transition group-hover:border-[#16e08f] group-hover:bg-[#0f463d] group-hover:text-white">
                    <item.Icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold leading-tight text-white">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-white/58">
                      {item.helper}
                    </span>
                  </span>
                </a>
              ))}
              </div>
            </nav>
          ) : null}
        </div>
        <div className={wizardStep === 0 ? "relative z-10 min-h-0 flex-1" : "relative z-10 grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]"}>
          <div className={`relative min-w-0 overflow-hidden text-white ${wizardStep === 0 ? "p-3 sm:p-5 md:p-7" : "hidden p-4 md:p-5 lg:block"}`}>
            <div className="absolute inset-0 bg-[url('/images/tri-p-wizard-hero-bg.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#061f2a]/78 via-[#061f2a]/42 to-[#061f2a]/12" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#061f2a]/88 to-transparent" />
            <div className={wizardStep === 0 ? "relative z-10 grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3 sm:gap-4" : "relative z-10 flex h-full flex-col"}>
              <div className={wizardStep === 0 ? "relative z-10 grid min-h-0 gap-4 sm:gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-center" : "relative z-10"}>
                <div>
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.24em] text-[#8bd7c8] lg:block lg:text-xs">
                  {wizardStep === 0 ? "TRI-P Tech solar" : "Guided solar estimate"}
                </p>
                <h2 className={`max-w-4xl font-extrabold leading-[0.96] ${wizardStep === 0 ? "mt-0 text-[clamp(2rem,10.5vw,3.2rem)] sm:mt-3 sm:text-[clamp(3rem,8vw,5.25rem)]" : "mt-4 text-3xl md:text-4xl"}`}>
                  {wizardStep === 0 ? (
                    <>
                      Solar sizing made <span className="text-[#16e08f]">simple.</span>
                    </>
                  ) : "Solar sizing, made simple."}
                </h2>
                <p className={`mt-2 text-sm leading-6 text-white/82 sm:mt-3 sm:text-base sm:leading-7 ${wizardStep === 0 ? "max-w-3xl md:text-lg md:leading-8" : "max-w-xl"}`}>
                  {wizardStep === 0
                    ? "Get a practical solar recommendation based on your real appliances, usage hours, and backup needs."
                    : "Pick simple answers. The real calculator engine handles the load, inverter, battery, panels, and protection logic behind the scene."}
                </p>
                {wizardStep === 0 ? (
                  <>
                    <div className="mt-4 grid max-w-3xl grid-cols-2 gap-2.5 sm:mt-7 sm:grid-cols-4 sm:gap-2 sm:gap-y-5">
                      {wizardWelcomeEquipment.map(({ label, Icon }, index) => (
                        <div key={label} className={`rounded-[20px] border border-[#16e08f]/55 bg-[#061f2a]/48 px-3 py-3 text-center shadow-[0_0_28px_rgba(22,224,143,0.12)] backdrop-blur-sm sm:border-x-0 sm:border-y-0 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-0 sm:border-r sm:border-white/12 ${index === wizardWelcomeEquipment.length - 1 ? "sm:border-r-0" : ""}`}>
                          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#16e08f]/70 bg-[#061f2a]/55 text-2xl text-[#16e08f] shadow-[0_0_22px_rgba(22,224,143,0.18)] sm:h-14 sm:w-14 sm:text-3xl">
                            <Icon />
                          </div>
                          <p className="mt-2 text-sm font-extrabold text-white/94 sm:mt-3 sm:text-base">{label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 flex items-center gap-3 text-base font-bold text-white/92 sm:mt-6 sm:text-lg">
                      <IoShieldCheckmarkOutline className="text-3xl text-[#16e08f]" />
                      No technical knowledge required.
                    </p>
                  </>
                ) : null}
                </div>
                {wizardStep === 0 ? (
                  <div className="relative rounded-[22px] border border-[#16e08f]/70 bg-[#061f2a]/76 p-3 shadow-[0_0_44px_rgba(22,224,143,0.16)] backdrop-blur sm:rounded-[30px] sm:p-5 lg:min-h-[310px]">
                    <div className="absolute -right-10 top-8 h-44 w-20 rounded-full border border-[#16e08f]/30" />
                    <div className="grid grid-cols-[1fr_0.78fr] gap-3 sm:grid-cols-[0.9fr_1fr] sm:gap-5">
                      <div className="relative order-2 min-h-[148px] overflow-hidden rounded-[18px] border border-[#16e08f]/20 bg-[#061f2a] shadow-[inset_0_0_34px_rgba(22,224,143,0.08)] sm:order-1 sm:min-h-[280px] sm:rounded-[24px]">
                        <img
                          src="/images/tri-p-wizard-guide-scene.png"
                          alt="TRI-P Tech guide"
                          className="absolute -top-3 left-1/2 h-[178px] max-w-none -translate-x-1/2 object-contain brightness-110 contrast-110 sm:-top-7 sm:h-[372px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#061f2a]/10" />
                      </div>
                      <div className="order-1 flex flex-col justify-center sm:order-2">
                        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#16e08f]">TRI-P guide</p>
                        <p className="mt-3 text-xl font-medium leading-tight text-white/92 sm:mt-5 sm:text-lg sm:font-semibold sm:leading-9">
                          {wizardWelcomeMessage}
                        </p>
                      </div>
                      <div className="order-3 col-span-2 sm:col-span-1 sm:col-start-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="mt-2.5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#16c979] px-6 py-3 text-xl font-extrabold text-white shadow-[0_18px_36px_rgba(22,201,121,0.30)] transition hover:-translate-y-0.5 hover:bg-[#10b76e] sm:mt-7 sm:gap-3 sm:px-7 sm:py-3.5 sm:text-lg"
                        >
                          Let's begin
                          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/65 sm:h-9 sm:w-9">
                            <IoArrowForward className="text-xl" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {wizardStep === 0 ? (
              <div className="relative z-10 overflow-hidden rounded-[18px] border border-white/15 bg-[#061f2a]/58 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.20)] backdrop-blur sm:rounded-[24px] sm:p-3 lg:p-4">
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-25 [background-image:linear-gradient(90deg,rgba(139,215,200,.28)_1px,transparent_1px),linear-gradient(rgba(139,215,200,.18)_1px,transparent_1px)] [background-size:42px_42px]" />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[12px] font-bold leading-tight text-white/86 sm:gap-2 sm:text-sm md:text-base">
                    {wizardWelcomeBenefits.map((benefit, index) => (
                      <p key={benefit} className={`flex flex-col items-center justify-center gap-1.5 border-r border-white/16 px-1 sm:flex-row sm:gap-2 ${index === wizardWelcomeBenefits.length - 1 ? "border-r-0" : ""}`}>
                        <IoShieldCheckmarkOutline className="text-2xl text-[#16e08f] sm:text-3xl" />
                        {benefit}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              ) : (
              <div className="relative mt-3 min-h-[440px] flex-1 overflow-hidden">
                <img
                  src={
                    wizardStep === 1
                      ? "/images/tri-p-wizard-guide-step-1.png"
                      : wizardStep === 2
                        ? "/images/tri-p-wizard-guide-step-2.png"
                        : wizardStep === 3
                          ? "/images/tri-p-wizard-guide-step-3.png"
                          : wizardStep === 4
                            ? "/images/tri-p-wizard-guide-step-4.png"
                            : wizardStep === 5
                              ? "/images/tri-p-wizard-guide-step-5.png"
                              : wizardStep === 6
                                ? "/images/tri-p-wizard-guide-step-6.png"
                              : wizardStep === 7
                                ? "/images/tri-p-wizard-guide-step-7.png"
                                : "/images/tri-p-wizard-guide-welcome.png"
                  }
                  alt="TRI-P Tech guide"
                  className={`absolute inset-0 h-full w-full object-cover object-[34%_center] ${
                    wizardStep === 1 || wizardStep === 2 || wizardStep === 3 || wizardStep === 4 || wizardStep === 5 || wizardStep === 6 || wizardStep === 7
                      ? "[mask-image:radial-gradient(circle_at_34%_52%,black_0%,black_48%,rgba(0,0,0,0.78)_62%,transparent_86%)]"
                      : ""
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020d15]/0 via-[#061f2a]/8 to-[#061f2a]/50" />
                {wizardStep === 1 || wizardStep === 2 || wizardStep === 3 || wizardStep === 4 || wizardStep === 5 || wizardStep === 6 || wizardStep === 7 ? (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_52%,transparent_0%,transparent_46%,rgba(2,13,21,0.20)_68%,rgba(2,13,21,0.72)_100%)]" />
                ) : null}
                <div className="absolute right-3 top-16 max-w-[260px] rounded-[22px] border border-white/20 bg-[#061f2a]/62 px-4 py-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-md md:right-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#00d97b]">TRI-P guide</p>
                  <p className="mt-2 text-lg font-extrabold leading-tight">
                    {wizardStep === 0
                      ? wizardGuide.title
                      : wizardGuide.sideTitle}
                  </p>
                  <span className="mt-4 block h-0.5 w-12 rounded-full bg-[#00d97b]" />
                  <p className="mt-4 text-xs leading-5 text-white/86">{wizardGuide.message}</p>
                  <div className="mt-4 rounded-2xl border border-[#00d97b]/45 bg-[#00d97b]/12 p-3 shadow-[0_0_28px_rgba(0,217,123,0.12)]">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8ff0c7]">My suggestion</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-white">{wizardGuide.suggestion}</p>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          <div className={wizardStep === 0 ? "hidden" : "relative flex min-h-0 min-w-0 flex-col justify-start overflow-hidden p-3 md:p-5"}>
            <div className="absolute inset-0 bg-[url('/images/tri-p-wizard-hero-bg.png')] bg-cover bg-center opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#061f2a]/86 via-[#061f2a]/68 to-[#117865]/32" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,217,123,0.20),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(0,51,183,0.18),transparent_28%)]" />
            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col rounded-[22px] border border-white/22 bg-[#020d15]/64 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur sm:rounded-[28px] sm:p-4 md:p-5">
            {wizardStep > 0 ? (
              <button
                type="button"
                onClick={goToPreviousWizardStep}
                aria-label="Go back"
                className="mb-3 inline-grid h-10 w-10 place-items-center rounded-full border border-[#bddbd4] bg-white text-lg text-[#082c3a] shadow-[0_10px_24px_rgba(8,44,58,0.08)] transition hover:-translate-x-0.5 hover:border-[#117865] hover:bg-[#eef7f4]"
              >
                <IoArrowBack />
              </button>
            ) : null}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-4">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00d97b]">Client-friendly mode</p>
                <h3 className="mt-1 text-[clamp(1.45rem,8vw,2.1rem)] font-extrabold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.24)]">
                  {wizardStep === 0
                    ? "Welcome to the solar wizard"
                    : wizardStep === 1
                    ? "What kind of project is this?"
                    : wizardStep === 2
                      ? "What type of property?"
                      : wizardStep === 3
                        ? "Which rooms need AC?"
                        : wizardStep === 4
                          ? "How tall is the building?"
                          : wizardStep === 5
                          ? "How should the backup feel?"
                            : wizardStep === 6
                              ? "Which loads apply?"
                              : "Your starter estimate is ready"}
                </h3>
              </div>
            </div>

            {wizardStep > 1 ? (
              <div className="mb-2 flex shrink-0 items-center gap-3 rounded-2xl border border-[#00d97b]/35 bg-white px-3 py-2 text-[#082c3a] shadow-[0_14px_30px_rgba(0,0,0,0.18)] lg:hidden">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#00d97b]/35 bg-[#eafff4]">
                  <img
                    src={wizardMobileGuideImage}
                    alt="TRI-P Guide"
                    className="absolute left-1/2 top-0 h-16 max-w-none -translate-x-1/2 object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#117865]">TRI-P guide</p>
                  <p className="mt-0.5 text-xs font-semibold leading-5">{wizardMobileGuideThought}</p>
                </div>
              </div>
            ) : null}

            {entryMode === "wizard" ? (
              <div className={`min-h-0 flex-1 ${wizardStep === 1 || wizardStep === 4 || wizardStep === 5 ? "overflow-hidden" : "overflow-y-auto pr-1"}`}>
              <div className={wizardStep === 1 || wizardStep === 4 || wizardStep === 5 || wizardStep === 6 ? "h-full min-h-0" : "grid gap-4"}>
                {wizardStep === 0 ? (
                  <div className="flex min-h-[320px] flex-col justify-center rounded-[28px] border border-[#bddbd4] bg-[#061f2a]/95 p-6 text-white shadow-[0_18px_44px_rgba(8,44,58,0.12)] md:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8bd7c8]">Start here</p>
                    <h4 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">
                      Build a practical solar estimate in a few clicks.
                    </h4>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/78">
                      We will ask simple questions, prepare likely loads, and run the calculator engine quietly underneath.
                    </p>
                    <div className="mt-7">
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="rounded-full bg-white px-8 py-4 text-sm font-extrabold text-[#082c3a] shadow-[0_18px_34px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#eef7f4]"
                      >
                        Get started
                      </button>
                    </div>
                  </div>
                ) : null}

                {wizardStep === 1 ? (
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="mb-2 flex shrink-0 items-center gap-3 rounded-2xl border border-[#00d97b]/35 bg-white px-3 py-2 text-[#082c3a] shadow-[0_14px_30px_rgba(0,0,0,0.18)] lg:hidden">
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#00d97b]/35 bg-[#eafff4]">
                        <img
                          src="/images/tri-p-wizard-guide-step-1.png"
                          alt="TRI-P Guide"
                          className="absolute left-1/2 top-0 h-16 max-w-none -translate-x-1/2 object-cover"
                        />
                      </span>
                      <p className="text-xs font-semibold leading-5">
                        {wizardMobileGuideThought}
                      </p>
                    </div>
                    <p className="hidden shrink-0 pb-3 text-sm leading-6 text-white/86 lg:block">
                      Choose the project type so I can ask the right follow-up questions.
                    </p>
                    <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2 sm:gap-3">
                      {wizardProjectTypes.map((projectType) => {
                        const ProjectIcon =
                          projectType.id === "student"
                            ? IoPersonOutline
                            : projectType.id === "business"
                              ? IoStorefrontOutline
                              : projectType.id === "cooling"
                                ? IoSnowOutline
                                : IoHomeOutline;
                        const isSelected = wizardProjectTypeId === projectType.id;
                        return (
                          <button
                            key={projectType.id}
                            type="button"
                            onClick={() => {
                              const firstProfile = wizardProfiles.find((profile) => profile.projectType === projectType.id);
                              setWizardProjectTypeId(projectType.id);
                              if (firstProfile) setWizardProfileId(firstProfile.id);
                              if (firstProfile) setWizardRoomCount(firstProfile.rooms);
                              if (firstProfile) setWizardAcRoomCount(Math.min(firstProfile.acRooms || 1, firstProfile.rooms));
                              const nextFloorCount = firstProfile?.id.includes("duplex") ? 2 : 1;
                              setWizardFloorCount(nextFloorCount);
                              updateAssumption("floorCount", nextFloorCount);
                              setWizardStep(2);
                            }}
                            className={`group relative flex h-full min-h-0 min-w-0 cursor-pointer flex-col justify-center overflow-hidden rounded-xl border p-2 text-center transition duration-200 hover:-translate-y-1 hover:border-[#00d97b] hover:shadow-[0_18px_38px_rgba(0,217,123,0.18)] sm:p-3 ${isSelected ? "border-[#00d97b] bg-[#eafff4] shadow-[0_16px_34px_rgba(0,217,123,0.14)]" : "border-[#d8e7e3] bg-white"}`}
                          >
                            {isSelected ? (
                              <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#117865] text-white shadow-[0_10px_22px_rgba(17,120,101,0.24)] sm:right-3 sm:top-3 sm:h-7 sm:w-7">
                                <IoShieldCheckmarkOutline className="text-base sm:text-lg" />
                              </span>
                            ) : null}
                            <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full border text-lg transition group-hover:border-[#00d97b] group-hover:bg-[#eafff4] sm:h-10 sm:w-10 sm:text-xl ${isSelected ? "border-[#00d97b]/45 bg-[#d8f8ea] text-[#117865]" : "border-[#bddbd4] bg-[#eef7f4] text-[#117865]"}`}>
                              <ProjectIcon />
                            </span>
                            <strong className="mt-1.5 block whitespace-normal break-words text-sm leading-5 text-[#082c3a] sm:mt-2 sm:text-base">{projectType.title}</strong>
                            <span className="mx-auto mt-1 block max-w-[230px] text-[11px] leading-4 text-[#324e57] sm:mt-1.5 sm:text-xs sm:leading-5">{projectType.subtitle}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {wizardStep === 2 ? (
                  <div>
                    <p className="text-sm leading-6 text-white/86">Choose the closest property type. This gives the calculator a more useful starter load list.</p>
                    <div className={`mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 ${availableWizardProfiles.length > 4 ? "lg:grid-cols-4" : ""}`}>
                      {availableWizardProfiles.map((profile) => {
                        const ProfileIcon =
                          profile.projectType === "business"
                            ? IoStorefrontOutline
                            : profile.projectType === "cooling"
                              ? IoSnowOutline
                              : IoHomeOutline;
                        const isSelected = wizardProfileId === profile.id;
                        return (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => {
                              setWizardProfileId(profile.id);
                              setWizardRoomCount(profile.rooms);
                              setWizardAcRoomCount(Math.min(profile.acRooms || 1, profile.rooms));
                              const nextFloorCount = profile.id.includes("duplex") ? Math.max(2, wizardFloorCount) : wizardFloorCount;
                              setWizardFloorCount(nextFloorCount);
                              updateAssumption("floorCount", nextFloorCount);
                              setWizardStep(profile.projectType === "cooling" ? 3 : 4);
                            }}
                            className={`group relative flex aspect-[16/10] min-w-0 cursor-pointer flex-col justify-center overflow-hidden rounded-xl border p-2 text-center transition duration-200 hover:-translate-y-1 hover:border-[#00d97b] hover:shadow-[0_18px_38px_rgba(0,217,123,0.18)] sm:aspect-[16/9] ${availableWizardProfiles.length > 4 ? "sm:min-h-[88px] sm:p-2.5" : "sm:min-h-[118px] sm:p-3"} ${isSelected ? "border-[#00d97b] bg-[#eafff4] shadow-[0_16px_34px_rgba(0,217,123,0.14)]" : "border-[#d8e7e3] bg-white"}`}
                          >
                            {isSelected ? (
                              <span className={`absolute grid place-items-center rounded-full bg-[#117865] text-white shadow-[0_10px_22px_rgba(17,120,101,0.24)] right-2 top-2 h-6 w-6 sm:right-3 sm:top-3 sm:h-7 sm:w-7`}>
                                <IoShieldCheckmarkOutline className="text-base sm:text-lg" />
                              </span>
                            ) : null}
                            <span className={`mx-auto grid place-items-center rounded-full border transition group-hover:border-[#00d97b] group-hover:bg-[#eafff4] ${availableWizardProfiles.length > 4 ? "h-8 w-8 text-base" : "h-10 w-10 text-xl"} ${isSelected ? "border-[#00d97b]/45 bg-[#d8f8ea] text-[#117865]" : "border-[#bddbd4] bg-[#eef7f4] text-[#117865]"}`}>
                              <ProfileIcon />
                            </span>
                            <strong className={`block whitespace-normal break-words text-[#082c3a] ${availableWizardProfiles.length > 4 ? "mt-1 text-[11px] leading-4 sm:mt-1.5 sm:text-xs" : "mt-1 text-sm leading-5 sm:mt-2 sm:text-base"}`}>{profile.title}</strong>
                            <span className={`mx-auto block text-[#324e57] ${availableWizardProfiles.length > 4 ? "mt-0.5 max-w-[150px] text-[10px] leading-3 sm:text-[11px] sm:leading-4" : "mt-1 max-w-[230px] text-[11px] leading-4 sm:mt-1.5 sm:text-xs sm:leading-5"}`}>{profile.subtitle}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {wizardStep === 3 ? (
                  <div>
                    <p className="text-sm leading-6 text-white/86">
                      {selectedWizardProfile.title} already gives us {wizardRoomCount} room(s). Just tell us how many of those rooms should have AC and the AC size.
                    </p>
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">Rooms with AC</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                        {Array.from({ length: Math.min(wizardRoomCount, 6) }, (_, index) => index + 1).map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setWizardAcRoomCount(count)}
                            className={`group relative flex aspect-[16/9] min-h-[72px] min-w-0 cursor-pointer flex-col justify-center overflow-hidden rounded-xl border p-2 text-center transition duration-200 hover:-translate-y-1 hover:border-[#00d97b] hover:shadow-[0_18px_38px_rgba(0,217,123,0.18)] sm:min-h-[80px] sm:p-2.5 ${wizardAcRoomCount === count ? "border-[#00d97b] bg-[#eafff4] shadow-[0_16px_34px_rgba(0,217,123,0.14)]" : "border-[#d8e7e3] bg-white"}`}
                          >
                            {wizardAcRoomCount === count ? (
                              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#117865] text-white">
                                <IoShieldCheckmarkOutline className="text-sm" />
                              </span>
                            ) : null}
                            <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full border text-lg transition group-hover:border-[#00d97b] group-hover:bg-[#eafff4] ${wizardAcRoomCount === count ? "border-[#00d97b]/45 bg-[#d8f8ea] text-[#117865]" : "border-[#bddbd4] bg-[#eef7f4] text-[#117865]"}`}>
                              <IoSnowOutline />
                            </span>
                            <strong className="mt-1.5 block text-base text-[#082c3a]">{count}</strong>
                            <span className="mt-0.5 block text-xs text-[#60777f]">{count === 1 ? "AC room" : "AC rooms"}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">AC size</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                        {[
                          ["Inverter AC 1 HP", "Inverter 1HP"],
                          ["1 HP AC", "1HP"],
                          ["1.5 HP AC", "1.5HP"],
                          ["2 HP AC", "2HP"],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setWizardAcAppliance(value)}
                            className={`group relative flex aspect-[16/9] min-h-[72px] min-w-0 cursor-pointer flex-col justify-center overflow-hidden rounded-xl border p-2 text-center transition duration-200 hover:-translate-y-1 hover:border-[#00d97b] hover:shadow-[0_18px_38px_rgba(0,217,123,0.18)] sm:min-h-[80px] sm:p-2.5 ${wizardAcAppliance === value ? "border-[#00d97b] bg-[#eafff4] shadow-[0_16px_34px_rgba(0,217,123,0.14)]" : "border-[#d8e7e3] bg-white"}`}
                          >
                            {wizardAcAppliance === value ? (
                              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#117865] text-white">
                                <IoShieldCheckmarkOutline className="text-sm" />
                              </span>
                            ) : null}
                            <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full border text-lg transition group-hover:border-[#00d97b] group-hover:bg-[#eafff4] ${wizardAcAppliance === value ? "border-[#00d97b]/45 bg-[#d8f8ea] text-[#117865]" : "border-[#bddbd4] bg-[#eef7f4] text-[#117865]"}`}>
                              <IoFlashOutline />
                            </span>
                            <strong className="mt-1.5 block text-sm leading-5 text-[#082c3a]">{label}</strong>
                            <span className="mt-0.5 block text-xs text-[#60777f]">Per AC room</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => setWizardStep(4)} className="mt-4 rounded-full bg-[#117865] px-5 py-3 text-sm font-bold text-white">Continue</button>
                  </div>
                ) : null}

                {wizardStep === 4 ? (
                  <div className="flex h-full min-h-0 flex-col">
                    <p className="shrink-0 pb-3 text-sm leading-6 text-white/86">Building height affects the PV cable allowance. Pick the closest option.</p>
                    <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2 sm:gap-3">
                      {(selectedWizardIsDuplex ? [2, 3, 4] : [1, 2, 3, 4]).map((floor) => (
                        <button
                          key={floor}
                          type="button"
                          onClick={() => {
                            setWizardFloorCount(floor);
                            updateAssumption("floorCount", floor);
                            continueAfterWizardHeight(floor);
                          }}
                          className={`group relative flex h-full min-h-0 min-w-0 cursor-pointer flex-col justify-center overflow-hidden rounded-xl border p-2 text-center transition duration-200 hover:-translate-y-1 hover:border-[#00d97b] hover:shadow-[0_18px_38px_rgba(0,217,123,0.18)] sm:p-2.5 ${wizardFloorCount === floor ? "border-[#00d97b] bg-[#eafff4] shadow-[0_16px_34px_rgba(0,217,123,0.14)]" : "border-[#d8e7e3] bg-white"}`}
                        >
                          {wizardFloorCount === floor ? (
                            <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[#117865] text-white">
                              <IoShieldCheckmarkOutline className="text-lg" />
                            </span>
                          ) : null}
                          <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full border text-base transition group-hover:border-[#00d97b] group-hover:bg-[#eafff4] ${wizardFloorCount === floor ? "border-[#00d97b]/45 bg-[#d8f8ea] text-[#117865]" : "border-[#bddbd4] bg-[#eef7f4] text-[#117865]"}`}>
                            <IoLocationOutline />
                          </span>
                          <strong className="mt-1.5 block text-sm text-[#082c3a]">{floor === 1 ? "Single floor" : `${floor} floors`}</strong>
                          <span className="mt-1 block text-xs leading-4 text-[#60777f]">{floor === 1 ? "Shorter DC cable allowance." : "Adds more cable allowance."}</span>
                        </button>
                      ))}
                    </div>
                    <label className="mt-3 block shrink-0 text-xs font-bold text-white/76">
                      Or enter exact floor count
                      <input
                        type="number"
                        min={selectedWizardIsDuplex ? 2 : 1}
                        max={10}
                        value={wizardFloorCount}
                        onChange={(event) => {
                          const nextFloor = clampNumber(event.target.value, selectedWizardIsDuplex ? 2 : 1, 10);
                          setWizardFloorCount(nextFloor);
                          updateAssumption("floorCount", nextFloor);
                        }}
                        className="mt-1 h-9 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]"
                      />
                    </label>
                    <button type="button" onClick={() => continueAfterWizardHeight()} className="mt-3 shrink-0 self-start rounded-full bg-[#117865] px-5 py-2.5 text-sm font-bold text-white">Continue</button>
                  </div>
                ) : null}

                {wizardStep === 5 ? (
                  <div className="flex h-full min-h-0 flex-col">
                    <p className="shrink-0 pb-3 text-sm leading-6 text-white/86">This adjusts the solar charging assumption. You can still change sun hours later.</p>
                    <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2 sm:gap-3">
                      {wizardBackupOptions.map((option, index) => {
                        const BackupIcon = index === 0 ? IoTimeOutline : index === 1 ? IoBatteryChargingOutline : IoSunnyOutline;
                        const isSelected = wizardBackupId === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setWizardBackupId(option.id);
                              buildWizardDraftLoads(wizardProfileId, option.id);
                            }}
                            className={`group relative flex h-full min-h-0 min-w-0 cursor-pointer flex-col justify-center overflow-hidden rounded-xl border p-2 text-center transition duration-200 hover:-translate-y-1 hover:border-[#00d97b] hover:shadow-[0_18px_38px_rgba(0,217,123,0.18)] sm:p-3 ${isSelected ? "border-[#00d97b] bg-[#eafff4] shadow-[0_16px_34px_rgba(0,217,123,0.14)]" : "border-[#d8e7e3] bg-white"}`}
                          >
                            {isSelected ? (
                              <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#117865] text-white shadow-[0_10px_22px_rgba(17,120,101,0.24)] sm:right-3 sm:top-3 sm:h-7 sm:w-7">
                                <IoShieldCheckmarkOutline className="text-base sm:text-lg" />
                              </span>
                            ) : null}
                            <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full border text-lg transition group-hover:border-[#00d97b] group-hover:bg-[#eafff4] sm:h-10 sm:w-10 sm:text-xl ${isSelected ? "border-[#00d97b]/45 bg-[#d8f8ea] text-[#117865]" : "border-[#bddbd4] bg-[#eef7f4] text-[#117865]"}`}>
                              <BackupIcon />
                            </span>
                            <strong className="mt-1.5 block whitespace-normal break-words text-sm leading-5 text-[#082c3a] sm:mt-2 sm:text-base">{option.title}</strong>
                            <span className="mx-auto mt-1 block max-w-[230px] text-[11px] leading-4 text-[#324e57] sm:mt-1.5 sm:text-xs sm:leading-5">{option.detail}</span>
                            <span className="mt-1 block text-[10px] font-bold text-[#117865] sm:mt-1.5 sm:text-[11px]">Adjusts sizing</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {wizardStep === 6 ? (
                  <div className="flex h-full min-h-0 flex-col">
                    <p className="shrink-0 text-xs leading-5 text-white/86 sm:text-sm sm:leading-6">
                      We selected these likely loads for {selectedWizardProfile.title}. Adjust quantity only; items set to 0 are available options and will not affect the estimate.
                    </p>
                    {selectedWizardProfile.projectType === "business" ? (
                      <p className="mt-1.5 rounded-lg border border-[#d8e7e3] bg-[#eef7f4] px-2.5 py-1.5 text-[11px] leading-4 text-[#4f6a72] sm:mt-2 sm:px-3 sm:py-2 sm:text-xs sm:leading-5">
                        Shop and office suggestions are treated as mostly daytime loads. CCTV keeps night hours by default because it normally runs after closing.
                      </p>
                    ) : null}
                    {(selectedWizardProfile.id === "self-contain" || selectedWizardProfile.id === "two-room-flat") ? (
                      <p className="mt-1.5 rounded-lg border border-[#d8e7e3] bg-[#eef7f4] px-2.5 py-1.5 text-[11px] leading-4 text-[#4f6a72] sm:mt-2 sm:px-3 sm:py-2 sm:text-xs sm:leading-5">
                        For small starter systems, fridge/freezer night use is avoided by default to keep the backup practical. It can be edited later in the advanced calculator.
                      </p>
                    ) : null}
                    <div className="mt-2.5 grid min-h-0 flex-1 auto-rows-max content-start gap-2 overflow-auto pr-1 min-[430px]:grid-cols-2 sm:mt-4 sm:gap-3 sm:pr-2">
                      {wizardDraftGroups.map((group) => {
                        const groupLoads = group.optionNames.map((applianceName) => {
                          const load = wizardDraftLoads.find((item) => item.appliance === applianceName);
                          const appliance = appliances.find((item) => item.name === applianceName);
                          const quantity = load?.quantity || 0;
                          return {
                            appliance,
                            applianceName,
                            isSelected: Boolean(load && wizardSelectedLoadIds[load.id] && quantity > 0),
                            load,
                            quantity,
                            watts: load?.watts || appliance?.watts || 0,
                          };
                        });
                        const groupActive = groupLoads.some((item) => item.isSelected);
                        const activeName = wizardActiveLoadByCategory[group.category] || "";

                        return (
                          <div
                            key={group.category}
                            className={`min-w-0 overflow-hidden rounded-xl border p-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-[#00d97b] hover:shadow-[0_14px_30px_rgba(0,217,123,0.14)] sm:p-4 ${groupActive ? "border-[#00d97b] bg-[#eafff4] shadow-[0_12px_26px_rgba(0,217,123,0.10)]" : "border-[#d8e7e3] bg-white"}`}
                          >
                            <label className="flex cursor-pointer items-start gap-2 sm:gap-3">
                              <input
                                type="checkbox"
                                checked={groupActive}
                                onChange={(event) => {
                                  const shouldSelect = event.target.checked;
                                  if (shouldSelect && !groupActive && group.optionNames[0]) {
                                    updateWizardGroupedLoadQuantity(group.optionNames[0], 1);
                                    return;
                                  }
                                  setWizardSelectedLoadIds((current) => ({
                                    ...current,
                                    ...Object.fromEntries(groupLoads.filter((item) => item.load).map((item) => [item.load!.id, shouldSelect && item.quantity > 0])),
                                  }));
                                }}
                                className="mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4"
                              />
                              <span>
                                <strong className="block text-sm leading-5 text-[#082c3a] sm:text-base">{group.category}</strong>
                                <span className="mt-0.5 block text-[11px] leading-4 text-[#60777f] sm:mt-1 sm:text-xs sm:leading-5">
                                  Select an option and enter quantity.
                                </span>
                              </span>
                            </label>

                            <div
                              onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                  setWizardActiveLoadByCategory((current) => ({
                                    ...current,
                                    [group.category]: "",
                                  }));
                                }
                              }}
                            >
                              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
                                {groupLoads.map((item) => {
                                  const isActive = activeName === item.applianceName;
                                  return (
                                    <div
                                      key={item.applianceName}
                                      onClick={() =>
                                        setWizardActiveLoadByCategory((current) => ({
                                          ...current,
                                          [group.category]: item.applianceName,
                                        }))
                                      }
                                      tabIndex={0}
                                      className={`min-h-[46px] cursor-pointer rounded-lg border px-2 py-1.5 text-left transition hover:border-[#00d97b] hover:bg-white hover:shadow-[0_10px_24px_rgba(0,217,123,0.10)] sm:min-h-[52px] sm:px-2.5 sm:py-2 ${isActive ? "border-[#0033b7] bg-white ring-2 ring-[#0033b7]/15" : item.isSelected ? "border-[#00d97b] bg-[#eafff4] shadow-[0_10px_24px_rgba(0,217,123,0.08)]" : "border-[#d8e7e3] bg-white/70"}`}
                                    >
                                      <span className="grid grid-cols-[minmax(0,1fr)_auto] gap-1">
                                        <span className={`min-w-0 whitespace-normal text-[11px] font-bold leading-[0.9rem] sm:text-xs sm:leading-4 ${item.isSelected || isActive ? "text-[#082c3a]" : "text-[#4f6a72]"}`}>{item.applianceName}</span>
                                        <span className="flex flex-col items-end gap-1">
                                          <span className="rounded-full bg-[#eef3f1] px-1.5 py-0.5 text-[9px] font-bold leading-none text-[#789098]">{item.watts}W</span>
                                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${item.quantity > 0 ? "bg-[#117865] text-white" : "bg-white text-[#789098]"}`}>
                                            {item.quantity > 0 ? `x${item.quantity}` : "0"}
                                          </span>
                                        </span>
                                      </span>
                                      {isActive ? (
                                        <label className="mt-1.5 block text-[10px] font-bold text-[#4f6a72] sm:mt-2 sm:text-[11px]">
                                          Quantity
                                          <input
                                            type="number"
                                            min={0}
                                            max={200}
                                            value={item.quantity > 0 ? item.quantity : ""}
                                            placeholder="0"
                                            autoFocus
                                            onClick={(event) => event.stopPropagation()}
                                            onFocus={(event) => event.currentTarget.select()}
                                            onChange={(event) =>
                                              updateWizardGroupedLoadQuantity(
                                                item.applianceName,
                                                event.target.value === "" ? 0 : Number(event.target.value)
                                              )
                                            }
                                            className="mt-1 h-7 w-full rounded-md border border-[#bddbd4] bg-white px-2 text-center text-sm font-bold text-[#082c3a] sm:h-8"
                                          />
                                        </label>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2.5 grid shrink-0 grid-cols-3 gap-1.5 border-t border-white/12 pt-2.5 sm:mt-3 sm:flex sm:flex-wrap sm:gap-2.5 sm:pt-3">
                      <button type="button" onClick={() => setWizardSelectedLoadIds(Object.fromEntries(wizardDraftLoads.map((load) => [load.id, true])))} className="rounded-full border border-[#bddbd4] bg-white px-2.5 py-2 text-xs font-bold text-[#082c3a] transition hover:-translate-y-0.5 hover:border-[#00d97b] sm:px-4 sm:py-2.5 sm:text-sm">Select all</button>
                      <button type="button" onClick={() => setWizardSelectedLoadIds({})} className="rounded-full border border-[#f0caca] bg-white px-2.5 py-2 text-xs font-bold text-[#9b1c1c] transition hover:-translate-y-0.5 sm:px-4 sm:py-2.5 sm:text-sm">Deselect all</button>
                      <button type="button" onClick={applyWizardDraftLoads} className="rounded-full bg-[#117865] px-2.5 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f6b5b] sm:px-4 sm:py-2.5 sm:text-sm">Use selected loads</button>
                    </div>
                  </div>
                ) : null}

                {wizardStep === 7 ? (
                  <div className="rounded-xl border border-[#d8e7e3] bg-white p-3 shadow-[0_16px_34px_rgba(8,44,58,0.06)] sm:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#117865] sm:text-xs">Starter load created</p>
                        <h4 className="mt-1 text-base font-bold text-[#082c3a] sm:text-lg">{selectedWizardProfile.title}</h4>
                        <p className="mt-1 text-xs leading-5 text-[#60777f] sm:text-sm sm:leading-6">
                          {selectedWizardProjectType.title} project, {wizardRoomCount} room(s), {selectedWizardProfile.projectType === "cooling" ? `${wizardAcRoomCount} AC room(s), ` : ""}{wizardFloorCount} floor(s), {selectedWizardBackup.title}. The same solar engine has prepared a starter recommendation.
                        </p>
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:max-w-[280px] md:items-stretch">
                        <button
                          type="button"
                          onClick={openSelectedLoadsInAdvancedMode}
                          className="inline-flex h-10 items-center justify-center rounded-full bg-[#082c3a] px-4 text-xs font-extrabold leading-tight text-white shadow-[0_14px_28px_rgba(8,44,58,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0f4152] hover:shadow-[0_18px_34px_rgba(8,44,58,0.24)] sm:h-11 sm:px-5 sm:text-sm"
                        >
                          Fine-tune selected loads
                        </button>
                      </div>
                    </div>
                    {recommendation ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                        {[
                          ["Daily energy", formatWh(recommendation.dailyEnergyWh)],
                          ["Solar panels", formatW(recommendation.panelCount * recommendation.selectedPanel.watts)],
                          ["Battery storage", formatWh(recommendation.batteryCount * recommendation.selectedBattery.wh)],
                          ["Inverter", `${recommendation.inverterCount > 1 ? `${recommendation.inverterCount} x ` : ""}${recommendation.selectedInverter.label}`],
                          ["System voltage", `${recommendation.selectedVoltage} V`],
                          ["Estimate", formatNaira(recommendation.totalCost)],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0 overflow-hidden rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-2.5 sm:p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#60777f] sm:text-xs sm:tracking-[0.12em]">{label}</p>
                            <strong className="mt-1 block break-words text-sm leading-5 text-[#082c3a] sm:mt-2 sm:text-xl">{value}</strong>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-3 grid gap-2 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-3 sm:mt-5 sm:gap-3 sm:p-4 md:grid-cols-2">
                      <input value={clientName} onChange={(event) => setClientName(event.target.value)} required placeholder="Client name *" className="h-10 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] sm:h-11 sm:text-base" />
                      <input value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} required type="email" placeholder="Client email *" className="h-10 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] sm:h-11 sm:text-base" />
                      <input value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="Phone / WhatsApp *" className="h-10 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] sm:h-11 sm:text-base" />
                      <input value={location} onChange={(event) => setLocation(event.target.value)} required placeholder="Location *" className="h-10 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] sm:h-11 sm:text-base" />
                      <input value={siteNote} onChange={(event) => setSiteNote(event.target.value)} placeholder="Site note (optional)" className="h-10 rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] sm:h-11 sm:text-base md:col-span-2" />
                      <button
                        type="button"
                        onClick={saveQuoteRequest}
                        disabled={!quoteFormReady || quoteSubmitting || quoteAlreadySubmitted}
                        className={`group relative h-12 overflow-hidden rounded-full text-sm font-bold text-white transition md:col-span-2 ${
                          quoteFormReady && !quoteSubmitting && !quoteAlreadySubmitted
                            ? "bg-[#117865] shadow-[0_12px_26px_rgba(17,120,101,0.22)] hover:-translate-y-0.5 hover:bg-[#0f6b5b]"
                            : quoteAlreadySubmitted
                              ? "cursor-not-allowed bg-[#00a86b] shadow-[0_0_28px_rgba(0,217,123,0.28)]"
                              : "cursor-not-allowed bg-[#9bb9b2]"
                        }`}
                      >
                        {quoteSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                            Sending request...
                          </span>
                        ) : quoteAlreadySubmitted ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[#00a86b]">
                              <IoShieldCheckmarkOutline className="text-base" />
                            </span>
                            Quote request received
                          </span>
                        ) : (
                          "Request final quote"
                        )}
                      </button>
                      {!quoteFormReady ? <p className="text-xs leading-5 text-[#60777f] md:col-span-2">Fill name, valid email, phone/WhatsApp, and location to request a quote.</p> : null}
                      {quoteStatus ? (
                        <p
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold md:col-span-2 ${
                            quoteSubmitting
                              ? "border-[#bddbd4] bg-[#eef7f4] text-[#117865]"
                              : quoteAlreadySubmitted
                                ? "hidden"
                                : quoteSubmitted
                                ? "border-[#00d97b] bg-[#eafff4] text-[#08785b] shadow-[0_12px_30px_rgba(0,217,123,0.14)]"
                                : "border-[#f0caca] bg-[#fff7f7] text-[#9b1c1c]"
                          }`}
                        >
                          {quoteStatus}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[#d8e7e3] bg-white p-4 text-sm leading-7 text-[#60777f]">
                Manual mode is active. Add appliances directly below and the same recommendation engine will size the system.
              </div>
            )}
            </div>
          </div>
        </div>
        <div className="relative z-20 px-4 pb-4 pt-0 text-white md:px-6">
          <div className="rounded-[20px] border border-white/18 bg-[#061f2a]/78 px-4 py-3 shadow-[0_18px_46px_rgba(0,0,0,0.24)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="w-[128px] shrink-0 text-xs font-extrabold uppercase tracking-[0.18em] text-[#16e08f] max-[560px]:w-[112px] max-[560px]:text-[10px] max-[560px]:tracking-[0.1em]">{wizardProgressLabel}</span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/14">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-[#16e08f] via-[#8bd7c8] to-white shadow-[0_0_18px_rgba(22,224,143,0.45)] transition-all duration-500"
                  style={{ width: `${wizardProgressPercent}%` }}
                />
              </div>
              <span className="w-[58px] shrink-0 text-right text-lg font-extrabold text-[#8ff0c7]">{wizardProgressPercent}%</span>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {showCalculator ? (
      <div className="grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0 rounded-lg border border-[#d8e7e3] bg-white p-6 shadow-[0_18px_50px_rgba(8,44,58,0.08)] max-[560px]:p-[18px]">
        <div className="mb-[18px] flex items-center justify-between gap-4 max-[560px]:items-start max-[560px]:flex-col">
          <h2 className="m-0 text-2xl font-bold text-[#082c3a]">Your power load</h2>
          <div className="whitespace-nowrap rounded-full border border-[#d8e7e3] px-[14px] py-[9px] text-[13px] font-bold text-[#117865]">
            Estimate only
          </div>
        </div>

        <div className="mb-[18px] grid gap-[14px] rounded-lg border border-[#d8e7e3] bg-[#eef7f4] p-[14px] md:grid-cols-2">
            <label className="text-xs font-bold text-[#4f6a72]">
              Inverter type
              <select value={inverterType} onChange={(event) => setInverterType(event.target.value as InverterType)} className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]">
                <option value="hybrid">Hybrid inverter</option>
                <option value="non-hybrid">Non-hybrid inverter</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#4f6a72]">
              Effective sun hours
              <input type="number" min={1} max={8} value={assumptions.sunHours} onChange={(event) => updateAssumption("sunHours", Number(event.target.value))} className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
            </label>
            <label className="text-xs font-bold text-[#4f6a72] min-[1181px]:col-span-1">
              Building floors
              <input type="number" min={1} max={10} value={assumptions.floorCount} onChange={(event) => updateAssumption("floorCount", Number(event.target.value))} className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
            </label>
        </div>

        <div className="mb-[18px] grid gap-3 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-[14px] md:grid-cols-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {[
            ["Solar panel brand", panelManufacturer, setPanelManufacturer, manufacturers.panels, brandNote("panel"), "Any solar panel brand"],
            ["Battery brand", batteryManufacturer, setBatteryManufacturer, manufacturers.batteries, brandNote("battery"), "Any battery brand"],
            ["Inverter brand", inverterManufacturer, setInverterManufacturer, manufacturers.inverters, brandNote("inverter"), "Any inverter brand"],
            ["Charge controller brand", controllerManufacturer, setControllerManufacturer, manufacturers.controllers, brandNote("controller"), "Any controller brand"],
          ].map(([label, value, setter, options, note, placeholder]) => (
            <label key={String(label)} className="text-xs font-bold text-[#4f6a72]">
              {String(label)}
              <select value={String(value)} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] bg-white px-3 text-[#082c3a]">
                <option value="">{String(placeholder)}</option>
                {(options as string[]).map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {note ? <span className="mt-1 block text-[11px] text-[#9b1c1c]">{String(note)}</span> : null}
            </label>
          ))}
        </div>

        <details className="mb-[18px] rounded-lg">
          <summary className="cursor-pointer rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] px-[14px] py-3 font-bold text-[#082c3a]">Advanced assumptions</summary>
          <div className="grid gap-3 rounded-b-lg border border-t-0 border-[#d8e7e3] bg-[#fbfdfc] p-[14px] md:grid-cols-5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {[
              ["solarEfficiency", "Solar efficiency", assumptions.solarEfficiency],
              ["inverterEfficiency", "Inverter efficiency", assumptions.inverterEfficiency],
              ["batteryDod", "Battery DoD", assumptions.batteryDod],
              ["reserveMargin", "Reserve", assumptions.reserveMargin],
              ["surgeMargin", "Surge headroom", assumptions.surgeMargin],
            ].map(([key, label, value]) => (
              <label key={String(key)} className="text-xs font-bold text-[#4f6a72]">
                {label}
                <input type="number" min={1} max={100} value={Math.round(Number(value) * 100)} onChange={(event) => updateAssumption(key as keyof SolarAssumptions, Number(event.target.value) / 100)} className="mt-1 h-10 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
              </label>
            ))}
          </div>
        </details>

        <div className="space-y-3">
          {loads.map((load) => (
            <div key={load.id} className="grid gap-3 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-[14px] md:grid-cols-[1.4fr_.7fr_.8fr_.8fr_.8fr_.8fr_auto] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
              <label className="text-xs font-bold text-[#4f6a72]">
                Appliance
                <select value={load.appliance} onChange={(event) => updateLoad(load.id, { appliance: event.target.value })} className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]">
                  {applianceGroups.map((group) => (
                    <optgroup key={group.category} label={group.category}>
                      {group.items.map((appliance) => (
                        <option key={appliance.name} value={appliance.name}>
                          {appliance.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <span className="mt-2 block font-normal text-[#60777f]">{applianceCategory(load.appliance)}</span>
              </label>
              {[
                ["quantity", "Qty", 1],
                ["watts", "Power (W)", 1],
                ["dayHours", "Day hrs", 0],
                ["nightHours", "Night hrs", 0],
                ["cyclePercent", "Cycle %", 0],
              ].map(([key, label, min]) => (
                <label key={String(key)} className="text-xs font-bold text-[#4f6a72]">
                  {label}
                  <input type="number" min={Number(min)} max={key === "cyclePercent" ? 100 : key === "dayHours" || key === "nightHours" ? 12 : undefined} value={Number(load[key as keyof LoadEntry])} onChange={(event) => updateLoad(load.id, { [key]: Number(event.target.value) } as Partial<LoadEntry>)} className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
                </label>
              ))}
              <button type="button" onClick={() => setLoads((current) => current.filter((item) => item.id !== load.id))} className="self-end rounded-md bg-[#f7e9e9] px-3 py-3 font-bold text-[#9b1c1c]">x</button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setLoads((current) => [...current, newLoad()])} className="rounded-full bg-[#117865] px-5 py-3 text-sm font-bold text-white">Add appliance</button>
          <button type="button" onClick={() => setLoads([newLoad("32 inch LED TV"), newLoad("Standing fan"), newLoad("18W LED light")])} className="rounded-full bg-[#eef7f4] px-5 py-3 text-sm font-bold text-[#082c3a]">Reset</button>
        </div>
      </section>

      <aside className="min-w-0 self-start rounded-lg border border-[#d8e7e3] bg-white p-6 shadow-[0_18px_50px_rgba(8,44,58,0.08)] max-[560px]:p-[18px] xl:sticky xl:top-[18px]">
        <h2 className="m-0 text-2xl font-bold text-[#082c3a]">Recommended setup</h2>
        {recommendation ? (
          <>
            <div className="mt-4 divide-y divide-[#d8e7e3]">
              {[
                ["Daily energy", formatWh(recommendation.dailyEnergyWh)],
                ["Solar panel size", formatW(recommendation.panelCount * recommendation.selectedPanel.watts)],
                ["Battery storage", formatWh(recommendation.batteryCount * recommendation.selectedBattery.wh)],
                ["Suggested inverter", `${recommendation.inverterCount > 1 ? `${recommendation.inverterCount} x ` : ""}${recommendation.selectedInverter.label}`],
                ["System voltage", `${recommendation.selectedVoltage} V`],
                ["PV configuration", recommendation.pvConfigurationLabel],
                ["Charge control", recommendation.selectedController ? `${recommendation.controllerCount} x ${recommendation.selectedController.label}` : "Included in hybrid inverter"],
              ].map(([label, value]) => (
                <div key={label} className="py-3">
                  <p className="text-xs font-normal text-[#60777f]">{label}</p>
                  <strong className="mt-1 block text-[28px] leading-tight text-[#082c3a]">{value}</strong>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-[#bddbd4] bg-[#eef7f4] p-4">
              <p className="text-sm text-[#17323a]">Estimated equipment cost</p>
              <strong className="mt-1 block text-3xl text-[#117865]">{formatNaira(recommendation.totalCost)}</strong>
              <p className="mt-3 text-xs leading-5 text-[#4f6a72]">
                Estimate uses current catalogue prices and selected protection/accessories. Assumptions include solar efficiency, inverter efficiency, battery DoD, reserve, surge headroom, and 4hr battery recharge target.
              </p>
            </div>

            <details className="mt-4 rounded-lg border border-[#d8e7e3] p-4">
              <summary className="flex cursor-pointer items-center justify-between gap-3 font-bold text-[#082c3a]">
                Protection and accessories
                <span className="text-xs text-[#60777f]">{recommendation.protectionItems.filter((item) => item.checked).length}/{recommendation.protectionItems.length} selected</span>
              </summary>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setAllProtection(true)} className="rounded-full bg-[#eef7f4] px-3 py-2 text-xs font-bold text-[#082c3a]">Select all</button>
                <button type="button" onClick={() => setAllProtection(false)} className="rounded-full bg-[#f7e9e9] px-3 py-2 text-xs font-bold text-[#9b1c1c]">Deselect all</button>
              </div>
              <div className="mt-3 space-y-3">
                {Object.entries(protectionGroups).map(([group, items]) => (
                  <div key={group}>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#60777f]">{group}</h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <label key={item.id} className="flex gap-3 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-3 text-sm">
                          <input type="checkbox" checked={item.checked} onChange={(event) => setProtectionSelection((current) => ({ ...current, [item.id]: event.target.checked }))} />
                          <span>
                            <strong className="block text-[#082c3a]">{item.title}</strong>
                            <span className="block text-xs leading-5 text-[#60777f]">{item.detail}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>

            <div className="mt-4 rounded-lg bg-[#eef7f4] p-4">
              <h3 className="font-bold text-[#082c3a]">Quote summary</h3>
              <dl className="mt-3 space-y-3 text-sm">
                {recommendation.summaryRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-[#d8e7e3] pb-2">
                    <dt className="font-bold text-[#082c3a]">{row.label}</dt>
                    <dd className="text-[#4f6a72]">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <details className="mt-4 rounded-lg border border-[#d8e7e3] p-4">
              <summary className="cursor-pointer font-bold text-[#082c3a]">Engineering data</summary>
              <dl className="mt-3 grid gap-2 text-sm">
                {recommendation.engineeringData.map((row) => (
                  <div key={row.label} className="grid grid-cols-[130px_1fr] gap-3 rounded-md bg-[#fbfdfc] p-2">
                    <dt className="font-bold text-[#082c3a]">{row.label}</dt>
                    <dd className="text-[#4f6a72]">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </details>

	            <div className="mt-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#60777f]">Client details required</p>
	              <input value={clientName} onChange={(event) => setClientName(event.target.value)} required placeholder="Client name *" className="h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
	              <input value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} required type="email" placeholder="Client email *" className="h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
	              <input value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="Phone / WhatsApp *" className="h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
              <input value={location} onChange={(event) => setLocation(event.target.value)} required placeholder="Location *" className="h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
              <input value={siteNote} onChange={(event) => setSiteNote(event.target.value)} placeholder="Site note (optional)" className="h-11 w-full rounded-md border border-[#bddbd4] px-3 text-[#082c3a]" />
              <button
                type="button"
                onClick={saveQuoteRequest}
                disabled={!quoteFormReady || quoteSubmitting || quoteAlreadySubmitted}
                className={`w-full rounded-full px-5 py-3 text-sm font-bold text-white transition ${
                  quoteFormReady && !quoteSubmitting && !quoteAlreadySubmitted
                    ? "bg-[#117865] shadow-[0_12px_26px_rgba(17,120,101,0.18)] hover:-translate-y-0.5 hover:bg-[#0f6b5b]"
                    : quoteAlreadySubmitted
                      ? "cursor-not-allowed bg-[#00a86b] shadow-[0_0_28px_rgba(0,217,123,0.24)]"
                    : "cursor-not-allowed bg-[#9bb9b2]"
                }`}
              >
                {quoteSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                    Sending request...
                  </span>
                ) : quoteAlreadySubmitted ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[#00a86b]">
                      <IoShieldCheckmarkOutline className="text-base" />
                    </span>
                    Quote request received
                  </span>
                ) : (
                  "Request final quote"
                )}
              </button>
              {!quoteFormReady ? <p className="text-xs leading-5 text-[#60777f]">Fill name, valid email, phone/WhatsApp, and location to request a quote.</p> : null}
              <div className="grid gap-2 rounded-lg border border-[#d8e7e3] p-3">
                <button type="button" onClick={generateExcelQuote} className="rounded-full bg-[#082c3a] px-5 py-3 text-sm font-bold text-white">Generate Excel quote</button>
                <p className="text-xs leading-5 text-[#60777f]">Available after admin login.</p>
              </div>
              {quoteStatus ? (
                <p
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                    quoteSubmitting
                      ? "border-[#bddbd4] bg-[#eef7f4] text-[#117865]"
                      : quoteAlreadySubmitted
                        ? "hidden"
                        : quoteSubmitted
                        ? "border-[#00d97b] bg-[#eafff4] text-[#08785b] shadow-[0_12px_30px_rgba(0,217,123,0.14)]"
                        : "border-[#f0caca] bg-[#fff7f7] text-[#9b1c1c]"
                  }`}
                >
                  {quoteStatus}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-[#60777f]">Add at least one appliance with usage hours to get a practical setup.</p>
        )}
      </aside>
    </div>
      ) : null}
    </div>
  );
}

