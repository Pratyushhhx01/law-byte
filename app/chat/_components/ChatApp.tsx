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
  pinned: boolean;
  archived: boolean;
  createdAt: number;
};

const DAY = 86_400_000;
const now = Date.now();

const initialConversations: Conversation[] = [
  {
    id: "c-1",
    title: "Draft NDA for new vendor",
    preview: "Mutual NDA, Delaware law…",
    pinned: true,
    archived: false,
    createdAt: now,
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
    pinned: false,
    archived: false,
    createdAt: now - DAY,
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
    pinned: false,
    archived: false,
    createdAt: now - 3 * DAY,
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
    pinned: false,
    archived: false,
    createdAt: now - 10 * DAY,
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

function ChatItem({
  conv,
  isActive,
  contextMenuId,
  onSelect,
  onRename,
  onArchive,
  onTogglePin,
  onDelete,
  onOpenContextMenu,
}: {
  conv: Conversation;
  isActive: boolean;
  contextMenuId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onArchive: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenContextMenu: (id: string | null) => void;
}) {
  const isOpen = contextMenuId === conv.id;
  const [shareOpen, setShareOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conv.title);
  const menuRef = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onOpenContextMenu(null);
        setShareOpen(false);
        setIsRenaming(false);
        setRenameValue(conv.title);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onOpenContextMenu, conv.title]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  function submitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conv.title) {
      onRename(conv.id, trimmed);
    } else {
      setRenameValue(conv.title);
    }
    setIsRenaming(false);
    onOpenContextMenu(null);
  }

  function shareText() {
    return `${conv.title}\n\n${conv.messages.map((m) => `${m.role === "user" ? "You" : "Lawbite"}: ${m.content}`).join("\n\n")}`;
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText())}`, "_blank");
    setShareOpen(false);
    onOpenContextMenu(null);
  }

  function shareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}`,
      "_blank",
    );
    setShareOpen(false);
    onOpenContextMenu(null);
  }

  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText())}`,
      "_blank",
    );
    setShareOpen(false);
    onOpenContextMenu(null);
  }

  function shareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank",
    );
    setShareOpen(false);
    onOpenContextMenu(null);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(shareText());
    setShareOpen(false);
    onOpenContextMenu(null);
  }

  async function shareMore() {
    if (navigator.share) {
      try {
        await navigator.share({ title: conv.title, text: shareText() });
      } catch {
        // user cancelled or error
      }
    }
    setShareOpen(false);
    onOpenContextMenu(null);
  }

  return (
    <li
      ref={menuRef}
      className="group relative"
    >
      {isRenaming ? (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 shrink-0 text-white/25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") {
                setRenameValue(conv.title);
                setIsRenaming(false);
                onOpenContextMenu(null);
              }
            }}
            onBlur={submitRename}
            className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-white outline-none border-b border-white/30"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelect(conv.id)}
          aria-current={isActive ? "true" : undefined}
          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors duration-300 ${
            isActive
              ? "bg-white/[0.06] text-white"
              : "text-white/65 hover:bg-white/[0.04] hover:text-white"
          }`}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 shrink-0 text-white/25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
            {conv.title}
          </span>
          {conv.pinned && (
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-3 w-3 shrink-0 text-white/30"
              fill="currentColor"
            >
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z" />
            </svg>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenContextMenu(isOpen ? null : conv.id);
            }}
            className="shrink-0 rounded-md p-1 text-white/0 transition-colors hover:bg-white/10 hover:text-white/70 group-hover:text-white/40"
            aria-label="More options"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="currentColor"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </button>
      )}

      {isOpen && !isRenaming && (
        <div className="absolute right-2 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 py-1 shadow-xl">
          <button
            type="button"
            onClick={() => onTogglePin(conv.id)}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill={conv.pinned ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z" />
            </svg>
            {conv.pinned ? "Unpin" : "Pin to top"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRenaming(true);
              onOpenContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
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
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            Rename
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShareOpen(!shareOpen)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
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
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
              <svg
                viewBox="0 0 24 24"
                className={`ml-auto h-3 w-3 transition-transform ${shareOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {shareOpen && (
              <div className="">
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={shareTwitter}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X / Twitter
                </button>
                <button
                  type="button"
                  onClick={shareFacebook}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={shareLinkedIn}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy text
                </button>
                {"share" in navigator && (
                  <button
                    type="button"
                    onClick={shareMore}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    More
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onArchive(conv.id)}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white"
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
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            Archive
          </button>

          <button
            type="button"
            onClick={() => onDelete(conv.id)}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

const initialAnalysisConversations: Conversation[] = [
  {
    id: "a-1",
    title: "Fundamental rights analysis under Article 21",
    preview: "Right to privacy, personal liberty…",
    pinned: false,
    archived: false,
    createdAt: now,
    messages: [
      {
        id: "am-1-1",
        role: "user",
        content:
          "Provide an in-depth analysis of how Article 21 of the Indian Constitution has been interpreted to include the right to privacy, tracing key Supreme Court judgments.",
      },
      {
        id: "am-1-2",
        role: "assistant",
        content:
          "Article 21 — Protection of Life and Personal Liberty — has undergone expansive judicial interpretation since the 1950s. Here is a structured deep analysis:\n\n**1. Pre-Maneka Era (1950–1978)**\nIn *A.K. Gopalan v. State of Madras* (1950), the Supreme Court read Article 21 narrowly — 'personal liberty' meant only freedom of movement. The right to privacy was not recognized.\n\n**2. The Maneka Shift (1978)**\nIn *Maneka Gandhi v. Union of India*, the Court held that Article 21's 'procedure established by law' must satisfy the test of Articles 14, 19, and 21 together — introducing the 'triple test.' This opened the door to expansive interpretations of life and liberty.\n\n**3. Privacy as a Fundamental Right (2017)**\nIn *K.S. Puttaswamy v. Union of India* (9-judge bench), the Court unanimously declared the right to privacy as intrinsic to Article 21 (and Articles 14 and 19). Justice D.Y. Chandrachud's leading opinion traced privacy to natural law, human dignity, and the constitutional value of personality.\n\n**Key doctrinal pillars from Puttaswamy:**\n- Privacy is a natural right, not granted by the state\n- It attaches to the person, not to property\n- Informational self-determination is a facet of privacy\n- The state must satisfy a three-part test: legitimate aim, proportionality, and procedural safeguards\n\n**4. Post-Puttaswamy Developments**\n- *Justice K.S. Puttaswamy v. Union of India* (Aadhaar case, 2018) — upheld Aadhaar but struck down Section 57, limiting private entities from using Aadhaar data\n- *X v. Union of India* (2023) — recognized the right to be forgotten as part of privacy\n- *Supriyo v. Union of India* (same-sex marriage case) — the Court declined to legalize same-sex marriage but reaffirmed the dignity and autonomy components of Article 21\n\n**Practical implications:**\n- Government surveillance must pass the Puttaswamy proportionality test\n- Data protection legislation (Digital Personal Data Protection Act, 2023) derives its constitutional basis from Article 21\n- Medical confidentiality, reproductive autonomy, and bodily integrity all flow from the Article 21 privacy jurisprudence\n\nWould you like me to deep-dive into any specific sub-topic, such as the proportionality test or the intersection of privacy with data protection law?",
      },
    ],
  },
  {
    id: "a-2",
    title: "Doctrine of colourable legislation",
    preview: "What the legislature cannot do directly…",
    pinned: false,
    archived: false,
    createdAt: now - DAY,
    messages: [
      {
        id: "am-2-1",
        role: "user",
        content:
          "Explain the doctrine of colourable legislation with Indian case law and its modern relevance.",
      },
      {
        id: "am-2-2",
        role: "assistant",
        content:
          "The doctrine of colourable legislation is a constitutional principle rooted in the maxim: *'Quando lex aliquid alicui concedit, concedere videtur et illud sine quo res ipsa esse non potest'* — what the legislature cannot do directly, it cannot do indirectly.\n\n**Core principle:**\nIf the Constitution分配s legislative power among different organs (Centre/State) or subjects (Lists in the Seventh Schedule), the legislature cannot achieve an unconstitutional result by employing indirect or colourable means.\n\n**Key Indian cases:**\n1. *K.C. Gajapati Narayan Deo v. State of Orissa* (1953) — the foundational case; struck down an estates abolition act that disguised a penal provision within a compensatory legislation\n2. *Subramanian Swamy v. Director, CBI* (2014) — the Court examined whether creating a prosecution mechanism through executive orders was colourable legislation\n3. *Rajbala v. State of Haryana* (2016) — examined whether property qualifications for panchayat elections were a colourable exercise of legislative power\n\n**Modern relevance:**\nThe doctrine remains alive in challenges to:\n- Tax legislation that effectively regulates a subject outside legislative competence\n- Emergency legislation that encroaches on fundamental rights\n- Delegated legislation that exceeds the parent Act's scope\n\nWould you like me to explore the intersection with the *basic structure doctrine* or analyze a specific statute?",
      },
    ],
  },
];

type AppMode = "chat" | "analysis";

export default function ChatApp({ user }: ChatAppProps) {
  const [mode, setMode] = useState<AppMode>("chat");
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations,
  );
  const [activeId, setActiveId] = useState<string>(initialConversations[0].id);
  const [analysisConversations, setAnalysisConversations] = useState<Conversation[]>(
    initialAnalysisConversations,
  );
  const [analysisActiveId, setAnalysisActiveId] = useState<string>(
    initialAnalysisConversations[0].id,
  );
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAnalysis = mode === "analysis";

  const activeConversations = isAnalysis ? analysisConversations : conversations;
  const currentActiveId = isAnalysis ? analysisActiveId : activeId;

  const active =
    activeConversations.find((c) => c.id === currentActiveId) ??
    activeConversations[0];

  const filteredConversations = (searchQuery
    ? activeConversations.filter(
        (c) =>
          (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.preview.toLowerCase().includes(searchQuery.toLowerCase())) &&
          !c.archived,
      )
    : activeConversations.filter((c) => !c.archived));

  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const unpinnedConversations = filteredConversations.filter((c) => !c.pinned);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, isThinking]);

  function switchMode(newMode: AppMode) {
    setMode(newMode);
    setContextMenuId(null);
    setSearchQuery("");
    setDraft("");
  }

  function selectConversation(id: string) {
    if (isAnalysis) {
      setAnalysisActiveId(id);
    } else {
      setActiveId(id);
    }
    setSidebarOpen(false);
  }

  function startNewChat() {
    const conv: Conversation = {
      id: newId("c"),
      title: isAnalysis ? "New analysis" : "New conversation",
      preview: "Just started",
      messages: [],
      pinned: false,
      archived: false,
      createdAt: Date.now(),
    };
    if (isAnalysis) {
      setAnalysisConversations((prev) => [conv, ...prev]);
      setAnalysisActiveId(conv.id);
    } else {
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
    }
    setDraft("");
    setSidebarOpen(false);
  }

  function renameConversation(id: string, newTitle: string) {
    const setter = isAnalysis ? setAnalysisConversations : setConversations;
    setter((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  }

  function archiveConversation(id: string) {
    const setter = isAnalysis ? setAnalysisConversations : setConversations;
    setter((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: true } : c)),
    );
    setContextMenuId(null);
  }

  function togglePin(id: string) {
    const setter = isAnalysis ? setAnalysisConversations : setConversations;
    setter((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
    setContextMenuId(null);
  }

  function deleteConversation(id: string) {
    if (isAnalysis) {
      setAnalysisConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (id === analysisActiveId && next.length > 0) {
          setAnalysisActiveId(next[0].id);
        }
        return next;
      });
    } else {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (id === activeId && next.length > 0) {
          setActiveId(next[0].id);
        }
        return next;
      });
    }
    setContextMenuId(null);
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMsg: Message = { id: newId("u"), role: "user", content: trimmed };

    const setter = isAnalysis ? setAnalysisConversations : setConversations;
    const targetId = isAnalysis ? analysisActiveId : activeId;

    setter((prev) =>
      prev.map((c) =>
        c.id === targetId
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
        content: isAnalysis
          ? "Conducting in-depth analysis on this matter. I will examine the legal framework, relevant precedents, statutory provisions, and scholarly commentary to provide a comprehensive assessment. Here are the key dimensions I am evaluating:\n\n**1. Legal Framework** — Identifying the applicable statutes, constitutional provisions, and regulatory framework.\n\n**2. Precedent Analysis** — Examining binding and persuasive case law across jurisdictions.\n\n**3. Doctrinal Foundations** — Tracing the evolution of legal principles relevant to this issue.\n\n**4. Practical Implications** — Assessing real-world impact on stakeholders and potential outcomes.\n\nI will prepare a structured analysis brief momentarily."
          : "Thanks — I have logged that. I will prepare a draft response and surface the relevant clauses, risks, and next steps shortly.",
      };
      setter((prev) =>
        prev.map((c) =>
          c.id === targetId
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

  function clearAllHistory() {
    if (isAnalysis) {
      setAnalysisConversations([]);
      setAnalysisActiveId("");
    } else {
      setConversations([]);
      setActiveId("");
    }
    setSettingsOpen(false);
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

        <div className="px-4 pt-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              switchMode("chat");
              startNewChat();
            }}
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
          <button
            type="button"
            onClick={() => switchMode("analysis")}
            className={`group flex w-full items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
              isAnalysis
                ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                : "border-white/15 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
            }`}
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>In Depth Analysis</span>
          </button>
        </div>

        <nav
          aria-label="Conversations"
          className="mt-4 flex-1 overflow-y-auto px-2 pb-4"
        >
          <div className="px-1 pb-2">
            <div className="relative">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
              />
            </div>
          </div>

          {pinnedConversations.length > 0 && (
            <div className="mb-2">
              <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                Pinned
              </p>
              <ul className="space-y-0.5 text-sm">
                {pinnedConversations.map((conv) => (
                  <ChatItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeId}
                    contextMenuId={contextMenuId}
                    onSelect={selectConversation}
                    onRename={renameConversation}
                    onArchive={archiveConversation}
                    onTogglePin={togglePin}
                    onDelete={deleteConversation}
                    onOpenContextMenu={setContextMenuId}
                  />
                ))}
              </ul>
            </div>
          )}

          {unpinnedConversations.length > 0 && (
            <div className="mb-2">
              <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                History
              </p>
              <ul className="space-y-0.5 text-sm">
                {unpinnedConversations.map((conv) => (
                  <ChatItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeId}
                    contextMenuId={contextMenuId}
                    onSelect={selectConversation}
                    onRename={renameConversation}
                    onArchive={archiveConversation}
                    onTogglePin={togglePin}
                    onDelete={deleteConversation}
                    onOpenContextMenu={setContextMenuId}
                  />
                ))}
              </ul>
            </div>
          )}

          {filteredConversations.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-white/30">
              No conversations found.
            </p>
          )}
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
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Settings"
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
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
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
                {active?.title ?? (isAnalysis ? "New analysis" : "New conversation")}
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                {isAnalysis ? "In Depth Analysis" : "Lawbite Assistant"}
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
                        : isAnalysis
                          ? "border border-amber-400/15 bg-amber-400/[0.03] text-white/85"
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
              <div className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.3em] ${
                isAnalysis
                  ? "border-amber-400/20 bg-amber-400/5 text-amber-300/60"
                  : "border-white/10 bg-white/[0.03] text-white/40"
              }`}>
                {isAnalysis ? "In Depth Analysis" : "New conversation"}
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                {isAnalysis
                  ? "Deep-dive into any legal issue"
                  : "How can I help with your legal work today?"}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                {isAnalysis
                  ? "Describe a specific case, legal doctrine, or complex issue. I will provide a thorough analysis covering legal framework, precedents, statutory interpretation, and practical implications."
                  : "Draft documents, review clauses, or ask questions about a matter. I will keep the context of this conversation for the duration of the session."}
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
              placeholder={isAnalysis ? "Describe the case or legal issue…" : "Message Lawbite…"}
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

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">Settings</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close settings"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full border border-white/15 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm text-white/60">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user.name || "User"}
                  </p>
                  <p className="truncate text-xs text-white/50">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="px-1 text-xs font-medium text-white/40 uppercase tracking-wider">
                  Account
                </p>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Edit profile
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Security
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Preferences
                </button>
                <button
                  type="button"
                  onClick={clearAllHistory}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  Clear history
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
