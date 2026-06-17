"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { signOut } from "@/lib/auth-client";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
  type?: ConversationType;
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

type ConversationType = "chat" | "analysis" | "talk-to-ai" | "grill";

type Conversation = {
  id: string;
  title: string;
  preview: string;
  messages: Message[];
  type: ConversationType;
  pinned?: boolean;
  createdAt?: number;
};

type SavedCase = {
  id: string;
  title: string;
  summary: string;
  problem: string;
  state: string;
  date: number;
  conversationId: string;
};

const STORAGE_KEY = "lawbite-saved-cases";

function loadSavedCases(): SavedCase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSavedCases(cases: SavedCase[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch {}
}

const initialConversations: Conversation[] = [
  {
    id: "c-1",
    title: "Welcome to Lawbite AI",
    preview: "Talk to AI",
    type: "talk-to-ai",
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 30,
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
    type: "chat",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
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
    type: "chat",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
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
    type: "chat",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
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

const freshConversation: Conversation = {
  id: newId("c"),
  title: "New conversation",
  preview: "Just started",
  type: "chat",
  createdAt: Date.now(),
  messages: [],
};

export default function ChatApp({ user }: ChatAppProps) {
  const [conversations, setConversations] = useState<Conversation[]>([
    freshConversation,
    ...initialConversations,
  ]);
  const [activeId, setActiveId] = useState<string>(freshConversation.id);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [myCasesOpen, setMyCasesOpen] = useState(false);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [blinkAnalysis, setBlinkAnalysis] = useState(false);
  const wasThinkingRef = useRef(false);
  const lastTalkIdRef = useRef<string | null>(null);
  const lastAnalysisIdRef = useRef<string | null>(null);
  const [mode, setMode] = useState<ConversationType>("chat");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const escCountRef = useRef(0);
  const escTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "clearHistory"; section?: ConversationType } | { type: "deleteConversation"; id: string } | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, isThinking, showSuggestion]);

  useEffect(() => {
    setSavedCases(loadSavedCases());
  }, []);

  useEffect(() => {
    if (wasThinkingRef.current && !isThinking && mode !== "analysis") {
      const lastMsg = active?.messages[active.messages.length - 1];
      const userMsgs = (active?.messages ?? []).filter((m) => m.role === "user");
      const lastUserMsg = userMsgs[userMsgs.length - 1];
      const content = lastUserMsg?.content?.toLowerCase().trim() ?? "";
      const isGreeting = /^(hi|hello|hey|namaste|good\s*(morning|afternoon|evening|night)|yo|sup|hola|howdy|greetings)/.test(content);
      const isCompliment = /(thank|thanks|thx|good\s*(job|work|bot|ai)|great|awesome|nice|amazing|perfect|excellent|well\s*done|bravo|superb|fantastic|love\s*you)/.test(content);
      const isOffTopic = /only\s+provide\s+information.*indian\s+law/i.test(lastMsg?.content?.trim() ?? "");
      const isAiGreeting = lastMsg?.content?.trim().toLowerCase().startsWith("hello") && lastMsg?.content?.toLowerCase().includes("how can i assist you");
      if (lastMsg && lastMsg.role === "assistant" && lastMsg.content && !isOffTopic && !isGreeting && !isCompliment && !isAiGreeting && active?.type !== "grill") {
        setShowSuggestion(true);
        setBlinkAnalysis(true);
        setTimeout(() => setBlinkAnalysis(false), 3000);
      } else {
        setShowSuggestion(false);
      }
    }
    wasThinkingRef.current = isThinking;
  }, [isThinking, active]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenuId(null);
      }
    }
    if (contextMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenuId]);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key !== "Escape" || !isThinking) return;
      escCountRef.current += 1;
      if (escTimerRef.current) clearTimeout(escTimerRef.current);
      escTimerRef.current = setTimeout(() => { escCountRef.current = 0; }, 1500);
      if (escCountRef.current >= 3) {
        escCountRef.current = 0;
        if (escTimerRef.current) clearTimeout(escTimerRef.current);
        abortRef.current?.abort();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isThinking]);

  function renderBold(text: string): ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  function extractTopic(text: string): string {
    const stopWords = /^(what|who|when|where|why|how|is|are|do|does|did|can|could|would|should|will|shall|may|might|the|a|an|me|about|it|its|this|that|these|those|by|in|on|of|to|for|with|under|between|from|please|i|want|to|know|like|tell|explain|define|describe|give|me|some|info|information|detail|details|regarding|concerning|related|question|answer|something|anything|everything)$/i;
    const cleaned = text.replace(/[?.,!]+$/, "").trim();
    const words = cleaned.split(/\s+/);
    const keywords = words.filter((w) => !stopWords.test(w));
    if (keywords.length === 0) return cleaned.slice(0, 40);
    const title = keywords.join(" ");
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  function selectConversation(id: string) {
    const target = conversations.find((c) => c.id === id);
    if (target) setMode(target.type);
    setActiveId(id);
    setSidebarOpen(false);
  }

  function startNewChat() {
    const convType = mode;
    const prefix = "c";
    const conv: Conversation = {
      id: newId(prefix),
      title: "New conversation",
      preview: "Just started",
      type: convType,
      createdAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setMode(convType);
    setDraft("");
    setSidebarOpen(false);
  }

  function startAnalysisChat() {
    const conv: Conversation = {
      id: newId("a"),
      title: "New analysis",
      preview: "In-depth analysis",
      type: "analysis",
      createdAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setDraft("");
    setSidebarOpen(false);
  }

  function startTalkToAI() {
    const conv: Conversation = {
      id: newId("t"),
      title: "New AI conversation",
      preview: "Talk to AI",
      type: "talk-to-ai",
      createdAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setMode("talk-to-ai");
    setDraft("");
    setSidebarOpen(false);
  }

  function startGrill() {
    const conv: Conversation = {
      id: newId("g"),
      title: "New grill session",
      preview: "Grill Me",
      type: "grill",
      createdAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setMode("grill");
    setDraft("");
    setSidebarOpen(false);
    setMyCasesOpen(false);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    setShowSuggestion(false);
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Message = { id: newId("u"), role: "user", content: trimmed, type: mode };
    const assistantId = newId("a");

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title:
                c.messages.length === 0
                  ? extractTopic(trimmed)
                  : c.title,
              preview: trimmed,
              messages: [...c.messages, userMsg],
            }
          : c,
      );
      return updated;
    });
    setDraft("");
    setIsThinking(true);

    const currentConversations = conversations;
    const activeConversation = currentConversations.find((c) => c.id === activeId);
    const conversationMessages = [
      ...(activeConversation?.messages ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: trimmed },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          conversationType: mode,
          messages: conversationMessages,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, { id: assistantId, role: "assistant", content: "", type: mode }] }
            : c,
        ),
      );

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                const content = assistantContent;
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantId ? { ...m, content } : m,
                          ),
                        }
                      : c,
                  ),
                );
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // User pressed Esc 3 times — keep whatever was streamed so far
      } else {
        console.error("Chat error:", error);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: "Sorry, I encountered an error. Please try again." }
                      : m,
                  ),
                }
              : c,
          ),
        );
      }
    } finally {
      abortRef.current = null;
      setIsThinking(false);

      // Auto-save completed grill sessions
      if (mode === "grill") {
        setConversations((prev) => {
          const conv = prev.find((c) => c.id === activeId);
          if (!conv) return prev;
          const lastMsg = conv.messages[conv.messages.length - 1];
          if (!lastMsg || lastMsg.role !== "assistant") return prev;
          if (!lastMsg.content.includes("[ADVICE_COMPLETE]")) return prev;

          const summary = lastMsg.content.replace("[ADVICE_COMPLETE]", "").trim();
          const firstUserMsg = conv.messages.find((m) => m.role === "user");
          const problem = firstUserMsg?.content ?? "Legal problem";

          // Extract state from conversation context
          const stateMatch = conv.messages
            .filter((m) => m.role === "user")
            .slice(1)
            .find((m) =>
              /bihar|gujarat|up|delhi|mumbai|karnataka|tamil|kerala|rajasthan|maharashtra|west bengal|assam|odisha|telangana|andhra|punjab|haryana|madhya|jharkhand|chhattisgarh|goa|himachal|uttarakhand|sikkim|manipur|meghalaya|nagaland|mizoram|tripura|arunachal|lucknow|patna|ahmedabad|surat|vadodara|gandhinagar/i.test(m.content)
            );
          const state = stateMatch
            ? stateMatch.content.replace(/.*?(bihar|gujarat|up|delhi|mumbai|karnataka|tamil|kerala|rajasthan|maharashtra|west bengal|assam|odisha|telangana|andhra|punjab|haryana|madhya|jharkhand|chhattisgarh|goa|himachal|uttarakhand|sikkim|manipur|meghalaya|nagaland|mizoram|tripura|arunachal|lucknow|patna|ahmedabad|surat|vadodara|gandhinagar).*/i, "$1").trim()
            : "India";

          const newCase: SavedCase = {
            id: newId("sc"),
            title: conv.title === "New grill session" ? extractTopic(problem) : conv.title,
            summary,
            problem,
            state,
            date: Date.now(),
            conversationId: conv.id,
          };

          // Clean the marker from the stored message
          const cleanedConv = {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === lastMsg.id
                ? { ...m, content: summary }
                : m
            ),
          };
          setConversations((prev) =>
            prev.map((c) => (c.id === activeId ? cleanedConv : c))
          );

          setSavedCases((prev) => {
            const updated = [newCase, ...prev.filter((sc) => sc.conversationId !== conv.id)];
            saveSavedCases(updated);
            return updated;
          });

          return prev;
        });
      }
    }
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

  function deleteConversation(id: string) {
    setConversations((prev) => {
      const deleted = prev.find((c) => c.id === id);
      const next = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        const sameType = next.filter((c) => c.type === deleted?.type);
        const fallback = sameType[0] ?? next[0];
        setActiveId(fallback?.id ?? "");
      }
      return next;
    });
  }

  function togglePin(id: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
  }

  function startRename(id: string, currentTitle: string) {
    setEditingId(id);
    setEditingTitle(currentTitle);
  }

  function commitRename(id: string) {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)),
      );
    }
    setEditingId(null);
    setEditingTitle("");
  }

  function cancelRename() {
    setEditingId(null);
    setEditingTitle("");
  }

  function clearHistory(section?: ConversationType) {
    if (section === undefined) {
      const types: ConversationType[] = ["chat", "analysis", "talk-to-ai", "grill"];
      const freshConversations: Conversation[] = types.map((type) => ({
        id: newId(type === "analysis" ? "a" : type === "talk-to-ai" ? "t" : type === "grill" ? "g" : "c"),
        title: "New conversation",
        preview: "Just started",
        type,
        createdAt: Date.now(),
        messages: [],
      }));
      setConversations(freshConversations);
      setActiveId(freshConversations[0].id);
      setContextMenuId(null);
      return;
    }
    const clearType = section ?? active?.type ?? "chat";
    const prefix = clearType === "analysis" ? "a" : clearType === "talk-to-ai" ? "t" : clearType === "grill" ? "g" : "c";
    const fresh: Conversation = {
      id: newId(prefix),
      title: "New conversation",
      preview: "Just started",
      type: clearType,
      createdAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [fresh, ...prev.filter((c) => c.type !== clearType)]);
    setActiveId(fresh.id);
    setContextMenuId(null);
  }

  function shareConversation(conv: Conversation, platform?: string) {
    const text = `${conv.title}\n\n${conv.messages.map((m) => `${m.role === "user" ? "You" : "Lawbite"}: ${m.content}`).join("\n\n")}`;
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (platform === "more" && navigator.share) {
      navigator.share({ title: conv.title, text, url }).catch(() => {});
      return;
    }

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent(conv.title)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
    };

    if (shareUrls[platform ?? ""]) {
      window.open(shareUrls[platform ?? ""], "_blank", "noopener,noreferrer");
    }
  }

  function groupConversations(type: ConversationType) {
    const now = Date.now();
    const DAY = 1000 * 60 * 60 * 24;

    const filtered = conversations.filter((c) => c.type === type);
    const pinned = filtered.filter((c) => c.pinned);
    const unpinned = filtered.filter((c) => !c.pinned);

    const groups: { label: string; items: Conversation[] }[] = [];

    const today: Conversation[] = [];
    const previous7: Conversation[] = [];
    const previous30: Conversation[] = [];
    const older: Conversation[] = [];

    for (const c of unpinned) {
      const age = now - (c.createdAt ?? 0);
      if (age < DAY) today.push(c);
      else if (age < DAY * 7) previous7.push(c);
      else if (age < DAY * 30) previous30.push(c);
      else older.push(c);
    }

    if (pinned.length > 0) groups.push({ label: "Pinned", items: pinned });
    if (today.length > 0) groups.push({ label: "Today", items: today });
    if (previous7.length > 0)
      groups.push({ label: "Previous 7 Days", items: previous7 });
    if (previous30.length > 0)
      groups.push({ label: "Previous 30 Days", items: previous30 });
    if (older.length > 0) groups.push({ label: "Older", items: older });

    return groups;
  }

  function renderConvItem(conv: Conversation) {
    const isActive = conv.id === activeId;
    const isEditing = editingId === conv.id;
    const menuOpen = contextMenuId === conv.id;
    const isAnalysis = conv.type === "analysis";
    const isTalkToAI = conv.type === "talk-to-ai";
    const isGrill = conv.type === "grill";

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1.5">
          <input
            autoFocus
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename(conv.id);
              if (e.key === "Escape") cancelRename();
            }}
            onBlur={() => commitRename(conv.id)}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none"
          />
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-left transition-colors duration-150 ${
          isActive
            ? "bg-white/[0.08] text-white"
            : "text-white/60 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        <button
          type="button"
          onClick={() => selectConversation(conv.id)}
          aria-current={isActive ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          {isAnalysis ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" />
            </svg>
          ) : isTalkToAI ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" /><path d="M16 14h.01M8 14h.01M12 17v4M8 21h8" />
            </svg>
          ) : isGrill ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-amber-400/70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" /><path d="M9 2L7 5l2 3M15 2l2 3-2 3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
          <div className="min-w-0 flex-1">
            <span className="line-clamp-1 block text-[13px]">
              {conv.title}
            </span>
            <span className="block text-[10px] text-white/25">
              {conv.type === "analysis" ? "In-depth Analysis" : conv.type === "talk-to-ai" ? "Talk to AI" : conv.type === "grill" ? "Grill Me" : "Chat"}
            </span>
          </div>
        </button>

        {(hoveredId === conv.id || isActive || menuOpen) && (
          <div ref={menuOpen ? contextMenuRef : undefined} className="relative shrink-0">
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setContextMenuId(menuOpen ? null : conv.id); }}
              onKeyDown={(e) => { if (e.key === "Enter") setContextMenuId(menuOpen ? null : conv.id); }}
              className="rounded p-1 text-white/40 transition-colors hover:text-white cursor-pointer"
              aria-label="More options"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
              </svg>
            </span>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-2xl">
                <button type="button" onClick={(e) => { e.stopPropagation(); startRename(conv.id, conv.title); setContextMenuId(null); }} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-[13px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Rename
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); togglePin(conv.id); setContextMenuId(null); }} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-[13px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill={conv.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L8.5 8.5 2 9.3l4.7 4.5L5.5 21 12 17.5 18.5 21l-1.2-7.2L22 9.3l-6.5-.8z" /></svg>
                  {conv.pinned ? "Unpin" : "Pin"}
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                <div className="px-3.5 py-2"><p className="text-[11px] font-medium uppercase tracking-wider text-white/30">Share</p></div>
                <div className="flex items-center gap-1 px-3 pb-2">
                  <button type="button" onClick={(e) => { e.stopPropagation(); shareConversation(conv, "twitter"); setContextMenuId(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.08] hover:text-[#E7E7E7]" aria-label="Share on X">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); shareConversation(conv, "facebook"); setContextMenuId(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.08] hover:text-[#1877F2]" aria-label="Share on Facebook">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); shareConversation(conv, "linkedin"); setContextMenuId(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.08] hover:text-[#0A66C2]" aria-label="Share on LinkedIn">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); shareConversation(conv, "whatsapp"); setContextMenuId(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.08] hover:text-[#25D366]" aria-label="Share on WhatsApp">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); shareConversation(conv, "email"); setContextMenuId(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.08] hover:text-[#EA4335]" aria-label="Share via Email">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  </button>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); shareConversation(conv, "more"); setContextMenuId(null); }} className="flex w-full items-center gap-3 border-t border-white/[0.06] px-3.5 py-2.5 text-[13px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  More…
                </button>
                <div className="my-1 border-t border-white/[0.06]" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: "deleteConversation", id: conv.id }); setContextMenuId(null); }} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-[13px] text-red-400 transition-colors hover:bg-red-500/10">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
          <button
            type="button"
            onClick={() => setMyCasesOpen(true)}
            className="mt-2 flex w-full items-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.01]"
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
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>My Cases</span>
          </button>
        </div>

        <nav
          aria-label="History"
          className="mt-4 flex-1 overflow-y-auto px-2 pb-4"
        >
          {groupConversations("chat").length > 0 && (
            <div className="mb-4">
              <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-white/35">Chats</p>
              {groupConversations("chat").map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="px-3 pb-1 pt-1 text-[10px] font-medium text-white/25">{group.label}</p>
                  <ul className="space-y-0.5 text-sm">
                    {group.items.map((conv) => (
                      <li key={conv.id} className="relative" onMouseEnter={() => setHoveredId(conv.id)} onMouseLeave={() => setHoveredId(null)}>
                        {renderConvItem(conv)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setConfirmAction({ type: "clearHistory", section: "chat" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-white/30 transition-colors hover:bg-white/[0.04] hover:text-red-400/70"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear history
              </button>
            </div>
          )}

          {groupConversations("analysis").length > 0 && (
            <div className="mb-4">
              <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-white/35">In-depth Analysis</p>
              {groupConversations("analysis").map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="px-3 pb-1 pt-1 text-[10px] font-medium text-white/25">{group.label}</p>
                  <ul className="space-y-0.5 text-sm">
                    {group.items.map((conv) => (
                      <li key={conv.id} className="relative" onMouseEnter={() => setHoveredId(conv.id)} onMouseLeave={() => setHoveredId(null)}>
                        {renderConvItem(conv)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setConfirmAction({ type: "clearHistory", section: "analysis" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-white/30 transition-colors hover:bg-white/[0.04] hover:text-red-400/70"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear history
              </button>
            </div>
          )}

          {groupConversations("talk-to-ai").length > 0 && (
            <div className="mb-4">
              <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-white/35">Talk to AI</p>
              {groupConversations("talk-to-ai").map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="px-3 pb-1 pt-1 text-[10px] font-medium text-white/25">{group.label}</p>
                  <ul className="space-y-0.5 text-sm">
                    {group.items.map((conv) => (
                      <li key={conv.id} className="relative" onMouseEnter={() => setHoveredId(conv.id)} onMouseLeave={() => setHoveredId(null)}>
                        {renderConvItem(conv)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setConfirmAction({ type: "clearHistory", section: "talk-to-ai" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-white/30 transition-colors hover:bg-white/[0.04] hover:text-red-400/70"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear history
              </button>
            </div>
          )}

          {groupConversations("grill").length > 0 && (
            <div className="mb-4">
              <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-amber-400/60">Grill Me</p>
              {groupConversations("grill").map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="px-3 pb-1 pt-1 text-[10px] font-medium text-white/25">{group.label}</p>
                  <ul className="space-y-0.5 text-sm">
                    {group.items.map((conv) => (
                      <li key={conv.id} className="relative" onMouseEnter={() => setHoveredId(conv.id)} onMouseLeave={() => setHoveredId(null)}>
                        {renderConvItem(conv)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setConfirmAction({ type: "clearHistory", section: "grill" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-white/30 transition-colors hover:bg-white/[0.04] hover:text-red-400/70"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear history
              </button>
            </div>
          )}

          {groupConversations("chat").length === 0 && groupConversations("analysis").length === 0 && groupConversations("talk-to-ai").length === 0 && groupConversations("grill").length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-white/35">No conversations yet</p>
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

      <main className={`flex min-w-0 flex-1 flex-col ${(mode === "analysis" || mode === "talk-to-ai" || mode === "grill") ? "bg-black/80" : ""}`}>
        <header className={`flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8 ${(mode === "analysis" || mode === "talk-to-ai" || mode === "grill") ? "bg-black/50" : ""}`}>
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
                {mode === "analysis" ? "In-depth Analysis" : mode === "talk-to-ai" ? "Talk to AI" : mode === "grill" ? "Grill Me — Interrogation Mode" : "Lawbite Assistant"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startNewChat}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
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
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Chat
            </button>
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
                    {message.role === "assistant" && (message.type ?? active?.type) === "analysis" ? (
                      <div className="flex flex-col gap-4">
                        {message.content.replace(/\[ADVICE_COMPLETE\]/g, "").split(/\n+/).filter(Boolean).map((block, i) => {
                          const numMatch = block.trim().match(/^(\d+)\.\s*/);
                          if (numMatch) {
                            const num = numMatch[1];
                            const text = block.trim().replace(/^\d+\.\s*/, "");
                            return (
                              <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                                <div className="flex gap-3">
                                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-bold text-white/80">
                                    {num}
                                  </span>
                                  <div className="whitespace-pre-wrap leading-relaxed">
                                    {text.split(/\n\n+/).map((para, j) => (
                                      <p key={j} className={j > 0 ? "mt-3" : ""}>{renderBold(para)}</p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={i} className="whitespace-pre-wrap leading-relaxed">
                              {block.trim().split(/\n\n+/).map((para, j) => (
                                <p key={j} className={j > 0 ? "mt-3" : ""}>{renderBold(para)}</p>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content.replace(/\[ADVICE_COMPLETE\]/g, "").split(/\n\n+/).map((para, i) => (
                          <p key={i} className={i > 0 ? "mt-3" : ""}>{renderBold(para)}</p>
                        ))}
                      </div>
                    )}
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
              {showSuggestion && !isThinking && (
                <li className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                    <p>
                      {(() => {
                        const userMsgs = (active?.messages ?? []).filter((m) => m.role === "user");
                        const raw = userMsgs[userMsgs.length - 1]?.content ?? "";
                        const fillers = ["what","who","when","where","why","how","can","is","are","do","does","did","tell","explain","define","describe","the","a","an","me","about","it","its","this","that","these","those","by","in","on","of","to","for","with","under","between","from","please","i","want","to","know","like"];
                        const words = raw.replace(/[?.,!]+$/, "").trim().split(/\s+/);
                        const keywords = words.filter((w) => !fillers.includes(w.toLowerCase())).slice(0, 5).join(" ");
                        return <>To know more about &quot;{keywords || raw.slice(0, 40)}&quot;</>;
                      })()}
                      , try the{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setShowSuggestion(false);
                          setMode("analysis");
                        }}
                        className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:text-white/80"
                      >
                        Deep Analysis
                      </button>{" "}
                      feature.
                    </p>
                  </div>
                </li>
              )}
              <div ref={messagesEndRef} />
            </ul>
          ) : (
            <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center text-center">
              {mode === "analysis" ? (
                <>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white/40">
                    In-depth Analysis
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Deep dive into your case
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                    Describe the case, legal issue, or document you want analyzed.
                    I will provide a thorough analysis including relevant laws,
                    precedents, risks, and recommendations.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                      Case analysis
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                      Risk assessment
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                      Legal research
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                      Precedent review
                    </span>
                  </div>
                </>
              ) : mode === "talk-to-ai" ? (
                <>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white/40">
                    Talk to AI
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Ask anything about the law
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                    Have a conversation with the AI about legal questions,
                    get explanations, or explore ideas freely.
                  </p>
                </>
              ) : mode === "grill" ? (
                <>
                  <div className="rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-amber-400/70">
                    Grill Me
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Interrogate an idea with sharp follow-up questions
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                    Describe your legal situation and I will ask one question at a time
                    to build a complete picture. Based on your state, age, and specific
                    circumstances, I will provide tailored Indian legal advice with
                    relevant sections and next steps.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                      Step-by-step interrogation
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                      State-specific laws
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                      Practical next steps
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/50">
                      Case archive
                    </span>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </div>

        <div className={`border-t border-white/10 px-5 py-4 backdrop-blur-md sm:px-8 ${(mode === "analysis" || mode === "talk-to-ai") ? "bg-black/60" : "bg-black/40"}`}>
          <form
            onSubmit={onSubmit}
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition-colors duration-300 focus-within:border-white/30"
          >
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            {mode !== "grill" && (
              <button
                type="button"
                onClick={() => {
                  setMode((prev) => prev === "analysis" ? "talk-to-ai" : "analysis");
                }}
                aria-label={mode === "analysis" ? "Switch to talk to AI" : "In-depth analysis"}
                style={blinkAnalysis ? { animation: "blink-icon 1s ease-in-out 3", color: "#ffffff" } : undefined}
                className={`mb-0.5 shrink-0 rounded-full p-2 transition-colors ${
                  mode === "analysis"
                    ? "text-amber-400/70 hover:bg-amber-400/10 hover:text-amber-400"
                    : "text-white/30 hover:bg-white/[0.06] hover:text-white/60"
                }`}
              >
                {mode === "analysis" ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
                    <path d="M10 21h4M9 17h6" />
                  </svg>
                )}
              </button>
            )}
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

      {confirmAction && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (confirmAction.type === "clearHistory") {
                  clearHistory(confirmAction.section);
                } else {
                  deleteConversation(confirmAction.id);
                }
                setConfirmAction(null);
              }
              if (e.key === "Escape") {
                setConfirmAction(null);
              }
            }}
          >
            <h3 className="text-base font-semibold text-white">
              {confirmAction.type === "clearHistory" ? "Clear History" : "Delete Chat"}
            </h3>
            <p className="mt-2 text-sm text-white/55">
              {confirmAction.type === "clearHistory"
                ? `This will permanently delete all conversations across Chat, In-depth Analysis, Talk to AI, and Grill Me. This action cannot be undone.`
                : "This will permanently delete this conversation. This action cannot be undone."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => {
                  if (confirmAction.type === "clearHistory") {
                    clearHistory(confirmAction.section);
                  } else {
                    deleteConversation(confirmAction.id);
                  }
                  setConfirmAction(null);
                }}
                className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
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
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-6">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full border border-white/15 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white/60">
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
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
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
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
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
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
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
              <div className="my-1 border-t border-white/[0.06]" />
              <button
                type="button"
                onClick={() => {
                  setConfirmAction({ type: "clearHistory" });
                  setSettingsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-amber-400 transition-colors hover:bg-amber-500/10"
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
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Clear All History
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10"
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {myCasesOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setMyCasesOpen(false)}
        >
          <div
            className="relative flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">My Cases</h2>
              <button
                type="button"
                onClick={() => setMyCasesOpen(false)}
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={startGrill}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400/90 px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" /><path d="M9 2L7 5l2 3M15 2l2 3-2 3" />
              </svg>
              Start New Grill
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {savedCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg viewBox="0 0 24 24" className="mb-3 h-10 w-10 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm text-white/40">No saved cases yet</p>
                  <p className="mt-1 text-xs text-white/25">Complete a grill session to save it here</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {savedCases.map((sc) => (
                    <li
                      key={sc.id}
                      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          // Look for existing conversation or create a view from saved data
                          const existing = conversations.find((c) => c.id === sc.conversationId);
                          if (existing) {
                            selectConversation(existing.id);
                          } else {
                            const restored: Conversation = {
                              id: sc.conversationId,
                              title: sc.title,
                              preview: sc.problem,
                              type: "grill",
                              createdAt: sc.date,
                              messages: [
                                { id: newId("u"), role: "user", content: sc.problem },
                                { id: newId("a"), role: "assistant", content: sc.summary, type: "grill" },
                              ],
                            };
                            setConversations((prev) => [restored, ...prev]);
                            setActiveId(restored.id);
                            setMode("grill");
                          }
                          setMyCasesOpen(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{sc.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{sc.problem}</p>
                          </div>
                          <span className="shrink-0 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-400/80">
                            {sc.state.slice(0, 10)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-white/25">
                            {new Date(sc.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSavedCases((prev) => {
                                const updated = prev.filter((c) => c.id !== sc.id);
                                saveSavedCases(updated);
                                return updated;
                              });
                            }}
                            className="rounded px-1.5 py-0.5 text-[10px] text-white/25 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
