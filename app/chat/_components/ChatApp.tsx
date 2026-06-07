"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { signOut } from "@/lib/auth-client";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

type ChatUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type ChatAppProps = {
  user: ChatUser;
};

type Conversation = {
  id: string;
  title: string;
  preview: string;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: "c-1",
    title: "Draft NDA for new vendor",
    preview: "Mutual NDA, Delaware law…",
    messages: [
      {
        id: "m-1-1",
        role: "user",
        content:
          "Help me draft a mutual NDA for a new vendor relationship based in California.",
      },
      {
        id: "m-1-2",
        role: "assistant",
        content:
          "Happy to help. A few quick questions before I draft: (1) governing jurisdiction — California or Delaware? (2) term of the confidentiality obligation (typical is 2–5 years)? (3) are there specific carve-outs you need (e.g., independently developed, publicly available)?",
      },
      {
        id: "m-1-3",
        role: "user",
        content: "California, 3 years, standard carve-outs are fine.",
      },
      {
        id: "m-1-4",
        role: "assistant",
        content:
          "Got it. I will draft a mutual NDA with a 3-year confidentiality term, California governing law, and the standard four carve-outs (publicly known, independently developed, lawfully obtained, required by law). Sharing the first draft in a moment.",
      },
    ],
  },
  {
    id: "c-2",
    title: "Review merger clause",
    preview: "Material adverse change…",
    messages: [
      {
        id: "m-2-1",
        role: "user",
        content:
          "Can you review the MAC clause in this merger agreement for any red flags?",
      },
      {
        id: "m-2-2",
        role: "assistant",
        content:
          "Send the clause and I will walk through the definition, the carve-outs, and the disproportionate-impact qualifier. I will flag anything that could shift risk to your side of the deal.",
      },
    ],
  },
  {
    id: "c-3",
    title: "Compare vendor agreements",
    preview: "Settlement, indemnity…",
    messages: [
      {
        id: "m-3-1",
        role: "user",
        content: "What is the difference between a void and voidable contract?",
      },
      {
        id: "m-3-2",
        role: "assistant",
        content:
          "A void contract is treated as if it never existed — no enforceable obligations on either side, and either party can raise the issue. A voidable contract is valid until the injured party elects to rescind (for example, contracts entered into under duress, fraud, or with a minor). Once rescinded, it is treated as void.",
      },
    ],
  },
  {
    id: "c-4",
    title: "Trademark availability",
    preview: "USPTO search, classes…",
    messages: [
      {
        id: "m-4-1",
        role: "user",
        content: "Walk me through the steps to register a trademark in the US.",
      },
      {
        id: "m-4-2",
        role: "assistant",
        content:
          "The high-level flow: (1) search the USPTO database for conflicts in your class, (2) file an intent-to-use or use-in-commerce application, (3) respond to any office actions, (4) publish for opposition, (5) register. Want me to draft the search query for a specific mark?",
      },
    ],
  },
];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ChatApp({ user }: ChatAppProps) {
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations,
  );
  const [activeId, setActiveId] = useState<string>(initialConversations[0].id);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, isThinking]);

  function selectConversation(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  function startNewChat() {
    const conv: Conversation = {
      id: newId("c"),
      title: "New conversation",
      preview: "Just started",
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setDraft("");
    setSidebarOpen(false);
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMsg: Message = { id: newId("u"), role: "user", content: trimmed };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title:
                c.messages.length === 0
                  ? trimmed.slice(0, 48) + (trimmed.length > 48 ? "…" : "")
                  : c.title,
              preview: trimmed,
              messages: [...c.messages, userMsg],
            }
          : c,
      ),
    );
    setDraft("");
    setIsThinking(true);

    setTimeout(() => {
      const reply: Message = {
        id: newId("a"),
        role: "assistant",
        content:
          "Thanks — I have logged that. I will prepare a draft response and surface the relevant clauses, risks, and next steps shortly.",
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, reply] }
            : c,
        ),
      );
      setIsThinking(false);
    }, 700);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(draft);
    }
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/signin";
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-black transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <Link
            href="/"
            aria-label="Lawbite home"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="relative inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white text-black"
            >
              <span className="absolute inset-0.5 rounded-full border border-black/30" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-black" />
            </span>
            <span>Lawbite</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Close conversations"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={startNewChat}
            className="group flex w-full items-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.01]"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>New chat</span>
          </button>
        </div>

        <nav
          aria-label="Conversations"
          className="mt-4 flex-1 overflow-y-auto px-2 pb-4"
        >
          <ul className="space-y-1 text-sm">
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => selectConversation(conv.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-300 ${
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span className="line-clamp-1 text-[13px] font-medium">
                      {conv.title}
                    </span>
                    <span className="line-clamp-1 text-[11px] text-white/40">
                      {conv.preview}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full border border-white/15 object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs text-white/60">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate text-xs text-white/50">
                {user.name || user.email}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Sign out"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Open conversations"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                {active?.title ?? "New conversation"}
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                Lawbite Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              aria-hidden
              className="hidden h-2 w-2 rounded-full bg-emerald-400 sm:block"
            />
            <span className="hidden text-xs text-white/50 sm:inline">Online</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-8">
          {active && active.messages.length > 0 ? (
            <ul className="mx-auto flex max-w-3xl flex-col gap-6">
              {active.messages.map((message) => (
                <li
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-[15px] ${
                      message.role === "user"
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/[0.03] text-white/85"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </li>
              ))}
              {isThinking ? (
                <li className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                    <span className="flex gap-1" aria-hidden>
                      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-white/60" />
                      <span
                        className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-white/60"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-white/60"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </span>
                    <span>Thinking…</span>
                  </div>
                </li>
              ) : null}
              <div ref={messagesEndRef} />
            </ul>
          ) : (
            <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center text-center">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white/40">
                New conversation
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                How can I help with your legal work today?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                Draft documents, review clauses, or ask questions about a
                matter. I will keep the context of this conversation for the
                duration of the session.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-black/40 px-5 py-4 backdrop-blur-md sm:px-8">
          <form
            onSubmit={onSubmit}
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition-colors duration-300 focus-within:border-white/30"
          >
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <textarea
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message Lawbite…"
              rows={1}
              className="min-h-[40px] max-h-40 w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-white placeholder:text-white/35 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isThinking}
              aria-label="Send message"
              className="btn-shine group relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-black transition-transform duration-300 hover:scale-[1.05] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-[11px] text-white/35">
            Press <kbd className="rounded border border-white/15 px-1">Enter</kbd>{" "}
            to send,{" "}
            <kbd className="rounded border border-white/15 px-1">Shift</kbd>+
            <kbd className="rounded border border-white/15 px-1">Enter</kbd> for
            a new line.
          </p>
        </div>
      </main>
    </div>
  );
}
