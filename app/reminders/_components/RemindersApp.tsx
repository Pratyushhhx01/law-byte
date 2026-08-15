"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Reminder {
  id: string;
  title: string;
  deadlineAt: string;
  type: string;
  completed: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

const REMINDER_TYPES = [
  { value: "hearing", label: "Court Hearing" },
  { value: "filing", label: "Filing Deadline" },
  { value: "limitation", label: "Limitation Period" },
  { value: "other", label: "Other" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

function getStatusColor(days: number, completed: boolean): string {
  if (completed) return "text-white/30";
  if (days < 0) return "text-red-400";
  if (days <= 7) return "text-amber-400";
  return "text-emerald-400";
}

function getStatusBg(days: number, completed: boolean): string {
  if (completed) return "bg-white/[0.02] border-white/[0.06]";
  if (days < 0) return "bg-red-500/[0.06] border-red-500/20";
  if (days <= 7) return "bg-amber-500/[0.06] border-amber-500/20";
  return "bg-emerald-500/[0.06] border-emerald-500/20";
}

export default function RemindersApp({ user: _user }: { user: User }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [type, setType] = useState("other");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/reminders");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setReminders(data);
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !deadlineAt) return;

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), deadlineAt, type }),
      });
      if (res.ok) {
        const newReminder = await res.json();
        setReminders((prev) => [...prev, newReminder].sort((a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime()));
        setTitle("");
        setDeadlineAt("");
        setType("other");
        setShowForm(false);
      }
    } catch { /* ignore */ }
  }

  async function toggleComplete(id: string, completed: boolean) {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: !completed } : r))
      );
    } catch { /* ignore */ }
  }

  async function deleteReminder(id: string) {
    try {
      await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch { /* ignore */ }
  }

  const activeReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/chat" className="text-sm text-white/50 hover:text-white transition-colors">
              ← Back to Chat
            </Link>
            <h1 className="text-lg font-semibold">Reminders</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
          >
            {showForm ? "Cancel" : "+ New Reminder"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {showForm && (
          <form onSubmit={addReminder} className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div>
              <label htmlFor="reminder-title" className="block text-sm font-medium text-white/70 mb-2">
                Case / Reminder Title
              </label>
              <input
                id="reminder-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. State v. Sharma — Hearing"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reminder-date" className="block text-sm font-medium text-white/70 mb-2">
                  Deadline Date
                </label>
                <input
                  id="reminder-date"
                  type="date"
                  value={deadlineAt}
                  onChange={(e) => setDeadlineAt(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="reminder-type" className="block text-sm font-medium text-white/70 mb-2">
                  Type
                </label>
                <select
                  id="reminder-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  {REMINDER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
            >
              Add Reminder
            </button>
          </form>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-white/40">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-white/40">No reminders yet.</p>
            <p className="mt-2 text-xs text-white/25">Add a reminder to track court dates and filing deadlines.</p>
          </div>
        ) : (
          <>
            {activeReminders.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                  Upcoming ({activeReminders.length})
                </h2>
                <div className="space-y-3">
                  {activeReminders.map((r) => {
                    const days = daysUntil(r.deadlineAt);
                    return (
                      <div
                        key={r.id}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${getStatusBg(days, false)}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleComplete(r.id, r.completed)}
                          className="h-5 w-5 shrink-0 rounded-full border border-white/20 transition-colors hover:border-white/40"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{r.title}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs">
                            <span className="text-white/50">{formatDate(r.deadlineAt)}</span>
                            <span className={`font-medium ${getStatusColor(days, false)}`}>
                              {days < 0
                                ? `Overdue by ${Math.abs(days)} days`
                                : days === 0
                                  ? "Due today"
                                  : `${days} days left`}
                            </span>
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                              {REMINDER_TYPES.find((t) => t.value === r.type)?.label || r.type}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteReminder(r.id)}
                          className="shrink-0 rounded-md p-1.5 text-white/30 transition-colors hover:text-red-400"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {completedReminders.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                  Completed ({completedReminders.length})
                </h2>
                <div className="space-y-2">
                  {completedReminders.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 opacity-50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleComplete(r.id, r.completed)}
                        className="h-5 w-5 shrink-0 rounded-full border border-emerald-400/40 bg-emerald-400/20 flex items-center justify-center"
                      >
                        <svg viewBox="0 0 24 24" className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/50 line-through truncate">{r.title}</p>
                        <p className="mt-0.5 text-xs text-white/30">{formatDate(r.deadlineAt)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteReminder(r.id)}
                        className="shrink-0 rounded-md p-1.5 text-white/20 transition-colors hover:text-red-400"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
