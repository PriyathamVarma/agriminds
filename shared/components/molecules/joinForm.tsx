"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { CONTACT_EMAIL, JOIN_ROLES } from "@/shared/data/agriminds";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm " +
  "text-foreground-heading placeholder:text-foreground-muted " +
  "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition";

export default function JoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(JOIN_ROLES[0].title);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }

    const subject = `AgriMinds — ${role} interest from ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `I'm interested as: ${role}`,
      "",
      message || "(no additional message)",
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    toast.success("Opening your email client — send it across and we'll be in touch!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-surface-card p-7 shadow-xl sm:p-9"
    >
      <h3 className="font-display text-xl font-semibold text-foreground-heading">
        Tell us about you
      </h3>
      <p className="mt-1.5 text-sm text-foreground-muted">
        We&apos;ll open a pre-filled email — send it across and we&apos;ll be in touch.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-foreground-heading">Name</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-foreground-heading">Email</label>
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-foreground-heading">I&apos;m interested as</label>
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
            {JOIN_ROLES.map((r) => (
              <option key={r.title} value={r.title}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-foreground-heading">
            Message <span className="text-foreground-muted">(optional)</span>
          </label>
          <textarea
            className={inputCls}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us a bit about your idea, startup, or city"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover sm:w-auto"
      >
        <Send className="h-4 w-4" />
        Send Interest
      </button>
    </form>
  );
}
