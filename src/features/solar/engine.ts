import { formatNaira, formatVa, formatW, formatWh } from "./format";
import type {
  BatteryProduct,
  Catalogue,
  InverterProduct,
  LoadEntry,
  PanelProduct,
  ProtectionItem,
  ProtectionKind,
  ProtectionProduct,
  PvBlock,
  QuoteLine,
  SolarAssumptions,
  SolarPreferences,
  SolarRecommendation,
} from "./types";

const dcBreakerStandards = [32, 63, 100, 125];
const acBreakerStandards = [32, 63, 100];

type BatterySelection = { product: BatteryProduct; count: number; totalWh: number; score: number };
type InverterSelection = { product: InverterProduct; count: number; totalKva: number; totalSurgeVa: number; score: number };
type PanelSelection = {
  product: PanelProduct;
  count: number;
  totalWatts: number;
  config: ReturnType<typeof pvConfiguration>;
  score: number;
};
type ControllerSelection = { product: ControllerProductLike; count: number; totalAmps: number; price: number; score: number };
type ControllerProductLike = Catalogue["controllers"][number];

const loadCycleDefaults = [
  { match: ["fridge", "freezer", "display"], cycle: 40 },
  { match: ["ac"], cycle: 60 },
  { match: ["water pump", "borehole pump"], cycle: 30 },
  { match: ["washing machine"], cycle: 35 },
  { match: ["microwave", "kettle", "toaster", "iron", "hair dryer", "blender", "air fryer", "hot plate", "warmer"], cycle: 20 },
  { match: ["rice cooker"], cycle: 50 },
  { match: ["printer", "copier", "scanner"], cycle: 25 },
  { match: ["vacuum cleaner", "food processor", "sewing machine"], cycle: 30 },
  { match: ["custom"], cycle: 100 },
];

const loadProfiles = [
  { match: ["ac"], category: "Cooling load", surge: 3.5, minKva: 2.5, minVoltage: 48 as const, minBatteryWh: 5000, fullRunHours: 3 },
  { match: ["water pump", "borehole pump"], category: "Motor load", surge: 3, minKva: 2.5, minVoltage: 24 as const, minBatteryWh: 2400 },
  { match: ["fridge", "freezer", "display"], category: "Refrigeration", surge: 2.5, minKva: 2.5, minVoltage: 24 as const, minBatteryWh: 2400, fullRunHours: 3 },
  { match: ["microwave", "kettle", "toaster", "iron", "hair dryer", "rice cooker", "air fryer", "hot plate", "warmer"], category: "Heating load", surge: 1.2, minKva: 2.5, minVoltage: 24 as const, minBatteryWh: 2400 },
  { match: ["washing machine", "blender", "food processor", "vacuum cleaner", "sewing machine"], category: "Motor appliance", surge: 2, minKva: 2.5, minVoltage: 24 as const, minBatteryWh: 2400 },
  { match: ["cctv", "router", "modem", "access control", "alarm", "pos", "starlink", "network switch", "electric fence"], category: "Essential electronics", surge: 1.1, minKva: 0.3, minVoltage: 12 as const, minBatteryWh: 0 },
  { match: ["printer", "copier", "scanner"], category: "Office equipment", surge: 1.5, minKva: 2.5, minVoltage: 24 as const, minBatteryWh: 2400 },
  { match: ["server", "ups"], category: "Critical IT load", surge: 1.3, minKva: 2.5, minVoltage: 48 as const, minBatteryWh: 5000 },
  { match: ["shop", "restaurant", "salon", "pa amplifier", "mixer console"], category: "Commercial load", surge: 1.5, minKva: 2.5, minVoltage: 24 as const, minBatteryWh: 2400 },
  { match: ["custom"], category: "Custom load", surge: 1.5, minKva: 2.5, minVoltage: 24 as const, minBatteryWh: 2400 },
];

function loadProfile(applianceName: string) {
  const normalized = applianceName.toLowerCase();
  return (
    loadProfiles.find((entry) => entry.match.some((term) => normalized.includes(term))) || {
      category: "Light/steady load",
      surge: 1.1,
      minKva: 0.3,
      minVoltage: 12 as const,
      minBatteryWh: 0,
    }
  );
}

export function defaultLoadCycle(applianceName: string) {
  const normalized = applianceName.toLowerCase();
  const match = loadCycleDefaults.find((entry) => entry.match.some((term) => normalized.includes(term)));
  return match ? match.cycle : 100;
}

function effectiveCycleHours(hours: number, cycle: number, fullRunHours = 0) {
  if (hours <= 0) return 0;
  if (!fullRunHours || cycle >= 1) return hours * cycle;
  const fullHours = Math.min(hours, fullRunHours);
  const cycledHours = Math.max(0, hours - fullHours);
  return fullHours + cycledHours * cycle;
}

function manufacturerMatches(productManufacturer: string, selected = "") {
  return productManufacturer.trim().toLowerCase() === selected.trim().toLowerCase();
}

function strictManufacturer<T extends { manufacturer: string }>(products: T[], selected = "") {
  if (!selected) return products;
  return products.filter((product) => manufacturerMatches(product.manufacturer, selected));
}

function uniqueManufacturers<T extends { manufacturer: string }>(products: T[]) {
  return Array.from(new Set(products.map((product) => product.manufacturer).filter(Boolean))).sort();
}

export function manufacturerOptions(catalogue: Catalogue) {
  return {
    panels: uniqueManufacturers(catalogue.panels),
    batteries: uniqueManufacturers(catalogue.batteries),
    inverters: uniqueManufacturers(catalogue.inverters),
    controllers: uniqueManufacturers(catalogue.controllers),
  };
}

function inverterSurgeVa(inverter: InverterProduct) {
  return inverter.surgeVa || inverter.va * 2;
}

function selectInverterBank(
  catalogue: Catalogue,
  requiredKva: number,
  requiredSurgeVa: number,
  minVoltage: 12 | 24 | 48,
  preferences: SolarPreferences
) {
  const compatible = strictManufacturer(
    catalogue.inverters.filter((inverter) => inverter.type === preferences.inverterType),
    preferences.inverterManufacturer
  ).sort((a, b) => a.kva - b.kva);

  let best: InverterSelection | null = null;

  for (const inverter of compatible) {
    if (inverter.voltage < minVoltage) continue;
    const countByContinuous = Math.ceil(requiredKva / Math.max(inverter.kva, 0.1));
    const countBySurge = Math.ceil(requiredSurgeVa / Math.max(inverterSurgeVa(inverter), 1));
    const count = Math.max(1, countByContinuous, countBySurge);
    const totalKva = count * inverter.kva;
    const totalSurgeVa = count * inverterSurgeVa(inverter);
    if (totalKva < requiredKva || totalSurgeVa < requiredSurgeVa) continue;
    const score =
      count * 100000000 +
      (totalKva - requiredKva) * 100000 +
      (totalSurgeVa - requiredSurgeVa) * 10 +
      inverter.price * count;
    if (!best || score < best.score) best = { product: inverter, count, totalKva, totalSurgeVa, score };
  }

  return best;
}

function maxBatteryWhForVoltage(catalogue: Catalogue, voltage: 12 | 24 | 48) {
  return Math.max(0, ...catalogue.batteries.filter((battery) => battery.voltage === voltage).map((battery) => battery.wh));
}

function selectBattery(
  catalogue: Catalogue,
  requiredWh: number,
  voltage: 12 | 24 | 48,
  manufacturer = ""
): BatterySelection | null {
  const compatible = strictManufacturer(
    catalogue.batteries.filter((battery) => battery.voltage === voltage),
    manufacturer
  );
  let best: BatterySelection | null = null;

  for (const battery of compatible) {
    const count = Math.max(1, Math.ceil(requiredWh / battery.wh));
    const totalWh = count * battery.wh;
    const singleBatteryFit = count === 1;
    const standardBankPenalty = singleBatteryFit ? 0 : count * 10000000;
    const score =
      standardBankPenalty +
      count * 100000 +
      (totalWh - requiredWh) * 1000 +
      battery.price * 0.01 +
      battery.wh * 0.001;
    if (!best || score < best.score) best = { product: battery, count, totalWh, score };
  }

  const defaultBattery = compatible.find((battery) => battery.isDefault);
  if (!best || !defaultBattery) return best;
  const bestBattery = best;

  const defaultCount = Math.max(1, Math.ceil(requiredWh / defaultBattery.wh));
  const defaultTotal = defaultCount * defaultBattery.wh;
  const defaultIsPractical =
    defaultCount === 1 &&
    defaultTotal <= bestBattery.totalWh * 1.35 &&
    defaultTotal - requiredWh <= Math.max(bestBattery.totalWh - requiredWh + bestBattery.totalWh * 0.35, requiredWh * 0.35);

  return defaultIsPractical
    ? { product: defaultBattery, count: defaultCount, totalWh: defaultTotal, score: 0 }
    : bestBattery;
}

function pvConfiguration(panelCount: number, voltage: 12 | 24 | 48, maxSeries: number) {
  const minSeries = voltage === 12 ? 1 : 2;
  let best: null | { series: number; parallel: number; totalPanels: number; label: string; addedPanels: number } = null;

  for (let series = minSeries; series <= Math.max(minSeries, maxSeries); series += 1) {
    const parallel = Math.ceil(panelCount / series);
    const totalPanels = series * parallel;
    const candidate = { series, parallel, totalPanels, label: `${series}S${parallel}P`, addedPanels: totalPanels - panelCount };
    const score = parallel * 100000 + candidate.addedPanels * 1000 - series;
    const bestScore = best ? best.parallel * 100000 + best.addedPanels * 1000 - best.series : Infinity;
    if (score < bestScore) best = candidate;
  }

  return best!;
}

function findBestUniformPanels(
  catalogue: Catalogue,
  requiredWatts: number,
  voltage: 12 | 24 | 48,
  inverterType: SolarPreferences["inverterType"],
  manufacturer = ""
): PanelSelection | null {
  const maxSeries = inverterType === "non-hybrid" ? 4 : 7;
  let best: PanelSelection | null = null;

  for (const panel of strictManufacturer(catalogue.panels, manufacturer)) {
    const rawCount = Math.max(1, Math.ceil(requiredWatts / panel.watts));
    const config = pvConfiguration(rawCount, voltage, maxSeries);
    const totalWatts = config.totalPanels * panel.watts;
    const defaultPenalty = panel.isDefault ? -1000 : 0;
    const score = config.totalPanels * 1000000 + (totalWatts - requiredWatts) * 100 + panel.price * 0.01 + defaultPenalty;
    if (!best || score < best.score) best = { product: panel, count: config.totalPanels, totalWatts, config, score };
  }

  return best;
}

function panelImp(panel: PanelProduct) {
  return panel.watts / 40;
}

function nextBreakerSize(requiredAmps: number, standards = dcBreakerStandards) {
  return standards.find((amps) => amps >= requiredAmps) || standards[standards.length - 1];
}

function pvCableSizeFromCurrent(currentAmps: number) {
  if (currentAmps <= 15) return "2.5mm2";
  if (currentAmps <= 25) return "4mm2";
  if (currentAmps <= 40) return "6mm2";
  if (currentAmps <= 63) return "10mm2";
  return "16mm2";
}

function distributePanelsAcrossBlocks(panelCount: number, blockCount: number) {
  const base = Math.floor(panelCount / blockCount);
  const extra = panelCount % blockCount;
  return Array.from({ length: blockCount }, (_, index) => base + (index < extra ? 1 : 0));
}

function buildPvBlocks({
  panel,
  panelCount,
  inverterType,
  controllerCount,
  inverter,
  floorCount,
}: {
  panel: PanelProduct;
  panelCount: number;
  inverterType: SolarPreferences["inverterType"];
  controllerCount: number;
  inverter: InverterProduct;
  floorCount: number;
}) {
  const maxSeries = inverterType === "non-hybrid" ? 4 : 7;
  const imp = panelImp(panel);
  const baseDcLength = floorCount <= 1 ? 20 : 30 + (floorCount - 2) * 10;
  const hybridPvLimit = inverterType === "hybrid" && inverter.hybridPvCurrentA ? inverter.hybridPvCurrentA : 125;
  const maxPvDesignCurrent = Math.min(125, hybridPvLimit);

  function makeBlocks(blockCount: number): PvBlock[] {
    return distributePanelsAcrossBlocks(panelCount, blockCount).map((count, index) => {
      const config = pvConfiguration(Math.max(1, count), inverter.voltage, maxSeries);
      const pvBlockCurrent = imp * config.parallel;
      const pvDesignCurrent = pvBlockCurrent * 1.25;
      const breakerSize = nextBreakerSize(pvDesignCurrent, dcBreakerStandards);
      return {
        index: index + 1,
        panelCount: config.totalPanels,
        label: config.label,
        series: config.series,
        parallel: config.parallel,
        pvBlockCurrent,
        pvDesignCurrent,
        breakerSize,
        cableSize: pvCableSizeFromCurrent(pvDesignCurrent),
        cableLength: baseDcLength + config.totalPanels,
      };
    });
  }

  let pvProcessingBlockCount = inverterType === "non-hybrid" ? Math.max(1, controllerCount) : 1;
  let blocks = makeBlocks(pvProcessingBlockCount);

  if (inverterType === "hybrid" && blocks.some((block) => block.pvDesignCurrent > maxPvDesignCurrent) && panelCount > 1) {
    pvProcessingBlockCount = 2;
    blocks = makeBlocks(pvProcessingBlockCount);
  }

  while (blocks.some((block) => block.pvDesignCurrent > maxPvDesignCurrent) && pvProcessingBlockCount < panelCount) {
    pvProcessingBlockCount += 1;
    blocks = makeBlocks(pvProcessingBlockCount);
  }

  const adjustedPanelCount = blocks.reduce((sum, block) => sum + block.panelCount, 0);
  return {
    blocks,
    maxPvDesignCurrent,
    isWithinPvCurrentLimit: blocks.every((block) => block.pvDesignCurrent <= maxPvDesignCurrent),
    pvProcessingBlockCount,
    hybridPvSetCount: inverterType === "hybrid" ? pvProcessingBlockCount : 0,
    panelCount: adjustedPanelCount,
    panelWatts: adjustedPanelCount * panel.watts,
    label: blocks.map((block) => `PV${block.index}: ${block.label}`).join(", "),
  };
}

function selectControllerForPvBlocks(catalogue: Catalogue, pvBlocks: PvBlock[], manufacturer = ""): ControllerSelection | undefined {
  const requiredAmps = Math.max(0, ...pvBlocks.map((block) => block.pvDesignCurrent));
  if (requiredAmps <= 0 || !pvBlocks.length) return undefined;
  const controllers = strictManufacturer(catalogue.controllers, manufacturer).sort((a, b) => a.amps - b.amps);
  let best: ControllerSelection | null = null;

  for (const controller of controllers) {
    if (controller.amps < requiredAmps) continue;
    const count = pvBlocks.length;
    const totalAmps = count * controller.amps;
    const score = (controller.amps - requiredAmps) * 10000 + count * controller.price;
    if (!best || score < best.score) best = { product: controller, count, totalAmps, price: count * controller.price, score };
  }

  return best || undefined;
}

function selectProtectionProduct(catalogue: Catalogue, kind: ProtectionKind, requiredCapacity = 1) {
  const candidates = catalogue.protection
    .filter((product) => product.kind === kind)
    .sort((a, b) => a.capacity - b.capacity);
  return (
    candidates.find((product) => product.isDefault && product.capacity >= requiredCapacity) ||
    candidates.find((product) => product.capacity >= requiredCapacity) ||
    candidates[candidates.length - 1]
  );
}

function selectSwitchProduct(catalogue: Catalogue, poles: number, requiredCapacity: number) {
  const candidates = catalogue.protection
    .filter((product) => product.kind === "knife-switch" && product.poles === poles)
    .sort((a, b) => a.capacity - b.capacity);
  return candidates.find((product) => product.capacity >= requiredCapacity) || candidates[candidates.length - 1];
}

function unitPrice(catalogue: Catalogue, kind: ProtectionKind, requiredCapacity = 1, fallback = 0) {
  return selectProtectionProduct(catalogue, kind, requiredCapacity)?.price ?? fallback;
}

function linePrice(catalogue: Catalogue, kind: ProtectionKind, quantity: number, requiredCapacity = 1, fallback = 0) {
  return unitPrice(catalogue, kind, requiredCapacity, fallback) * quantity;
}

function cableCapacity(size: string) {
  return Number.parseFloat(size.replace("mm2", "")) || 0;
}

function acCableSizeFromCurrent(currentAmps: number) {
  if (currentAmps <= 18) return "2.5mm2";
  if (currentAmps <= 25) return "4mm2";
  if (currentAmps <= 40) return "6mm2";
  return "10mm2";
}

function batteryCableSize(currentAmps: number) {
  if (currentAmps <= 70) return "16mm2";
  if (currentAmps <= 100) return "25mm2";
  if (currentAmps <= 150) return "35mm2";
  if (currentAmps <= 200) return "50mm2";
  if (currentAmps <= 260) return "70mm2";
  if (currentAmps <= 330) return "95mm2";
  return "120mm2";
}

function systemClassFor(inverterKva: number, inverterCount: number, batteryWh: number) {
  if (inverterKva < 1 && inverterCount === 1) return "T1" as const;
  if (inverterCount > 1 && batteryWh > 30000) return "T5" as const;
  if (inverterCount > 1) return "T4" as const;
  if (inverterKva >= 7.5) return "T3" as const;
  return "T2" as const;
}

function breakerBoxSelection(requiredHousedPoles: number) {
  const poles = Math.ceil(requiredHousedPoles * 1.2);
  const standards = [
    { ways: 12, type: "12-way breaker box", price: 35000 },
    { ways: 9, type: "9-way breaker box", price: 28000 },
    { ways: 6, type: "6-way breaker box", price: 22000 },
    { ways: 4, type: "4-way breaker box", price: 15000 },
  ];
  let best: null | { boxes: { ways: number; type: string; price: number; quantity: number }[]; capacity: number; poles: number; type: string; quantity: number } = null;
  const maxBoxes = Math.ceil(poles / 4) + 1;

  for (let boxCount = 1; boxCount <= maxBoxes; boxCount += 1) {
    const walk = (index: number, remaining: number, boxes: { ways: number; type: string; price: number; quantity: number }[]) => {
      if (index === standards.length - 1) {
        const finalBoxes = [...boxes, { ...standards[index], quantity: remaining }];
        const capacity = finalBoxes.reduce((sum, box) => sum + box.ways * box.quantity, 0);
        if (capacity < poles) return;
        const quantity = finalBoxes.reduce((sum, box) => sum + box.quantity, 0);
        const active = finalBoxes.filter((box) => box.quantity);
        const score = (capacity - poles) * 100 + quantity;
        if (!best || score < (best.capacity - poles) * 100 + best.quantity) {
          best = {
            boxes: active,
            capacity,
            poles,
            quantity,
            type: active.map((box) => `${box.quantity} x ${box.type}`).join(" + "),
          };
        }
        return;
      }
      for (let quantity = 0; quantity <= remaining; quantity += 1) {
        walk(index + 1, remaining - quantity, [...boxes, { ...standards[index], quantity }]);
      }
    };
    walk(0, boxCount, []);
    if (best) break;
  }

  return best!;
}

function protectionRules({
  systemClass,
  inverterType,
  inverterCount,
  controllerCount,
  pvProcessingBlockCount,
  hybridPvSetCount,
}: {
  systemClass: ReturnType<typeof systemClassFor>;
  inverterType: SolarPreferences["inverterType"];
  inverterCount: number;
  controllerCount: number;
  pvProcessingBlockCount: number;
  hybridPvSetCount: number;
}) {
  const dcSourceQty = inverterType === "hybrid" ? Math.max(1, hybridPvSetCount || pvProcessingBlockCount || 1) : Math.max(1, controllerCount);
  const rules = {
    acBreakerQty: 0,
    dcBreakerQty: 0,
    acSpdQty: 0,
    dcSpdQty: 0,
    avrQty: 0,
    switchType: "DP 100A knife switch",
    switchQty: 1,
    batteryCombinerBoxQty: 0,
  };

  if (systemClass === "T1") {
    rules.dcBreakerQty = dcSourceQty;
    rules.avrQty = 1;
  } else if (systemClass === "T2") {
    Object.assign(rules, { acBreakerQty: 1, dcBreakerQty: dcSourceQty, acSpdQty: 1, dcSpdQty: dcSourceQty, avrQty: 1 });
  } else if (systemClass === "T3") {
    Object.assign(rules, { acBreakerQty: 1, dcBreakerQty: dcSourceQty, acSpdQty: 2, dcSpdQty: dcSourceQty, avrQty: 2 });
  } else {
    rules.switchType = "4P changeover";
    rules.acBreakerQty = inverterCount;
    rules.dcBreakerQty = dcSourceQty;
    rules.acSpdQty = inverterCount * 2;
    rules.dcSpdQty = dcSourceQty;
    rules.avrQty = inverterCount * 2;
    if (systemClass === "T5") rules.batteryCombinerBoxQty = 1;
  }

  const requiredHousedPoles =
    rules.acBreakerQty * 2 +
    rules.dcBreakerQty * 2 +
    rules.acSpdQty * 2 +
    rules.dcSpdQty * 2 +
    rules.avrQty * 2;

  return { ...rules, requiredHousedPoles, breakerBox: breakerBoxSelection(requiredHousedPoles) };
}

function panelRailCapacity(panelWatts: number) {
  if (panelWatts <= 250) return 4;
  if (panelWatts <= 550) return 3;
  return 2;
}

function cableAndAccessoryRules(systemClass: ReturnType<typeof systemClassFor>, inverter: InverterProduct, inverterCount: number, panel: PanelProduct, panelCount: number, pvBlocks: PvBlock[]) {
  const railCapacity = panelRailCapacity(panel.watts);
  const railCount = Math.ceil(panelCount / railCapacity);
  const nailsQty = railCount <= 3 ? 1 : railCount <= 6 ? 2 : 3;
  const acCurrent = inverter.va / 230;
  const batteryCurrent = inverter.va / inverter.voltage;
  const acCableSize = acCableSizeFromCurrent(acCurrent);
  const pvCableSize = Array.from(new Set(pvBlocks.map((block) => block.cableSize))).join(" / ");
  const pvCableLength = pvBlocks.reduce((sum, block) => sum + block.cableLength, 0);
  const batteryCableLengths = { T1: 2, T2: 5, T3: 10, T4: 15, T5: 20 };
  const earthingLengths = { T1: 5, T2: 10, T3: 20, T4: 30, T5: 40 };
  const consumables = {
    T1: { lugs: 4, tapes: 3, zipTies: 1 },
    T2: { lugs: 6, tapes: 3, zipTies: 1 },
    T3: { lugs: 10, tapes: 6, zipTies: 1 },
    T4: { lugs: 16, tapes: 6, zipTies: 2 },
    T5: { lugs: 24, tapes: 9, zipTies: 2 },
  }[systemClass];

  return {
    railCount,
    mountingAccessoriesQty: railCount,
    nailsQty,
    acCableSize,
    acCableLength: 15 * inverterCount,
    pvCableSize,
    pvCableLength,
    batteryCableSize: batteryCableSize(batteryCurrent),
    batteryCableLength: batteryCableLengths[systemClass] * inverterCount,
    earthingCableSize: acCableSize,
    earthingCableLength: earthingLengths[systemClass],
    lugQty: consumables.lugs,
    tapeQty: consumables.tapes,
    zipTieQty: consumables.zipTies,
  };
}

function item(
  catalogue: Catalogue,
  group: ProtectionItem["group"],
  id: string,
  kind: ProtectionKind,
  title: string,
  detail: string,
  quantity = 1,
  requiredCapacity = 1,
  fallback = 0
): ProtectionItem {
  const price = linePrice(catalogue, kind, quantity, requiredCapacity, fallback);
  return { id, group, title, detail, quantity, price, checked: true };
}

function buildProtectionItems({
  catalogue,
  panel,
  panelCount,
  inverter,
  inverterType,
  inverterCount,
  controllerCount,
  batteryWh,
  systemClass,
  pvBlocks,
}: {
  catalogue: Catalogue;
  panel: PanelProduct;
  panelCount: number;
  inverter: InverterProduct;
  inverterType: SolarPreferences["inverterType"];
  inverterCount: number;
  controllerCount: number;
  batteryWh: number;
  systemClass: ReturnType<typeof systemClassFor>;
  pvBlocks: ReturnType<typeof buildPvBlocks>;
}) {
  const rules = protectionRules({
    systemClass,
    inverterType,
    inverterCount,
    controllerCount,
    pvProcessingBlockCount: pvBlocks.pvProcessingBlockCount,
    hybridPvSetCount: pvBlocks.hybridPvSetCount,
  });
  const items: ProtectionItem[] = [];
  const dcGroups = Array.from(new Set(pvBlocks.blocks.map((block) => block.breakerSize)))
    .map((size) => `${size}A x ${pvBlocks.blocks.filter((block) => block.breakerSize === size).length}`)
    .join(", ");
  const maxDcBreaker = Math.max(...pvBlocks.blocks.map((block) => block.breakerSize));
  const acBreaker = nextBreakerSize((inverter.va / 230) * 1.25, acBreakerStandards);

  if (rules.dcBreakerQty) {
    items.push(item(
      catalogue,
      "Protection",
      "dc-breaker-solar-input",
      "dc-breaker",
      `${dcGroups} DC breaker`,
      `DC protection follows ${inverterType === "hybrid" ? "hybrid PV set count" : "charge controller count"}.`,
      rules.dcBreakerQty,
      maxDcBreaker
    ));
  }
  if (rules.dcSpdQty) items.push(item(catalogue, "Protection", "dc-spd-solar-input", "dc-spd", `${rules.dcSpdQty} x DC surge protector`, "Solar input surge protection.", rules.dcSpdQty));
  if (rules.acBreakerQty) items.push(item(catalogue, "Protection", "ac-breaker-output", "ac-breaker", `${rules.acBreakerQty} x ${acBreaker}A AC breaker`, "Inverter AC output protection.", rules.acBreakerQty, acBreaker));
  if (rules.acSpdQty) items.push(item(catalogue, "Protection", "ac-spd-output", "ac-spd", `${rules.acSpdQty} x AC surge protector`, "AC output surge protection.", rules.acSpdQty));
  if (rules.avrQty) items.push(item(catalogue, "Protection", "avr-input", "avr", `${rules.avrQty} x AVR`, "Voltage regulation for protected AC paths.", rules.avrQty));

  const switchPoles = rules.switchType.includes("4P") ? 4 : 2;
  const switchDesignCurrent = ((inverter.va * inverterCount) / 230) * 1.25;
  const switchProduct = selectSwitchProduct(catalogue, switchPoles, switchDesignCurrent);
  items.push({
    id: "knife-switch",
    group: "Switching",
    title: `${rules.switchQty} x ${switchProduct?.label || rules.switchType}`,
    detail: `${switchPoles} pole switch is outside the breaker box.`,
    quantity: rules.switchQty,
    price: (switchProduct?.price || 0) * rules.switchQty,
    checked: true,
  });

  const boxCost = rules.breakerBox.boxes.reduce((sum, box) => sum + linePrice(catalogue, "breaker-box", box.quantity, box.ways, box.price), 0);
  items.push({
    id: "breaker-box",
    group: "Enclosure",
    title: rules.breakerBox.type,
    detail: `${rules.breakerBox.poles} poles required after spare margin; ${rules.breakerBox.capacity} ways provided.`,
    quantity: rules.breakerBox.quantity,
    price: boxCost,
    checked: true,
  });

  if (rules.batteryCombinerBoxQty) items.push(item(catalogue, "Enclosure", "combiner-box", "combiner-box", "Battery combiner box", "Separate battery combiner box for large battery bank arrangement.", rules.batteryCombinerBoxQty));

  const accessories = cableAndAccessoryRules(systemClass, inverter, inverterCount, panel, panelCount, pvBlocks.blocks);
  const pvCableLengthsBySize = pvBlocks.blocks.reduce<Record<string, number>>((totals, block) => {
    totals[block.cableSize] = (totals[block.cableSize] || 0) + block.cableLength;
    return totals;
  }, {});
  const pvCablePrice = Object.entries(pvCableLengthsBySize).reduce(
    (sum, [size, length]) => sum + linePrice(catalogue, "pv-cable", length, cableCapacity(size), 1800),
    0
  );

  items.push(
    item(catalogue, "Mounting", "rails", "solar-rail", `${accessories.railCount} x solar mounting rail`, `${panelCount} panel(s), rail capacity matched to selected panel wattage.`, accessories.railCount, 1, 15000),
    item(catalogue, "Mounting", "mounting-accessories", "mounting", `${accessories.mountingAccessoriesQty} x mounting accessories set`, "Panel clamps and mounting accessories.", accessories.mountingAccessoriesQty, 1, 12000),
    item(catalogue, "Mounting", "nails-fasteners", "nails-fasteners", `${accessories.nailsQty} x nails/fasteners pack`, "Fastener pack based on rail count.", accessories.nailsQty, 1, 5000),
    item(catalogue, "Cables", "ac-cable", "ac-cable", `${accessories.acCableLength}m ${accessories.acCableSize} AC cable`, `${inverterCount > 1 ? "Total allowance across inverter outputs. " : ""}AC cable sized from inverter capacity.`, accessories.acCableLength, cableCapacity(accessories.acCableSize), 2500),
    { id: "pv-cable", group: "Cables", title: `${accessories.pvCableLength}m ${accessories.pvCableSize} PV cable`, detail: `PV cable sized per PV block: ${pvBlocks.blocks.map((block) => `PV${block.index} ${block.cableSize}, ${block.cableLength}m`).join("; ")}.`, quantity: accessories.pvCableLength, price: pvCablePrice, checked: true },
    item(catalogue, "Cables", "battery-cable", "battery-cable", `${accessories.batteryCableLength}m ${accessories.batteryCableSize} battery cable`, `${inverterCount > 1 ? "Total allowance across inverter battery runs. " : ""}Battery cable sized from inverter DC current.`, accessories.batteryCableLength, cableCapacity(accessories.batteryCableSize), 6500),
    item(catalogue, "Cables", "earthing-cable", "earthing-cable", `${accessories.earthingCableLength}m ${accessories.earthingCableSize} earthing cable`, "Earthing cable aligns with AC cable sizing.", accessories.earthingCableLength, cableCapacity(accessories.earthingCableSize), 1200),
    item(catalogue, "Consumables", "lugs", "lugs", `${accessories.lugQty} x cable lugs`, "Consumable allowance.", accessories.lugQty, 1, 1000),
    item(catalogue, "Consumables", "tapes", "tape", `${accessories.tapeQty} x tape`, "Consumable allowance.", accessories.tapeQty, 1, 800),
    item(catalogue, "Consumables", "zip-ties", "zip-tie", `${accessories.zipTieQty} x zip tie pack`, "Consumable allowance.", accessories.zipTieQty, 1, 2500)
  );

  return { rules, items, accessories };
}

export function calculateSolarRecommendation(
  loads: LoadEntry[],
  assumptions: SolarAssumptions,
  preferences: SolarPreferences,
  catalogue: Catalogue,
  protectionSelection: Record<string, boolean> = {}
): SolarRecommendation | null {
  let dayWh = 0;
  let nightWh = 0;
  let connectedLoadW = 0;
  let diversifiedDayLoadW = 0;
  let diversifiedNightLoadW = 0;
  let largestSurgeExtraW = 0;
  let minLoadKva = 0.3;
  let minLoadVoltage: 12 | 24 | 48 = 12;
  let minLoadBatteryWh = 0;
  const categories = new Set<string>();

  loads.forEach((load) => {
    const profile = loadProfile(load.appliance);
    const dayHours = Math.min(12, Math.max(0, load.dayHours));
    const nightHours = Math.min(12, Math.max(0, load.nightHours));
    const cycle = Math.max(0, Math.min(100, load.cyclePercent)) / 100;
    const watts = Math.max(0, load.watts) * Math.max(0, load.quantity);
    const fullRunHours = "fullRunHours" in profile ? profile.fullRunHours || 0 : 0;
    const dayCycleHours = effectiveCycleHours(dayHours, cycle, fullRunHours);
    const nightCycleHours = effectiveCycleHours(nightHours, cycle, fullRunHours);

    dayWh += watts * dayCycleHours;
    nightWh += watts * nightCycleHours;
    connectedLoadW += watts;
    diversifiedDayLoadW += dayHours > 0 ? watts * Math.min(dayCycleHours / dayHours, 1) : 0;
    diversifiedNightLoadW += nightHours > 0 ? watts * Math.min(nightCycleHours / nightHours, 1) : 0;
    largestSurgeExtraW = Math.max(largestSurgeExtraW, watts * Math.max(profile.surge - 1, 0));
    minLoadKva = Math.max(minLoadKva, profile.minKva);
    minLoadVoltage = Math.max(minLoadVoltage, profile.minVoltage) as 12 | 24 | 48;
    minLoadBatteryWh = Math.max(minLoadBatteryWh, profile.minBatteryWh);
    categories.add(profile.category);
  });

  const dailyEnergyWh = dayWh + nightWh;
  if (dailyEnergyWh <= 0 || connectedLoadW <= 0) return null;

  const sunHours = Math.min(8, Math.max(1, assumptions.sunHours));
  const runningVa = (connectedLoadW / 0.8) * (1 + assumptions.surgeMargin);
  const surgeVa = ((connectedLoadW + largestSurgeExtraW) / 0.8) * (1 + assumptions.surgeMargin);
  const rawInverterKva = Math.max(runningVa / 1000, minLoadKva);
  const requiredBatteryWh = Math.max(
    (nightWh / assumptions.inverterEfficiency / assumptions.batteryDod) * (1 + assumptions.reserveMargin),
    minLoadBatteryWh
  );
  const rawPanelWatts = Math.max(
    dailyEnergyWh / (sunHours * assumptions.solarEfficiency),
    requiredBatteryWh / (4 * assumptions.solarEfficiency)
  );
  const warnings: string[] = [];

  let inverterSelection = selectInverterBank(catalogue, rawInverterKva, surgeVa, minLoadVoltage, preferences);
  if (!inverterSelection) return null;
  if (inverterSelection.product.voltage === 12 && requiredBatteryWh > maxBatteryWhForVoltage(catalogue, 12)) {
    inverterSelection = selectInverterBank(catalogue, rawInverterKva, surgeVa, 24, preferences);
  }
  if (inverterSelection?.product.voltage === 24 && requiredBatteryWh > maxBatteryWhForVoltage(catalogue, 24)) {
    inverterSelection = selectInverterBank(catalogue, rawInverterKva, surgeVa, 48, preferences);
  }
  if (!inverterSelection) return null;

  const inverter = inverterSelection.product;
  const inverterCount = inverterSelection.count;
  const selectedVoltage = inverter.voltage;
  let battery = selectBattery(catalogue, requiredBatteryWh, selectedVoltage, preferences.batteryManufacturer);
  if (!battery && preferences.batteryManufacturer) {
    return null;
  }
  if (!battery) return null;

  const panelSelection = findBestUniformPanels(catalogue, rawPanelWatts, selectedVoltage, preferences.inverterType, preferences.panelManufacturer);
  if (!panelSelection) return null;
  let controllerSelection: ControllerSelection | undefined;
  let controllerCount = preferences.inverterType === "non-hybrid" ? 1 : 0;
  let pvBlocks = buildPvBlocks({
    panel: panelSelection.product,
    panelCount: panelSelection.count,
    inverterType: preferences.inverterType,
    controllerCount,
    inverter,
    floorCount: assumptions.floorCount,
  });
  if (!pvBlocks.isWithinPvCurrentLimit) return null;

  if (preferences.inverterType === "non-hybrid") {
    controllerSelection = selectControllerForPvBlocks(catalogue, pvBlocks.blocks, preferences.controllerManufacturer);
    if (!controllerSelection) return null;
    controllerCount = controllerSelection.count;
    pvBlocks = buildPvBlocks({
      panel: panelSelection.product,
      panelCount: panelSelection.count,
      inverterType: preferences.inverterType,
      controllerCount,
      inverter,
      floorCount: assumptions.floorCount,
    });
    if (!pvBlocks.isWithinPvCurrentLimit) return null;
    controllerSelection = selectControllerForPvBlocks(catalogue, pvBlocks.blocks, preferences.controllerManufacturer);
    if (!controllerSelection) return null;
    controllerCount = controllerSelection.count;
  }

  const systemClass = systemClassFor(inverter.kva, inverterCount, battery.totalWh);
  const panelCount = pvBlocks.panelCount;
  const panelCost = panelCount * panelSelection.product.price;
  const batteryCost = battery.count * battery.product.price;
  const inverterCost = inverterCount * inverter.price;
  const controllerCost = controllerSelection ? controllerCount * controllerSelection.product.price : 0;
  const protection = buildProtectionItems({
    catalogue,
    panel: panelSelection.product,
    panelCount,
    inverter,
    inverterType: preferences.inverterType,
    inverterCount,
    controllerCount,
    batteryWh: battery.totalWh,
    systemClass,
    pvBlocks,
  });
  const protectionItems = protection.items.map((protectionItem) => ({
    ...protectionItem,
    checked: protectionSelection[protectionItem.id] ?? protectionItem.checked,
  }));
  const protectionCost = protectionItems.filter((protectionItem) => protectionItem.checked).reduce((sum, protectionItem) => sum + protectionItem.price, 0);
  const totalCost = panelCost + batteryCost + inverterCost + controllerCost + protectionCost;

  const quoteLines: QuoteLine[] = [
    { name: "Solar panels", description: panelSelection.product.label, quantity: panelCount, rate: panelSelection.product.price, amount: panelCost },
    { name: "Battery bank", description: battery.product.label, quantity: battery.count, rate: battery.product.price, amount: batteryCost },
    { name: "Inverter", description: `${inverter.label} ${preferences.inverterType}`, quantity: inverterCount, rate: inverter.price, amount: inverterCost },
    ...(controllerSelection ? [{ name: "Charge controller", description: controllerSelection.product.label, quantity: controllerCount, rate: controllerSelection.product.price, amount: controllerCost }] : []),
    ...protectionItems.filter((protectionItem) => protectionItem.checked).map((protectionItem) => ({
      name: protectionItem.title,
      description: protectionItem.detail,
      quantity: protectionItem.quantity || 1,
      rate: protectionItem.price / Math.max(protectionItem.quantity || 1, 1),
      amount: protectionItem.price,
    })),
  ];

  return {
    connectedLoadW,
    diversifiedDayLoadW,
    diversifiedNightLoadW,
    dailyEnergyWh,
    continuousVaRequired: runningVa,
    surgeVaRequired: surgeVa,
    selectedVoltage,
    inverterType: preferences.inverterType,
    selectedInverter: inverter,
    inverterCount,
    selectedBattery: battery.product,
    batteryCount: battery.count,
    selectedPanel: panelSelection.product,
    panelCount,
    pvSeriesCount: pvBlocks.blocks[0]?.series || panelSelection.config.series,
    pvParallelCount: pvBlocks.blocks[0]?.parallel || panelSelection.config.parallel,
    selectedController: controllerSelection?.product,
    controllerCount,
    pvProcessingBlockCount: pvBlocks.pvProcessingBlockCount,
    hybridPvSetCount: pvBlocks.hybridPvSetCount,
    pvBlocks: pvBlocks.blocks,
    pvConfigurationLabel: pvBlocks.label,
    systemClass,
    protectionItems,
    protectionCost,
    accessories: protection.accessories,
    totalCost,
    quoteLines,
    warnings,
    summaryRows: [
      { label: "Solar panels", value: `${panelCount} x ${panelSelection.product.label} = ${formatW(panelCount * panelSelection.product.watts)} configured as ${pvBlocks.label}` },
      { label: "Battery bank", value: `${battery.count} x ${battery.product.label} = ${formatWh(battery.totalWh)}` },
      { label: "Inverter", value: `${inverterCount > 1 ? `${inverterCount} x ` : ""}${inverter.label}` },
      { label: "Charge control", value: controllerSelection ? `${controllerCount} x ${controllerSelection.product.label}` : "No external charge controller required" },
      { label: "Surge check", value: `${formatVa(surgeVa)} required, ${formatVa(inverterSurgeVa(inverter) * inverterCount)} available` },
      { label: "Load type", value: Array.from(categories).join(", ") },
      { label: "Sizing basis", value: "Losses, surge headroom, reserve margin, and battery DoD are included." },
    ],
    engineeringData: [
      { label: "Connected load", value: `${formatW(connectedLoadW)} before diversity` },
      { label: "Practical day load", value: `${formatW(diversifiedDayLoadW)} after usage cycle` },
      { label: "Practical night load", value: `${formatW(diversifiedNightLoadW)} after usage cycle` },
      { label: "Daily energy", value: formatWh(dailyEnergyWh) },
      { label: "Inverter demand", value: `${formatVa(runningVa)} continuous, ${formatVa(surgeVa)} startup surge` },
      { label: "System voltage", value: `${selectedVoltage}V ${preferences.inverterType} system` },
      { label: "Selected inverter", value: `${inverterCount} x ${inverter.label}` },
      { label: "Selected battery", value: `${battery.count} x ${battery.product.label}` },
      { label: "Selected panels", value: `${panelCount} x ${panelSelection.product.label}` },
      { label: "PV layout", value: `${pvBlocks.label} across ${pvBlocks.pvProcessingBlockCount} PV block(s)` },
      { label: "Charge control", value: `${controllerCount} controller(s)` },
      { label: "Protection", value: `${protection.rules.acBreakerQty} AC breaker(s), ${protection.rules.dcBreakerQty} DC breaker(s), ${protection.rules.acSpdQty} AC SPD, ${protection.rules.dcSpdQty} DC SPD, ${protection.rules.avrQty} AVR` },
      { label: "Enclosure", value: `${protection.rules.breakerBox.type}; ${protection.rules.requiredHousedPoles} housed pole(s)` },
      { label: "Switching", value: `${protection.rules.switchQty} x ${protection.rules.switchType}` },
    ],
  };
}
