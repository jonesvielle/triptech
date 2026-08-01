"use client";

import SolarCalculatorApp from "@/features/solar/SolarCalculatorApp";

const SolarCalculatorPage = () => {
  return (
    <main className="min-h-screen bg-[#f4faf8] pt-0 lg:pt-32">
      <section className="px-3 pb-8 pt-3 lg:px-10 lg:pt-6">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-4 hidden flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#117865]">
                TRI-P Tech Solar
              </p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight text-[#082c3a] sm:text-4xl md:text-6xl">
                Practical Solar Estimate
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4f6a72] sm:text-base md:text-lg">
                A simple step-by-step experience for clients who want a solar
                estimate without technical distractions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <a
                href="/services/solar"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#bddbd4] px-3 text-center text-xs font-semibold text-[#082c3a] transition hover:bg-white sm:h-11 sm:px-5 sm:text-sm"
              >
                Back to solar service
              </a>
              <a
                href="/services/solar/calculator/manual"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#082c3a] px-3 text-center text-xs font-semibold text-white transition hover:bg-[#0f4152] sm:h-11 sm:px-5 sm:text-sm"
              >
                Advanced calculator
              </a>
            </div>
          </div>

          <SolarCalculatorApp mode="wizard" />
        </div>
      </section>
    </main>
  );
};

export default SolarCalculatorPage;
