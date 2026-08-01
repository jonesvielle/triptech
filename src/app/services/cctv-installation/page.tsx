import Image from "next/image";
import Link from "next/link";
import {
  IoArrowForward,
  IoCamera,
  IoCloudDone,
  IoEye,
  IoHome,
  IoShieldCheckmark,
} from "react-icons/io5";
import CctvQuoteForm from "./CctvQuoteForm";

const systems = [
  {
    title: "Homes and estates",
    body: "Practical camera placement for entrances, compounds, gates, corridors, and blind spots.",
    icon: IoHome,
  },
  {
    title: "Shops and offices",
    body: "Clear coverage for counters, shelves, work areas, access points, and customer zones.",
    icon: IoEye,
  },
  {
    title: "Remote monitoring",
    body: "Mobile viewing, recorder setup, storage planning, and access control for trusted users.",
    icon: IoCloudDone,
  },
];

const deliverables = [
  "Camera position planning and coverage review",
  "DVR/NVR setup with storage recommendation",
  "Cable routing, mounting, and neat installation",
  "Mobile viewing setup for approved users",
  "Basic user handover and after-installation support",
];

export default function CctvInstallationPage() {
  return (
    <main className="min-h-screen bg-[#f4faf8] pt-24 text-[#082c3a]">
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1fr_1fr] md:px-10 md:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#117865]">
            TRI-P Tech Security
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            CCTV Installation and Monitoring Setup
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#4f6a72]">
            We design and install practical CCTV systems for homes, shops,
            offices, schools, churches, warehouses, and commercial facilities,
            with clear camera placement and reliable monitoring access.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#cctv-quote"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#117865] px-6 text-sm font-bold text-white transition hover:bg-[#0d6757]"
            >
              Request CCTV quote
              <IoArrowForward className="ml-2" />
            </Link>
            <a
              href="https://shop.tri-p.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#bddbd4] bg-white px-6 text-sm font-bold text-[#082c3a] transition hover:bg-[#eef8f5]"
            >
              Shop security products
            </a>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#d8e7e3] bg-[#082c3a] shadow-sm">
          <Image
            src="/images/cctv-installation-with-young-asian-technicians-installation-such-as-wifi-ip-camera-concept-wireless-ip-camera_140555-611.jpg"
            alt="Technician installing CCTV camera"
            fill
            className="object-cover opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#082c3a]/80 via-[#082c3a]/30 to-[#117865]/55" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
            <div className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur">
              <IoCamera className="mr-2" />
              Security coverage
            </div>
            <h2 className="mt-4 max-w-lg text-3xl font-extrabold">
              CCTV systems planned around real blind spots, not guesswork.
            </h2>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8e7e3] bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 md:grid-cols-3 md:px-10">
          {systems.map((item) => {
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

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#117865]">
            Installation scope
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">What a proper CCTV job should include</h2>
          <p className="mt-4 text-sm leading-7 text-[#60777f]">
            A CCTV system is only useful when the camera angles, storage,
            cabling, recorder, and mobile access are planned together. We help
            you choose the right setup for the space and the risk.
          </p>
        </div>
        <div className="grid gap-3">
          {deliverables.map((item) => (
            <div key={item} className="flex gap-4 rounded-lg border border-[#d8e7e3] bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#117865] text-white">
                <IoShieldCheckmark />
              </span>
              <p className="pt-1 text-sm font-semibold leading-6 text-[#082c3a]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-12 md:px-10">
        <CctvQuoteForm />
      </section>

      <section className="bg-[#082c3a] px-5 py-12 text-white md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8bd7c8]">
              Need a security review?
            </p>
            <h2 className="mt-3 text-3xl font-extrabold">Let us plan the right camera coverage.</h2>
          </div>
          <Link
            href="#cctv-quote"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#082c3a] transition hover:bg-[#e9f5f2]"
          >
            Request CCTV quote
          </Link>
        </div>
      </section>
    </main>
  );
}
