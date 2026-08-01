"use client";

import { FormEvent, useState } from "react";

const emptyForm = {
  clientName: "",
  email: "",
  phone: "",
  location: "",
  propertyType: "Home",
  cameraCount: 4,
  entryPoints: 1,
  exitPoints: 1,
  remoteViewing: "Yes",
  siteNote: "",
};

export default function CctvQuoteForm() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const updateForm = (key: keyof typeof emptyForm, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.clientName.trim() || !form.phone.trim() || !form.location.trim()) {
      setStatus("Please enter your name, phone, and location.");
      return;
    }

    setIsSending(true);
    setStatus("Sending CCTV request...");
    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: form.clientName,
          email: form.email,
          phone: form.phone,
          location: form.location,
          site_note: form.siteNote,
          total_cost: 0,
          daily_energy_wh: 0,
          system_voltage: 0,
          quote: {
            requestType: "CCTV",
            propertyType: form.propertyType,
            cameraCount: Number(form.cameraCount || 0),
            entryPoints: Number(form.entryPoints || 0),
            exitPoints: Number(form.exitPoints || 0),
            remoteViewing: form.remoteViewing,
            siteNote: form.siteNote,
            recommendation: {
              quoteLines: [
                {
                  name: "CCTV request",
                  description: `${form.cameraCount} camera(s), ${form.entryPoints} entry point(s), ${form.exitPoints} exit point(s), remote viewing: ${form.remoteViewing}`,
                  quantity: Number(form.cameraCount || 0),
                  rate: 0,
                  amount: 0,
                },
              ],
            },
          },
        }),
      });
      if (!response.ok) throw new Error("Request failed.");
      setForm(emptyForm);
      setStatus("CCTV request received. TRI-P Tech will follow up.");
    } catch {
      setStatus("Could not send request. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form id="cctv-quote" onSubmit={submitRequest} className="rounded-lg border border-[#d8e7e3] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-2 border-b border-[#edf4f2] pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#117865]">
          CCTV quote
        </p>
        <h2 className="text-2xl font-extrabold text-[#082c3a]">
          Tell us the camera coverage you need
        </h2>
        <p className="text-sm leading-6 text-[#60777f]">
          This helps TRI-P Tech estimate the scope before a site confirmation.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-xs font-bold text-[#4f6a72]">
          Name
          <input
            value={form.clientName}
            onChange={(event) => updateForm("clientName", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
            placeholder="Your name"
          />
        </label>
        <label className="text-xs font-bold text-[#4f6a72]">
          Phone/WhatsApp
          <input
            value={form.phone}
            onChange={(event) => updateForm("phone", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
            placeholder="Phone number"
          />
        </label>
        <label className="text-xs font-bold text-[#4f6a72]">
          Email
          <input
            value={form.email}
            onChange={(event) => updateForm("email", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
            placeholder="Optional"
          />
        </label>
        <label className="text-xs font-bold text-[#4f6a72]">
          Location
          <input
            value={form.location}
            onChange={(event) => updateForm("location", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
            placeholder="City / state"
          />
        </label>
        <label className="text-xs font-bold text-[#4f6a72]">
          Property type
          <select
            value={form.propertyType}
            onChange={(event) => updateForm("propertyType", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
          >
            <option>Home</option>
            <option>Office</option>
            <option>Shop</option>
            <option>School</option>
            <option>Warehouse</option>
            <option>Estate</option>
          </select>
        </label>
        <label className="text-xs font-bold text-[#4f6a72]">
          Remote viewing
          <select
            value={form.remoteViewing}
            onChange={(event) => updateForm("remoteViewing", event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
          >
            <option>Yes</option>
            <option>No</option>
            <option>Not sure</option>
          </select>
        </label>
        <label className="text-xs font-bold text-[#4f6a72]">
          Number of cameras
          <input
            type="number"
            min={1}
            value={form.cameraCount}
            onChange={(event) => updateForm("cameraCount", Math.max(1, Number(event.target.value || 1)))}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
          />
        </label>
        <label className="text-xs font-bold text-[#4f6a72]">
          Entry points
          <input
            type="number"
            min={0}
            value={form.entryPoints}
            onChange={(event) => updateForm("entryPoints", Math.max(0, Number(event.target.value || 0)))}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
          />
        </label>
        <label className="text-xs font-bold text-[#4f6a72]">
          Exit points
          <input
            type="number"
            min={0}
            value={form.exitPoints}
            onChange={(event) => updateForm("exitPoints", Math.max(0, Number(event.target.value || 0)))}
            className="mt-1 h-11 w-full rounded-md border border-[#bddbd4] px-3 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
          />
        </label>
        <label className="text-xs font-bold text-[#4f6a72] md:col-span-2">
          Site note
          <textarea
            value={form.siteNote}
            onChange={(event) => updateForm("siteNote", event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-[#bddbd4] px-3 py-2 text-sm text-[#082c3a] outline-none focus:border-[#117865]"
            placeholder="Tell us about blind spots, recorder location, special areas, or existing cables."
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSending}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#117865] px-6 text-sm font-bold text-white transition hover:bg-[#0d6757] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Request CCTV quote"}
        </button>
        {status ? <p className="text-sm font-semibold text-[#117865]">{status}</p> : null}
      </div>
    </form>
  );
}
