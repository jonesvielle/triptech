"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import SolarAdminApp from "@/features/solar/SolarAdminApp";
import type { SolarAdminSection } from "@/features/solar/SolarAdminApp";

type TeamRole = "Admin" | "Sales" | "Engineer" | "Viewer";
type AdminUser = {
  name: string;
  email: string;
  role: TeamRole;
};
type ChatConversationSummary = {
  status?: string;
};

const roleSections: Record<TeamRole, SolarAdminSection[]> = {
  Admin: ["dashboard", "requests", "messages", "team", "settings", "help", "news", "products", "protection", "accessories"],
  Sales: ["dashboard", "requests", "messages", "help"],
  Engineer: ["dashboard", "requests", "messages", "products", "protection", "accessories", "help", "news"],
  Viewer: ["dashboard", "requests", "messages", "help"],
};

const NativeSolarAdminMigrationPage = () => {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<SolarAdminSection>("dashboard");
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [waitingMessages, setWaitingMessages] = useState(0);
  const adminSections: Array<[SolarAdminSection, string, string]> = [
    ["dashboard", "Dashboard", "Charts and admin overview"],
    ["requests", "CRM", "Client request pipeline"],
    ["messages", "Messages", "Website chat inbox"],
    ["team", "Team", "Users, roles, and CRM access"],
    ["news", "News", "Posts and notices"],
    ["products", "Products", "Panels, batteries, inverters"],
    ["protection", "Protective equipment", "Breakers, SPDs, switchgear"],
    ["accessories", "Cables and mounting", "Cables, rails, consumables"],
    ["settings", "Settings", "Passwords and system controls"],
    ["help", "Help", "How the admin system works"],
  ];

  const allowedSections = isUnlocked && currentUser ? roleSections[currentUser.role] : [];
  const visibleSections = useMemo(
    () => adminSections.filter(([section]) => allowedSections.includes(section)),
    [allowedSections, adminSections]
  );

  const loadMessageBadge = async () => {
    if (!isUnlocked) return;
    try {
      const response = await fetch("/api/chat-conversations");
      const data = await response.json();
      const conversations = Array.isArray(data.conversations) ? data.conversations as ChatConversationSummary[] : [];
      setWaitingMessages(conversations.filter((chat) => chat.status === "waiting").length);
    } catch {
      setWaitingMessages(0);
    }
  };

  useEffect(() => {
    fetch("/api/admin-session")
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser({ name: data.user.name, email: data.user.email, role: data.user.role });
          setIsUnlocked(true);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (!allowedSections.includes(activeSection)) {
      setActiveSection(allowedSections[0] || "dashboard");
    }
  }, [activeSection, allowedSections, currentUser]);

  useEffect(() => {
    if (!isUnlocked) return;
    loadMessageBadge();
    const timer = window.setInterval(loadMessageBadge, 15000);
    return () => window.clearInterval(timer);
  }, [isUnlocked]);

  const unlockAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (response.ok && data.user) {
      setCurrentUser({ name: data.user.name, email: data.user.email, role: data.user.role });
      setIsUnlocked(true);
      setError("");
      return;
    }
    setError("Incorrect admin password.");
  };

  return (
    <main className="min-h-screen bg-[#f4faf8] text-[#082c3a]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-[#d8e7e3] bg-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="border-b border-[#d8e7e3] px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#117865]">
              TRI-P Tech
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#082c3a]">
              Solar admin
            </h2>
          </div>

          <div className="p-4">
            <label className="block">
              <span className="sr-only">Find</span>
              <input
                readOnly
                value=""
                placeholder="Find..."
                className="h-10 w-full rounded-md border border-[#d8e7e3] bg-[#fbfdfc] px-3 text-sm text-[#082c3a] outline-none"
              />
            </label>
          </div>

          <nav className="space-y-1 px-3 pb-6 text-sm font-semibold">
            {visibleSections.map(([section, label, detail]) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                className={`group relative flex w-full items-center justify-between rounded-md px-3 py-3 text-left transition ${
                  activeSection === section
                    ? "bg-[#eef7f4] text-[#117865] shadow-[0_10px_24px_rgba(17,120,101,0.12)]"
                    : "text-[#4f6a72] hover:bg-[#f4faf8] hover:text-[#082c3a] hover:shadow-[0_10px_24px_rgba(17,120,101,0.12)]"
                }`}
              >
                <span>
                  <span className="flex items-center gap-2">
                    <span>{label}</span>
                    {section === "messages" && waitingMessages ? (
                      <span className="rounded-full bg-[#f0a202] px-2 py-0.5 text-[10px] font-bold text-[#082c3a] shadow-[0_6px_14px_rgba(240,162,2,0.25)]">
                        {waitingMessages}
                      </span>
                    ) : null}
                  </span>
                  <small className="mt-1 hidden font-normal leading-5 text-[#60777f] group-hover:block">
                    {detail}
                  </small>
                </span>
                {activeSection === section ? <span className="h-2 w-2 rounded-full bg-[#117865]" /> : section === "messages" && waitingMessages ? <span className="h-2 w-2 rounded-full bg-[#f0a202]" /> : null}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="sticky top-0 z-20 border-b border-[#d8e7e3] bg-white/95 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#60777f]">
                <a href="/services/solar" className="font-semibold text-[#117865]">
                  Solar
                </a>
                <span>/</span>
                <span>Admin</span>
                <span>/</span>
                <strong className="text-[#082c3a]">triptech-prod</strong>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="/services/solar/calculator"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#bddbd4] px-4 text-sm font-semibold text-[#082c3a] transition hover:bg-[#f4faf8]"
                >
                  Open calculator
                </a>
                <a
                  href="/services/solar"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#117865] px-4 text-sm font-semibold text-white transition hover:bg-[#0d6757]"
                >
                  Solar service
                </a>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 md:px-8" id="overview">
            <div className="mb-4 rounded-lg border border-[#d8e7e3] bg-white px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#117865]">
                    TRI-P Tech Solar
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-[#082c3a]">
                    {isUnlocked ? adminSections.find(([section]) => section === activeSection)?.[1] || "Solar admin" : "Admin login"}
                  </h1>
                  {currentUser ? (
                    <p className="mt-1 text-sm text-[#60777f]">
                      Signed in as <strong>{currentUser.name}</strong> ({currentUser.role})
                    </p>
                  ) : null}
                </div>

                {activeSection === "dashboard" ? (
                <div className="grid min-w-[260px] grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="block text-[#60777f]">Status</span>
                    <strong className="mt-1 flex items-center gap-2 text-[#082c3a]">
                      <span className="h-2 w-2 rounded-full bg-[#117865]" />
                      Available
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[#60777f]">Plan</span>
                    <strong className="mt-1 block text-[#082c3a]">Free</strong>
                  </div>
                  <div>
                    <span className="block text-[#60777f]">Database</span>
                    <strong className="mt-1 block text-[#082c3a]">Neon</strong>
                  </div>
                </div>
                ) : null}
              </div>
            </div>

            <div className="mx-auto max-w-[1500px]">
              {isUnlocked ? (
                <SolarAdminApp activeSection={activeSection} onSectionChange={setActiveSection} currentUser={currentUser || undefined} />
              ) : (
                <form
                  onSubmit={unlockAdmin}
                  className="mx-auto max-w-md rounded-lg border border-[#cfe5df] bg-white p-6 shadow-sm"
                >
                  <label className="text-sm font-semibold text-[#082c3a]">
                    Admin password
                  </label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    className="mt-2 h-12 w-full rounded-lg border border-[#bddbd4] px-4 text-[#082c3a] outline-none focus:border-[#117865]"
                    placeholder="Enter admin password"
                  />
                  {error ? (
                    <p className="mt-3 text-sm font-semibold text-red-700">
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    className="mt-5 h-12 w-full rounded-full bg-[#117865] text-sm font-bold text-white transition hover:bg-[#0d6757]"
                  >
                    Log in to admin
                  </button>
                  <p className="mt-3 text-xs leading-5 text-[#60777f]">
                    Use a team password created under Team.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default NativeSolarAdminMigrationPage;
