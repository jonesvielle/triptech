"use client";

import SolarCalculatorApp from "@/features/solar/SolarCalculatorApp";

const ManualSolarCalculatorPage = () => {
  return (
    <main className="min-h-screen bg-[#f4faf8] pt-20">
      <section className="px-4 pb-8 pt-8 md:px-10">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#117865]">
                TRI-P Tech Solar
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#082c3a] md:text-4xl">
                Advanced Solar Calculator
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4f6a72] md:text-base">
                Full manual load entry, brand selection, equipment sizing,
                protection items, engineering data, and quote summary.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/services/solar/calculator"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#bddbd4] px-5 text-sm font-semibold text-[#082c3a] transition hover:bg-white"
              >
                Guided estimate
              </a>
              <a
                href="/services/solar"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#082c3a] px-5 text-sm font-semibold text-white transition hover:bg-[#0f4152]"
              >
                Back to solar service
              </a>
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-3">
            {[
              ["1", "Enter loads", "Add appliances, wattage, timing, and use cycles."],
              ["2", "Review setup", "Check panels, battery, inverter, and protection."],
              ["3", "Request quote", "Generate a branded estimate for follow-up."],
            ].map(([step, title, body]) => (
              <div
                key={step}
                className="rounded-lg border border-[#d8e7e3] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#117865] text-sm font-bold text-white">
                    {step}
                  </span>
                  <strong className="text-[#082c3a]">{title}</strong>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4f6a72]">{body}</p>
              </div>
            ))}
          </div>

          <SolarCalculatorApp mode="manual" />
        </div>
      </section>
    </main>
  );
};

export default ManualSolarCalculatorPage;
