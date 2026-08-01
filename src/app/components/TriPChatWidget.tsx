"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type ChatMessage = {
  id: number;
  sender: "visitor" | "staff" | "assistant" | "system";
  author: string;
  body: string;
  created_at: string;
};

type ChatConversation = {
  id: number;
  visitor_token: string;
  visitor_name: string;
  email: string;
  phone: string;
  page_url: string;
  status: "open" | "waiting" | "replied" | "closed";
};

const storageKey = "triptech_chat_conversation_id";
const tokenStorageKey = "triptech_chat_visitor_token";

export default function TriPChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitor, setVisitor] = useState({ name: "", phone: "", email: "" });
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdminPage = pathname?.startsWith("/services/solar/admin");

  const canStart = useMemo(() => draft.trim().length > 0, [draft]);

  useEffect(() => {
    if (isAdminPage) return;
    const savedId = window.localStorage.getItem(storageKey);
    const savedToken = window.localStorage.getItem(tokenStorageKey);
    if (!savedId || !savedToken) return;
    fetch(`/api/chat-conversations/${savedId}?token=${encodeURIComponent(savedToken)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.conversation) {
          setConversation(data.conversation);
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      })
      .catch(() => undefined);
  }, [isAdminPage]);

  useEffect(() => {
    if (!conversation || !isOpen) return;
    const loadConversation = () => {
      fetch(`/api/chat-conversations/${conversation.id}?token=${encodeURIComponent(conversation.visitor_token)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.conversation) {
            setConversation(data.conversation);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
          }
        })
        .catch(() => undefined);
    };
    const timer = window.setInterval(loadConversation, 7000);
    return () => window.clearInterval(timer);
  }, [conversation, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (isAdminPage) return null;

  const startConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canStart) return;
    setStatus("Sending...");
    try {
      const response = await fetch("/api/chat-conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...visitor,
          message: draft.trim(),
          page_url: window.location.href,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Message failed.");
      setConversation(data.conversation);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      window.localStorage.setItem(storageKey, String(data.conversation.id));
      window.localStorage.setItem(tokenStorageKey, String(data.conversation.visitor_token || ""));
      setDraft("");
      setStatus("");
    } catch {
      setStatus("Message could not be sent. Please try again.");
    }
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversation || !draft.trim()) return;
    setStatus("Sending...");
    try {
      const response = await fetch(`/api/chat-conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: draft.trim(),
          author: visitor.name || conversation.visitor_name || "Website visitor",
          visitor_token: conversation.visitor_token,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Message failed.");
      setConversation(data.conversation);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setDraft("");
      setStatus("");
    } catch {
      setStatus("Message could not be sent. Please try again.");
    }
  };

  const resetChat = () => {
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(tokenStorageKey);
    setConversation(null);
    setMessages([]);
    setDraft("");
    setStatus("");
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans text-[#082c3a] max-[560px]:bottom-3 max-[560px]:right-3">
        <section
          aria-hidden={!isOpen}
          className={`mb-3 w-[min(380px,calc(100vw-32px))] origin-bottom-right overflow-hidden rounded-2xl border border-[#cfe5df] bg-white shadow-[0_24px_70px_rgba(8,44,58,0.24)] transition-all duration-300 ease-out ${
            isOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-5 scale-[0.96] opacity-0"
          }`}
        >
          <div className="flex items-center justify-between bg-[#082c3a] px-4 py-3 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#68d8bd]">TRI-P Tech</p>
              <h2 className="text-base font-bold">Live support</h2>
            </div>
            <div className="flex items-center gap-2">
              {conversation ? (
                <button type="button" onClick={resetChat} className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/10">
                  New
                </button>
              ) : null}
              <button type="button" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full bg-white/10 text-lg font-bold hover:bg-white/20" aria-label="Close chat">
                ×
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto bg-[#f4faf8] p-4">
            {!conversation ? (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="text-lg font-bold">How can we help?</h3>
                <p className="mt-1 text-sm leading-6 text-[#60777f]">
                  Send us your question. Solar, CCTV, 3D printing, product enquiries, and support all come here.
                </p>
                <form onSubmit={startConversation} className="mt-4 grid gap-3">
                  <input
                    value={visitor.name}
                    onChange={(event) => setVisitor((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Name"
                    className="h-11 rounded-lg border border-[#bddbd4] px-3 text-sm outline-none focus:border-[#117865]"
                  />
                  <input
                    value={visitor.phone}
                    onChange={(event) => setVisitor((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Phone or WhatsApp"
                    className="h-11 rounded-lg border border-[#bddbd4] px-3 text-sm outline-none focus:border-[#117865]"
                  />
                  <input
                    value={visitor.email}
                    onChange={(event) => setVisitor((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email, optional"
                    className="h-11 rounded-lg border border-[#bddbd4] px-3 text-sm outline-none focus:border-[#117865]"
                  />
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="resize-none rounded-lg border border-[#bddbd4] px-3 py-2 text-sm outline-none focus:border-[#117865]"
                  />
                  <button type="submit" disabled={!canStart} className="h-11 rounded-full bg-[#117865] text-sm font-bold text-white transition hover:bg-[#0d6757] disabled:cursor-not-allowed disabled:bg-[#9bbab2]">
                    Start chat
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isVisitor = message.sender === "visitor";
                  return (
                    <div key={message.id} className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${isVisitor ? "bg-[#117865] text-white" : "bg-white text-[#082c3a]"}`}>
                        <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                        <small className={`mt-1 block text-[10px] ${isVisitor ? "text-white/75" : "text-[#60777f]"}`}>
                          {isVisitor ? "You" : "TRI-P TECH"}
                        </small>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {conversation ? (
            <form onSubmit={sendMessage} className="grid grid-cols-[1fr_auto] gap-2 border-t border-[#d8e7e3] bg-white p-3">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a reply..."
                className="h-11 rounded-full border border-[#bddbd4] px-4 text-sm outline-none focus:border-[#117865]"
              />
              <button type="submit" disabled={!draft.trim()} className="h-11 rounded-full bg-[#117865] px-5 text-sm font-bold text-white transition hover:bg-[#0d6757] disabled:bg-[#9bbab2]">
                Send
              </button>
            </form>
          ) : null}

          {status ? <p className="border-t border-[#edf4f2] bg-white px-4 py-2 text-xs font-semibold text-[#117865]">{status}</p> : null}
        </section>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className={`group pointer-events-auto flex h-14 items-center gap-3 rounded-full bg-[#117865] px-5 text-sm font-bold text-white shadow-[0_18px_45px_rgba(17,120,101,0.32)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#0d6757] max-[560px]:h-12 max-[560px]:w-12 max-[560px]:justify-center max-[560px]:gap-0 max-[560px]:p-0 ${
          isOpen ? "scale-[0.98] shadow-[0_12px_32px_rgba(8,44,58,0.20)]" : "scale-100"
        }`}
      >
        <span className={`grid h-8 w-8 place-items-center rounded-full bg-white text-[#117865] transition-transform duration-300 group-hover:scale-105 max-[560px]:h-7 max-[560px]:w-7 ${isOpen ? "rotate-45" : "rotate-0"}`}>
          {isOpen ? "×" : "•"}
        </span>
        <span className="transition-opacity duration-200 max-[560px]:hidden">{isOpen ? "Close chat" : "Chat with TRI-P"}</span>
      </button>
    </div>
  );
}
