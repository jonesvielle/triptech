export type InverterType = "hybrid" | "non-hybrid";

export type Appliance = {
  name: string;
  watts: number;
};

export type LoadEntry = {
  id: string;
  appliance: string;
  quantity: number;
  watts: number;
  dayHours: number;
  nightHours: number;
  cyclePercent: number;
};

export type PanelProduct = {
  id: string;
  manufacturer: string;
  label: string;
  watts: number;
  price: number;
  isDefault?: boolean;
};

export type BatteryProduct = {
  id: string;
  manufacturer: string;
  label: string;
  voltage: 12 | 24 | 48;
  ah: number;
  wh: number;
  price: number;
  isDefault?: boolean;
};

export type InverterProduct = {
  id: string;
  manufacturer: string;
  label: string;
  type: InverterType;
  kva: number;
  va: number;
  voltage: 12 | 24 | 48;
  surgeVa: number;
  hybridPvCurrentA?: number;
  price: number;
  isDefault?: boolean;
};

export type ControllerProduct = {
  id: string;
  manufacturer: string;
  label: string;
  amps: number;
  price: number;
  isDefault?: boolean;
};

export type ProtectionKind =
  | "dc-breaker"
  | "ac-breaker"
  | "dc-spd"
  | "ac-spd"
  | "avr"
  | "knife-switch"
  | "combiner-box"
  | "breaker-box"
  | "ac-cable"
  | "pv-cable"
  | "battery-cable"
  | "earthing-cable"
  | "solar-rail"
  | "mounting"
  | "nails-fasteners"
  | "lugs"
  | "tape"
  | "zip-tie";

export type ProtectionProduct = {
  id: string;
  manufacturer: string;
  label: string;
  kind: ProtectionKind;
  capacity: number;
  price: number;
  poles?: number;
  isDefault?: boolean;
};

export type Catalogue = {
  panels: PanelProduct[];
  batteries: BatteryProduct[];
  inverters: InverterProduct[];
  controllers: ControllerProduct[];
  protection: ProtectionProduct[];
};

export type SolarAssumptions = {
  sunHours: number;
  floorCount: number;
  solarEfficiency: number;
  inverterEfficiency: number;
  batteryDod: number;
  reserveMargin: number;
  surgeMargin: number;
};

export type SolarPreferences = {
  inverterType: InverterType;
  panelManufacturer?: string;
  batteryManufacturer?: string;
  inverterManufacturer?: string;
  controllerManufacturer?: string;
};

export type QuoteLine = {
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type PvBlock = {
  index: number;
  panelCount: number;
  label: string;
  series: number;
  parallel: number;
  pvBlockCurrent: number;
  pvDesignCurrent: number;
  breakerSize: number;
  cableSize: string;
  cableLength: number;
};

export type ProtectionItem = {
  id: string;
  title: string;
  detail: string;
  price: number;
  quantity?: number;
  group: "Protection" | "Switching" | "Enclosure" | "Mounting" | "Cables" | "Consumables";
  checked: boolean;
};

export type AccessorySummary = {
  railCount: number;
  mountingAccessoriesQty: number;
  nailsQty: number;
  acCableSize: string;
  acCableLength: number;
  pvCableSize: string;
  pvCableLength: number;
  batteryCableSize: string;
  batteryCableLength: number;
  earthingCableSize: string;
  earthingCableLength: number;
  lugQty: number;
  tapeQty: number;
  zipTieQty: number;
};

export type SolarRecommendation = {
  connectedLoadW: number;
  diversifiedDayLoadW: number;
  diversifiedNightLoadW: number;
  dailyEnergyWh: number;
  continuousVaRequired: number;
  surgeVaRequired: number;
  selectedVoltage: 12 | 24 | 48;
  inverterType: InverterType;
  selectedInverter: InverterProduct;
  inverterCount: number;
  selectedBattery: BatteryProduct;
  batteryCount: number;
  selectedPanel: PanelProduct;
  panelCount: number;
  pvSeriesCount: number;
  pvParallelCount: number;
  selectedController?: ControllerProduct;
  controllerCount: number;
  pvProcessingBlockCount: number;
  hybridPvSetCount: number;
  pvBlocks: PvBlock[];
  pvConfigurationLabel: string;
  systemClass: "T1" | "T2" | "T3" | "T4" | "T5";
  protectionItems: ProtectionItem[];
  protectionCost: number;
  accessories: AccessorySummary;
  engineeringData: { label: string; value: string }[];
  summaryRows: { label: string; value: string }[];
  totalCost: number;
  quoteLines: QuoteLine[];
  warnings: string[];
};
