"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authInputCls } from "@/shared/components/auth/formField";
import StatusBadge, { toneForStatus } from "@/shared/components/dashboard/statusBadge";

type ChapterProfile = {
  name: string;
  code: string;
  type: string;
  city: string;
  district: string;
  state: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  mission: string;
  logoUrl: string;
  coverImageUrl: string;
  status: string;
  isPublic: boolean;
  socialLinks?: { website?: string; linkedin?: string; instagram?: string; x?: string };
};

const labelCls = "mb-1.5 block text-sm font-medium text-foreground-heading";

export default function ChapterProfileForm({ chapterId, initial }: { chapterId: string; initial: ChapterProfile }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ChapterProfile>(key: K, value: ChapterProfile[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
      toast.success("Chapter profile updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge label={form.status} tone={toneForStatus(form.status)} />
        <StatusBadge label={form.isPublic ? "Public" : "Not public yet"} tone={form.isPublic ? "success" : "neutral"} />
        <span className="text-xs text-foreground-muted">Code: {form.code}</span>
      </div>
      <p className="mt-2 text-xs text-foreground-muted">Status and public visibility are set by the AgriMinds team once your submission is reviewed.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Chapter name</label>
          <input className={authInputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input className={authInputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>District</label>
          <input className={authInputCls} value={form.district} onChange={(e) => set("district", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>State</label>
          <input className={authInputCls} value={form.state} onChange={(e) => set("state", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Chapter type</label>
          <select className={authInputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="district">District</option>
            <option value="state">State</option>
            <option value="institutional">Institutional</option>
            <option value="regional">Regional</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Address</label>
          <input className={authInputCls} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Contact email</label>
          <input className={authInputCls} type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Contact phone</label>
          <input className={authInputCls} value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea className={authInputCls} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Mission / local focus</label>
          <textarea className={authInputCls} rows={3} value={form.mission} onChange={(e) => set("mission", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Logo URL</label>
          <input className={authInputCls} value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://res.cloudinary.com/…" />
        </div>
        <div>
          <label className={labelCls}>Cover image URL</label>
          <input className={authInputCls} value={form.coverImageUrl} onChange={(e) => set("coverImageUrl", e.target.value)} placeholder="https://res.cloudinary.com/…" />
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input className={authInputCls} value={form.socialLinks?.website || ""} onChange={(e) => set("socialLinks", { ...form.socialLinks, website: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>LinkedIn</label>
          <input className={authInputCls} value={form.socialLinks?.linkedin || ""} onChange={(e) => set("socialLinks", { ...form.socialLinks, linkedin: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Instagram</label>
          <input className={authInputCls} value={form.socialLinks?.instagram || ""} onChange={(e) => set("socialLinks", { ...form.socialLinks, instagram: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>X (Twitter)</label>
          <input className={authInputCls} value={form.socialLinks?.x || ""} onChange={(e) => set("socialLinks", { ...form.socialLinks, x: e.target.value })} />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-7 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
