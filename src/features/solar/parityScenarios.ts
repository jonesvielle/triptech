import type { Catalogue, InverterType, LoadEntry, SolarAssumptions, SolarPreferences, SolarRecommendation } from "./types";
import { defaultAssumptions, defaultCatalogue } from "./defaults";
import { calculateSolarRecommendation } from "./engine";

export type SolarParityScenario = {
  id: string;
  name: string;
  inverterType: InverterType;
  assumptions: SolarAssumptions;
  loads: LoadEntry[];
  notes: string;
  preferences?: Partial<SolarPreferences>;
  expect: (recommendation: SolarRecommendation | null) => string[];
};

const load = (
  id: string,
  appliance: string,
  watts: number,
  dayHours: number,
  nightHours: number,
  cyclePercent = 100,
  quantity = 1
): LoadEntry => ({
  id,
  appliance,
  watts,
  dayHours,
  nightHours,
  cyclePercent,
  quantity,
});

export const solarParityScenarios: SolarParityScenario[] = [
  {
    id: "no-load",
    name: "No active load",
    inverterType: "hybrid",
    assumptions: defaultAssumptions,
    loads: [],
    notes: "Must show no equipment selected and no forced panel/battery.",
    expect: (recommendation) => (recommendation === null ? [] : ["No-load scenario should not force equipment."]),
  },
  {
    id: "small-lighting",
    name: "Small bulbs and fan load",
    inverterType: "hybrid",
    assumptions: defaultAssumptions,
    loads: [
      load("bulb-1", "LED bulb", 12, 5, 5, 100, 6),
      load("fan-1", "Standing fan", 75, 3, 6),
    ],
    notes: "Must allow small inverter/battery options where practical.",
    expect: (recommendation) => {
      if (!recommendation) return ["Small lighting scenario should produce a recommendation."];
      const errors: string[] = [];
      if (recommendation.selectedVoltage !== 12) errors.push("Small lighting should stay on a 12V system.");
      if (recommendation.selectedInverter.kva > 1) errors.push("Small lighting should allow a small inverter below or equal to 1kVA.");
      return errors;
    },
  },
  {
    id: "fridge-tv-fan",
    name: "Fridge, TV, and fan",
    inverterType: "non-hybrid",
    assumptions: defaultAssumptions,
    loads: [
      load("tv-1", "Small television", 60, 3, 4),
      load("fan-1", "Standing fan", 75, 3, 8),
      load("fridge-1", "Small fridge", 150, 7, 10, 40),
    ],
    notes: "Must use refrigeration full-run/cycle logic and practical inverter surge sizing.",
    expect: (recommendation) => {
      if (!recommendation) return ["Fridge, TV, and fan scenario should produce a recommendation."];
      const errors: string[] = [];
      if (recommendation.inverterType !== "non-hybrid") errors.push("Fridge scenario should remain non-hybrid.");
      if (recommendation.selectedVoltage < 24) errors.push("Fridge scenario should not stay on a 12V system.");
      if (recommendation.controllerCount < 1) errors.push("Non-hybrid fridge scenario should include a charge controller.");
      return errors;
    },
  },
  {
    id: "two-hp-ac",
    name: "2HP AC for 12 hours",
    inverterType: "hybrid",
    assumptions: defaultAssumptions,
    loads: [load("ac-1", "2 HP AC", 2200, 3, 12, 60)],
    notes: "Must respect AC full-run period, avoid aggressive inverter jumps, and select 48V.",
    expect: (recommendation) => {
      if (!recommendation) return ["2HP AC scenario should produce a recommendation."];
      const errors: string[] = [];
      if (recommendation.selectedVoltage !== 48) errors.push("2HP AC scenario should select 48V.");
      if (recommendation.continuousVaRequired > recommendation.selectedInverter.va * recommendation.inverterCount) {
        errors.push("2HP AC continuous VA should be covered by the selected inverter bank.");
      }
      if (recommendation.surgeVaRequired > recommendation.selectedInverter.surgeVa * recommendation.inverterCount) {
        errors.push("2HP AC surge VA should be covered by the selected inverter bank.");
      }
      return errors;
    },
  },
  {
    id: "large-t5",
    name: "Large T5-style mixed load",
    inverterType: "non-hybrid",
    assumptions: { ...defaultAssumptions, floorCount: 3 },
    loads: [
      load("ac-1", "2 HP AC", 2200, 8, 8, 60, 4),
      load("pump-1", "Borehole pump", 1500, 2, 0, 30, 2),
      load("office-1", "Desktop computer", 250, 8, 0, 100, 10),
      load("light-1", "LED bulb", 12, 6, 8, 100, 30),
    ],
    notes: "Must split PV blocks correctly, count DC breakers by controller count, and include T5 combiner logic.",
    expect: (recommendation) => {
      if (!recommendation) return ["Large T5 scenario should produce a recommendation."];
      const errors: string[] = [];
      if (recommendation.systemClass !== "T5") errors.push("Large mixed load should classify as T5.");
      if (recommendation.controllerCount !== recommendation.pvProcessingBlockCount) errors.push("Non-hybrid PV block count should match charge controller count.");
      if (recommendation.pvBlocks.some((block) => block.series > 4)) errors.push("Non-hybrid PV blocks must not exceed 4 panels in series.");
      if (recommendation.pvBlocks.some((block) => block.pvDesignCurrent > 125)) errors.push("PV block current should be split until each block fits 125A or below.");
      if (!recommendation.protectionItems.some((item) => item.id === "combiner-box")) errors.push("T5 should include a battery combiner box.");
      return errors;
    },
  },
  {
    id: "strict-panel-brand",
    name: "Selected panel brand must not silently fallback",
    inverterType: "hybrid",
    assumptions: defaultAssumptions,
    loads: [load("bulb-1", "LED bulb", 12, 5, 5, 100, 2)],
    preferences: { panelManufacturer: "Unavailable panel brand" },
    notes: "Must return no recommendation when a selected panel brand has no usable panel.",
    expect: (recommendation) => (recommendation === null ? [] : ["Selected panel brand should not fallback to another manufacturer."]),
  },
];

export function runSolarParityScenarios(catalogue: Catalogue = defaultCatalogue) {
  return solarParityScenarios.map((scenario) => {
    const preferences: SolarPreferences = {
      inverterType: scenario.inverterType,
      ...scenario.preferences,
    };
    const recommendation = calculateSolarRecommendation(scenario.loads, scenario.assumptions, preferences, catalogue);
    return {
      id: scenario.id,
      name: scenario.name,
      passed: scenario.expect(recommendation).length === 0,
      errors: scenario.expect(recommendation),
    };
  });
}
