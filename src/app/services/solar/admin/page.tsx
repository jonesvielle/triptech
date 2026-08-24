"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  IoBarChartOutline,
  IoChatbubblesOutline,
  IoClose,
  IoConstructOutline,
  IoFileTrayFullOutline,
  IoHelpCircleOutline,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoReceiptOutline,
  IoSettingsOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
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
const adminSectionIcons: Record<SolarAdminSection, IconType> = {
  dashboard: IoBarChartOutline,
  requests: IoReceiptOutline,
  messages: IoChatbubblesOutline,
  team: IoPeopleOutline,
  news: IoNewspaperOutline,
  products: IoFileTrayFullOutline,
  protection: IoShieldCheckmarkOutline,
  accessories: IoConstructOutline,
  settings: IoSettingsOutline,
  help: IoHelpCircleOutline,
};
const NativeSolarAdminMigrationPage = () => {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<SolarAdminSection>("dashboard");
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [waitingMessages, setWaitingMessages] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAdminSearch, setMobileAdminSearch] = useState("");
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
  const primaryMobileSectionIds: SolarAdminSection[] = ["dashboard", "requests", "messages"];
  const primaryMobileSections = visibleSections.filter(([section]) => primaryMobileSectionIds.includes(section));
  const moreMobileSections = visibleSections.filter(([section]) => !primaryMobileSectionIds.includes(section));
  const mobileAdminSearchTerm = mobileAdminSearch.trim().toLowerCase();
  const filteredMoreMobileSections = moreMobileSections.filter(([, label, detail]) => {
    if (!mobileAdminSearchTerm) return true;
    return `${label} ${detail}`.toLowerCase().includes(mobileAdminSearchTerm);
  });
  const goToAdminSection = (section: SolarAdminSection) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

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
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[260px_1fr]">
        <aside className="hidden min-w-0 border-[#d8e7e3] bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto lg:border-r">
          <div className="border-b border-[#d8e7e3] px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#117865]">
              TRI-P Tech
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#082c3a]">
              Solar admin
            </h2>
          </div>
            {currentUser ? (
              <p className="mt-2 inline-flex max-w-full items-center rounded-full border border-[#cfe5df] bg-[#f4faf8] px-3 py-1 text-xs font-semibold text-[#117865]">
                <span className="truncate">{currentUser.name}</span>
                <span className="mx-1 text-[#8aa39c]">/</span>
                <span>{currentUser.role}</span>
              </p>
            ) : null}

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
                  <small className="mt-1 hidden font-normal leading-5 text-[#60777f] lg:group-hover:block">
                    {detail}
                  </small>
                </span>
                {activeSection === section ? <span className="h-2 w-2 rounded-full bg-[#117865]" /> : section === "messages" && waitingMessages ? <span className="h-2 w-2 rounded-full bg-[#f0a202]" /> : null}
              </button>
            ))}
          </nav>
        </aside>

        {isUnlocked ? (
          <div
            className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? "" : "pointer-events-none"}`}
            aria-hidden={!isMobileMenuOpen}
          >
            <button
              type="button"
              aria-label="Close admin tools"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`absolute inset-0 bg-[#082c3a]/45 backdrop-blur-sm transition-opacity ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
            />
            <aside
              className={`absolute inset-x-3 bottom-3 max-h-[78vh] overflow-hidden rounded-[28px] border border-[#cfe5df] bg-white shadow-[0_24px_70px_rgba(8,44,58,0.24)] transition duration-300 ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#d8e7e3] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#117865]">
                    More admin tools
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-[#082c3a]">
                    Choose a section
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#bddbd4] text-[#082c3a] transition hover:border-[#117865] hover:bg-[#eef7f4]"
                  aria-label="Close admin tools"
                >
                  <IoClose className="text-xl" />
                </button>
              </div>

              <div className="border-b border-[#e5f0ed] p-4">
                <label className="block">
                  <span className="sr-only">Find admin section</span>
                  <input
                    value={mobileAdminSearch}
                    onChange={(event) => setMobileAdminSearch(event.target.value)}
                    placeholder="Find admin tool..."
                    className="h-12 w-full rounded-2xl border border-[#d8e7e3] bg-[#fbfdfc] px-4 text-sm font-semibold text-[#082c3a] outline-none transition focus:border-[#117865] focus:bg-white"
                  />
                </label>
              </div>

              <nav className="grid max-h-[48vh] grid-cols-1 gap-3 overflow-y-auto p-4 text-sm sm:grid-cols-2" aria-label="More admin sections">
                {filteredMoreMobileSections.length ? filteredMoreMobileSections.map(([section, label, detail]) => {
                  const SectionIcon = adminSectionIcons[section];
                  const isActive = activeSection === section;
                  return (
                    <button
                      key={section}
                      type="button"
                      onClick={() => goToAdminSection(section)}
                      className={`group flex min-h-[86px] items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                        isActive
                          ? "border-[#117865] bg-[#eef7f4] text-[#117865] shadow-[0_14px_28px_rgba(17,120,101,0.16)]"
                          : "border-[#d8e7e3] bg-white text-[#082c3a] hover:border-[#117865] hover:bg-[#f4faf8] hover:shadow-[0_12px_24px_rgba(17,120,101,0.12)]"
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${isActive ? "bg-[#117865] text-white" : "bg-[#e6f3ef] text-[#117865] group-hover:bg-white"}`}>
                        <SectionIcon className="text-xl" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <strong className="text-[15px] leading-tight">{label}</strong>
                          {isActive ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#117865]" /> : null}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#60777f]">{detail}</span>
                      </span>
                    </button>
                  );
                }) : (
                  <p className="rounded-2xl border border-dashed border-[#bddbd4] bg-[#f4faf8] p-4 text-sm font-semibold text-[#60777f]">
                    No matching admin tools.
                  </p>
                )}
              </nav>
            </aside>
          </div>
        ) : null}
        <section className="min-w-0 overflow-x-hidden pb-24 lg:pb-0">

          <div className="min-w-0 px-0 py-0 sm:px-4 sm:py-4 md:px-8" id="overview">

            {isUnlocked ? (
              <div className="sticky top-0 z-30 border-b border-[#d8e7e3] bg-white/96 px-4 py-3 shadow-[0_10px_24px_rgba(8,44,58,0.08)] backdrop-blur lg:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#00d97b] bg-white p-1 shadow-sm">
                      <img src="/images/logo/Logo C.png" alt="TRI-P Tech" className="block h-full w-full object-contain" />
                    </span>
                    <span className="min-w-0 leading-none">
                      <strong className="block truncate text-sm font-black uppercase tracking-[0.08em] text-[#082c3a]">TRI-P Admin</strong>
                      <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-[0.08em] text-[#117865]">
                        {currentUser?.name || "Admin user"} / {currentUser?.role || "Admin"}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#bddbd4] bg-white text-[#117865] shadow-sm transition active:scale-95"
                    aria-label="Open admin tools"
                  >
                    <span className="grid gap-1">
                      <span className="block h-0.5 w-4 rounded-full bg-current" />
                      <span className="block h-0.5 w-4 rounded-full bg-current" />
                      <span className="block h-0.5 w-4 rounded-full bg-current" />
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mx-auto min-w-0 max-w-none lg:max-w-[1500px]">
              {isUnlocked ? (
                <SolarAdminApp activeSection={activeSection} onSectionChange={setActiveSection} currentUser={currentUser || undefined} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
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

        {isUnlocked ? (
          <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[#cfe5df] bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1 shadow-[0_-14px_32px_rgba(8,44,58,0.12)] backdrop-blur lg:hidden"
            aria-label="Mobile admin navigation"
          >
            <div className="mx-auto grid max-w-md grid-cols-3 gap-1 rounded-[18px] border border-[#d8e7e3] bg-[#f8fcfb] p-1">
              {primaryMobileSections.map(([section, label]) => {
                const isActive = activeSection === section;
                const SectionIcon = adminSectionIcons[section];
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => goToAdminSection(section)}
                    className={`relative flex min-h-[42px] flex-col items-center justify-center gap-0.5 rounded-[13px] px-2 text-[9px] font-bold leading-none transition active:scale-[0.97] ${
                      isActive
                        ? "bg-[#117865] text-white shadow-[0_12px_24px_rgba(17,120,101,0.2)]"
                        : "text-[#4f6a72] hover:bg-[#eef7f4] hover:text-[#082c3a]"
                    }`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-lg ${isActive ? "bg-white/20 text-white" : "bg-[#e6f3ef] text-[#117865]"}`}>
                      <SectionIcon className="text-sm" />
                    </span>
                    <span>{label}</span>
                    {section === "messages" && waitingMessages ? (
                      <span className="absolute right-1.5 top-0 rounded-full bg-[#f0a202] px-1.5 py-0.5 text-[10px] font-black text-[#082c3a]">
                        {waitingMessages}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}
      </div>
    </main>
  );
};

export default NativeSolarAdminMigrationPage;











