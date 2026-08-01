import Image from "next/image";
import Link from "next/link";
import {
  IoArrowForward,
  IoCube,
  IoConstruct,
  IoLayers,
  IoPrint,
  IoStorefront,
} from "react-icons/io5";

const SHOP_URL = "https://shop.tri-p.tech";

const useCases = [
  {
    title: "Prototypes and product ideas",
    body: "Turn early concepts into physical samples for testing, pitching, and improvement.",
    icon: IoCube,
  },
  {
    title: "Custom parts and replacements",
    body: "Create practical plastic parts, brackets, housings, clips, covers, fittings, and small components.",
    icon: IoConstruct,
  },
  {
    title: "Models and presentation pieces",
    body: "Build clean visual models for design reviews, product displays, education, and demonstrations.",
    icon: IoLayers,
  },
];

const processSteps = [
  "Send your sketch, file, sample, or product idea.",
  "We review size, material, strength, finish, and use case.",
  "You receive a quote and production recommendation.",
  "We print, inspect, finish, and prepare for pickup or delivery.",
];

export default function ThreeDPrintingPage() {
  return (
    <main className="min-h-screen bg-[#f4faf8] pt-24 text-[#082c3a]">
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-10 md:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#117865]">
            TRI-P Tech Manufacturing
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            3D Printing and Product Prototyping
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#4f6a72]">
            From rough ideas to usable parts, TRI-P Tech helps individuals,
            creators, engineers, and businesses produce accurate custom prints,
            prototypes, models, and replacement components.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#117865] px-6 text-sm font-bold text-white transition hover:bg-[#0d6757]"
            >
              Request a custom print quote
              <IoArrowForward className="ml-2" />
            </Link>
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#bddbd4] bg-white px-6 text-sm font-bold text-[#082c3a] transition hover:bg-[#eef8f5]"
            >
              Shop ready-made products
              <IoStorefront className="ml-2" />
            </a>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#d8e7e3] bg-[#082c3a] shadow-sm">
          <Image
            src="/images/printer.jpg"
            alt="3D printer producing a custom part"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#082c3a]/75 via-[#082c3a]/25 to-[#117865]/60" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
            <div className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur">
              <IoPrint className="mr-2" />
              Custom printing
            </div>
            <h2 className="mt-4 max-w-lg text-3xl font-extrabold">
              Functional parts, clean models, and fast prototype support.
            </h2>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8e7e3] bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 md:grid-cols-3 md:px-10">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-5 transition hover:-translate-y-0.5 hover:border-[#117865] hover:shadow-[0_16px_34px_rgba(17,120,101,0.12)]">
                <Icon className="text-3xl text-[#117865]" />
                <h3 className="mt-4 text-lg font-bold text-[#082c3a]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#60777f]">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[0.85fr_1.15fr] md:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#117865]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">Simple from idea to finished part</h2>
          <p className="mt-4 text-sm leading-7 text-[#60777f]">
            You do not need to have a perfect CAD file before speaking with us.
            We can review sketches, measurements, old parts, rough samples, or
            finished 3D files.
          </p>
        </div>
        <div className="grid gap-3">
          {processSteps.map((step, index) => (
            <div key={step} className="flex gap-4 rounded-lg border border-[#d8e7e3] bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#117865] text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="pt-1 text-sm font-semibold leading-6 text-[#082c3a]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#082c3a] px-5 py-12 text-white md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8bd7c8]">
              Need a custom print?
            </p>
            <h2 className="mt-3 text-3xl font-extrabold">Send the details and let us review it.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#082c3a] transition hover:bg-[#e9f5f2]"
            >
              Request quote
            </Link>
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Visit shop
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
