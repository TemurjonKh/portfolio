"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioContent } from "@/lib/content";
import { AdminWebMcp } from "@/components/AdminWebMcp";
import { mediaKind, TRACKS } from "@/lib/media";

type Section = "profile" | "quickFact" | "education" | "project" | "skillGroup" | "certificate" | "achievement" | "volunteer" | "activity" | "interest" | "language" | "attachment" | "security";
type ListSection = Exclude<Section, "profile" | "security">;
type Row = Record<string, unknown> & { id: string };
type Field = { key: string; label: string; type?: "text" | "textarea" | "date" | "url" | "upload" | "multiUpload" | "select"; hint?: string; options?: readonly { id: string; label: string }[] };

const LIST_FIELDS: Record<string, string> = { coursework: "\n", description: "\n", metricLines: "\n", stackTags: ",", items: "," };

const sectionLabels: Record<Section, string> = {
  profile: "Profile / About",
  quickFact: "Quick facts",
  education: "Education",
  project: "Projects",
  skillGroup: "Skills",
  certificate: "Certificates",
  achievement: "Achievements",
  volunteer: "Volunteer Experience",
  activity: "Activities",
  interest: "Interests",
  language: "Languages",
  attachment: "Research / Attachments",
  security: "Password & security",
};

const listSections = Object.keys(sectionLabels).filter(key => key !== "profile" && key !== "security") as ListSection[];

const fields: Record<ListSection, Field[]> = {
  quickFact: [{ key: "label", label: "Label" }, { key: "value", label: "Value" }],
  education: [
    { key: "institution", label: "Institution" },
    { key: "degree", label: "Degree" },
    { key: "location", label: "Location" },
    { key: "startDate", label: "Start date", type: "date" },
    { key: "endDate", label: "End date", type: "date" },
    { key: "endDateLabel", label: "Display end date" },
    { key: "gpa", label: "GPA" },
    { key: "coursework", label: "Coursework", type: "textarea", hint: "One course per line" },
  ],
  project: [
    { key: "title", label: "Title" },
    { key: "role", label: "Role / context" },
    { key: "dateLabel", label: "Date range" },
    { key: "status", label: "Status", hint: "e.g. In development" },
    { key: "track", label: "Type (which shelf it appears on)", type: "select", options: TRACKS },
    { key: "visibility", label: "Visibility", type: "select", options: [{ id: "public", label: "Public: show everything" }, { id: "teaser", label: "Teaser: hide details until launch" }] },
    { key: "teaser", label: "Card summary", type: "textarea", hint: "One sentence shown on the project card. For Teaser projects, it is the only description shown." },
    { key: "stackTags", label: "Tech stack", type: "textarea", hint: "Comma-separated" },
    { key: "description", label: "Description bullets", type: "textarea", hint: "One bullet per line" },
    { key: "githubUrl", label: "GitHub URL", type: "url" },
    { key: "metricLines", label: "Results", type: "textarea", hint: "One per line, as: label | value (e.g. Q-learning win rate | 98%)" },
    { key: "demoUrl", label: "Demo URL", type: "url" },
    { key: "images", label: "Project images and videos", type: "multiUpload", hint: "Images, MP4/WebM videos, or a YouTube link. Leave empty and the project shows without a media area." },
  ],
  skillGroup: [{ key: "label", label: "Group name", hint: "e.g. Machine learning" }, { key: "items", label: "Skills", type: "textarea", hint: "Comma-separated" }],
  certificate: [{ key: "title", label: "Title" }, { key: "issuer", label: "Issuer" }, { key: "imageUrl", label: "Certificate scan", type: "upload" }],
  achievement: [{ key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea" }],
  volunteer: [{ key: "title", label: "Role / title" }, { key: "org", label: "Organization" }, { key: "dateLabel", label: "Date range" }, { key: "description", label: "Description", type: "textarea" }, { key: "images", label: "Volunteer images", type: "multiUpload", hint: "Upload one image for a full view, or several for the shared carousel." }],
  activity: [{ key: "title", label: "Title" }, { key: "org", label: "Organization" }, { key: "location", label: "Location" }, { key: "dateLabel", label: "Date range" }, { key: "description", label: "Description", type: "textarea" }, { key: "images", label: "Activity images", type: "multiUpload", hint: "Upload one image for a full view, or several for the shared carousel." }],
  interest: [{ key: "label", label: "Interest" }, { key: "imageUrl", label: "Optional image", type: "upload" }],
  language: [{ key: "name", label: "Language" }, { key: "level", label: "Proficiency" }],
  attachment: [{ key: "label", label: "Label" }, { key: "category", label: "Category" }, { key: "fileUrl", label: "PDF or attachment", type: "upload" }],
};

function serializeContent(content: PortfolioContent) {
  return {
    quickFact: content.profile?.quickFacts || [],
    education: content.education,
    project: content.projects,
    skillGroup: content.skillGroups,
    certificate: content.certificates,
    achievement: content.achievements,
    volunteer: content.volunteers,
    activity: content.activities,
    interest: content.interests,
    language: content.languages,
    attachment: content.attachments,
  } as unknown as Record<ListSection, Row[]>;
}

export function AdminDashboardV2({ initialContent, email }: { initialContent: PortfolioContent; email: string }) {
  const router = useRouter();
  const [section, setSection] = useState<Section>("profile");
  const [content, setContent] = useState(() => serializeContent(initialContent));
  const [profile, setProfile] = useState<Row>(() => initialContent.profile as unknown as Row);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setContent(serializeContent(initialContent));
    setProfile(initialContent.profile as unknown as Row);
  }, [initialContent]);

  useEffect(() => {
    const listener = (event: Event) => setSection((event as CustomEvent<Section>).detail);
    window.addEventListener("admin:navigate", listener);
    return () => window.removeEventListener("admin:navigate", listener);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function saved(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#eef1f5]">
      <AdminWebMcp />
      <header className="sticky top-0 z-30 border-b hairline bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-8">
          <div><strong className="display text-2xl">TK / Editor</strong><span className="ml-4 hidden text-xs text-[var(--muted)] sm:inline">{email}</span></div>
          <div className="flex gap-4 text-sm font-semibold"><a href="/" target="_blank" className="focus-ring text-[var(--accent)]">View site ↗</a><button onClick={logout} className="focus-ring text-[var(--muted)]">Sign out</button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 md:px-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit overflow-x-auto border hairline bg-white p-3 lg:sticky lg:top-24">
          <nav className="flex gap-2 lg:grid">
            {(Object.keys(sectionLabels) as Section[]).map(key => (
              <button key={key} onClick={() => setSection(key)} className={"focus-ring whitespace-nowrap px-4 py-3 text-left text-sm font-semibold transition-colors " + (section === key ? "bg-[var(--ink)] text-white" : "hover:bg-[var(--paper)]")}>{sectionLabels[key]}</button>
            ))}
          </nav>
        </aside>
        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div><p className="eyebrow mb-2">Owner dashboard</p><h1 className="display text-4xl font-semibold md:text-5xl">{sectionLabels[section]}</h1></div>
            {notice && <p role="status" className="border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>}
          </div>
          {section === "profile" && <ProfileEditor profile={profile} onChange={setProfile} onSaved={() => saved("Profile saved.")} />}
          {section === "security" && <PasswordEditor onSaved={() => saved("Password updated. Other sessions were signed out.")} />}
          {listSections.includes(section as ListSection) && (
            <ListEditor
              type={section as ListSection}
              rows={content[section as ListSection]}
              setRows={rows => setContent(previous => ({ ...previous, [section]: rows }))}
              onSaved={saved}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileEditor({ profile, onChange, onSaved }: { profile: Row; onChange: (value: Row) => void; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const profileFields: Field[] = [
    { key: "name", label: "Name" },
    { key: "tagline", label: "Tagline", type: "textarea" },
    { key: "aboutText", label: "About", type: "textarea" },
    { key: "email", label: "Public email" },
    { key: "githubUrl", label: "GitHub URL", type: "url" },
    { key: "linkedinUrl", label: "LinkedIn URL", type: "url" },
    { key: "instagramUrl", label: "Instagram URL", type: "url" },
    { key: "kaggleUrl", label: "Kaggle URL", type: "url" },
    { key: "resumeUrl", label: "Resume PDF (shows the Resume buttons when set)", type: "upload" },
    { key: "photoUrl", label: "Hero portrait", type: "upload" },
  ];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await api({ action: "update", type: "profile", data: profile });
    setBusy(false);
    if (!response.ok) return setError(response.error);
    onSaved();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 border hairline bg-white p-5 md:grid-cols-2 md:p-8">
      {profileFields.map(field => <EditorField key={field.key} field={field} value={profile[field.key]} onChange={value => onChange({ ...profile, [field.key]: value })} />)}
      <FormMessage error={error} />
      <div className="md:col-span-2"><SaveButton busy={busy} label="Save profile" /></div>
    </form>
  );
}

function ListEditor({ type, rows, setRows, onSaved }: { type: ListSection; rows: Row[]; setRows: (rows: Row[]) => void; onSaved: (message: string) => void }) {
  const blank = useMemo(() => Object.fromEntries(fields[type].map(field => [field.key, displayValue(type, field.key, undefined)])) as Row, [type]);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    const response = await api({ action: "reorder", type, ids: next.map(row => row.id) });
    if (response.ok) onSaved("Order updated.");
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    const response = await api({ action: "delete", type, id });
    if (response.ok) {
      setRows(rows.filter(row => row.id !== id));
      onSaved("Item deleted.");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex justify-end"><button onClick={() => setRows([...rows, { ...blank, id: "new-" + Date.now() }])} className="focus-ring bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white">+ Add item</button></div>
      {rows.length ? rows.map((row, index) => (
        <ItemEditor
          key={row.id}
          type={type}
          row={row}
          onChange={next => setRows(rows.map(current => current.id === row.id ? next : current))}
          onSaved={onSaved}
          onDelete={() => row.id.startsWith("new-") ? setRows(rows.filter(current => current.id !== row.id)) : remove(row.id)}
          onMove={direction => move(index, direction)}
          first={index === 0}
          last={index === rows.length - 1}
          number={index + 1}
        />
      )) : <div className="border border-dashed hairline bg-white p-10 text-center text-[var(--muted)]">No entries yet. Add one whenever you are ready.</div>}
    </div>
  );
}

function ItemEditor({ type, row, onChange, onSaved, onDelete, onMove, first, last, number }: { type: ListSection; row: Row; onChange: (row: Row) => void; onSaved: (message: string) => void; onDelete: () => void; onMove: (direction: -1 | 1) => void; first: boolean; last: boolean; number: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isNew = row.id.startsWith("new-");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await api({ action: isNew ? "create" : "update", type, id: isNew ? undefined : row.id, data: normalizeForApi(type, row) });
    setBusy(false);
    if (!response.ok) return setError(response.error);
    if (isNew && response.data?.id) onChange({ ...row, ...response.data });
    onSaved(isNew ? "Item added." : "Changes saved.");
  }

  return (
    <form onSubmit={submit} className="border hairline bg-white p-5 md:p-7">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">{isNew ? "New item" : "Item " + String(number).padStart(2, "0")}</span>
        <div className="flex gap-2">
          <button type="button" disabled={first} onClick={() => onMove(-1)} aria-label="Move up" className="focus-ring border hairline px-3 py-2 disabled:opacity-30">↑</button>
          <button type="button" disabled={last} onClick={() => onMove(1)} aria-label="Move down" className="focus-ring border hairline px-3 py-2 disabled:opacity-30">↓</button>
          <button type="button" onClick={onDelete} className="focus-ring border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Delete</button>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {fields[type].map(field => <EditorField key={field.key} field={field} value={displayValue(type, field.key, row[field.key])} onChange={value => onChange({ ...row, [field.key]: value })} />)}
      </div>
      <FormMessage error={error} />
      <div className="mt-6"><SaveButton busy={busy} label={isNew ? "Add item" : "Save changes"} /></div>
    </form>
  );
}

function EditorField({ field, value, onChange }: { field: Field; value: unknown; onChange: (value: unknown) => void }) {
  if (field.type === "multiUpload") return <MultiUploadField label={field.label} hint={field.hint} value={Array.isArray(value) ? value : []} onChange={onChange} />;
  const stringValue = Array.isArray(value)
    ? value.join(LIST_FIELDS[field.key] === "," ? ", " : "\n")
    : field.type === "date" && value
      ? new Date(String(value)).toISOString().slice(0, 10)
      : String(value ?? "");
  if (field.type === "upload") return <UploadField label={field.label} value={stringValue} onChange={value => onChange(value)} />;
  if (field.type === "select") {
    return (
      <label className="grid gap-2 text-sm font-semibold">
        {field.label}
        <select name={field.key} value={stringValue} onChange={event => onChange(event.target.value)} className="focus-ring w-full border hairline bg-white px-4 py-3 font-normal">
          {field.options?.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </label>
    );
  }
  const shared = {
    name: field.key,
    value: stringValue,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    className: "focus-ring w-full border hairline bg-white px-4 py-3 font-normal",
    placeholder: field.hint,
  };
  return (
    <label className={"grid gap-2 text-sm font-semibold " + (field.type === "textarea" ? "md:col-span-2" : "")}>
      {field.label}
      {field.type === "textarea" ? <textarea {...shared} rows={field.key === "description" || field.key === "aboutText" ? 5 : 3} /> : <input {...shared} type={field.type || "text"} />}
      {field.hint && <span className="text-xs font-normal text-[var(--muted)]">{field.hint}</span>}
    </label>
  );
}

function UploadField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setError(result.error);
    onChange(result.url);
  }

  const image = value && !value.toLowerCase().endsWith(".pdf");
  return (
    <label className="grid gap-2 text-sm font-semibold md:col-span-2">
      {label}
      <span onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void upload(event.dataTransfer.files[0]); }} className="grid min-h-36 cursor-pointer place-items-center border border-dashed border-[var(--accent)] bg-[var(--accent-soft)]/20 p-4 text-center">
        {image ? <span className="relative block h-28 w-full max-w-sm overflow-hidden"><Image src={value} alt="Upload preview" fill sizes="384px" className="object-contain" /></span> : value ? <span><strong className="block">Attachment uploaded</strong><small className="text-[var(--muted)]">{value}</small></span> : <span><strong className="block">{busy ? "Uploading…" : "Drop a file or choose one"}</strong><small className="mt-1 block text-[var(--muted)]">JPG, PNG, WebP, AVIF, or PDF · up to 10 MB</small></span>}
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" onChange={event => void upload(event.target.files?.[0])} />
      </span>
      {value && <button type="button" onClick={() => onChange("")} className="focus-ring w-fit text-xs text-red-700">Remove file</button>}
      {error && <span className="text-sm font-normal text-red-700">{error}</span>}
    </label>
  );
}

function MultiUploadField({ label, hint, value, onChange }: { label: string; hint?: string; value: unknown[]; onChange: (value: unknown) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const items = value.map((item, index) => typeof item === "string" ? { id: "media-" + index, url: item } : item as { id?: string; url: string });

  async function upload(files: FileList | File[]) {
    setBusy(true);
    setError("");
    const added: { id: string; url: string }[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = await response.json().catch(() => ({ error: "The upload didn’t finish. Please try again." }));
      if (!response.ok) {
        setBusy(false);
        if (added.length) onChange([...items, ...added]);
        return setError(result.error);
      }
      added.push({ id: "new-media-" + Date.now() + "-" + added.length, url: result.url });
    }
    onChange([...items, ...added]);
    setBusy(false);
  }

  function addLink() {
    const url = link.trim();
    if (!/^https:\/\//.test(url)) return setError("Paste a full https:// link, such as a YouTube video.");
    setError("");
    onChange([...items, { id: "new-link-" + Date.now(), url }]);
    setLink("");
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="grid gap-3 md:col-span-2">
      <span className="text-sm font-semibold">{label}</span>
      {items.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => {
        const kind = mediaKind(item.url);
        return (
          <div key={(item.id || "media") + index} className="border hairline p-3">
            <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-[var(--paper)]">
              {kind === "image" && <Image src={item.url} alt={"Uploaded image " + (index + 1)} fill sizes="260px" className="object-contain" />}
              {kind === "video" && <video src={item.url} muted preload="metadata" className="h-full w-full object-contain" />}
              {kind === "youtube" && <span className="px-3 text-center text-xs text-[var(--muted)]">YouTube video<br />{item.url}</span>}
            </div>
            <div className="mt-3 flex justify-between gap-2">
              <div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move earlier" className="border hairline px-2 py-1 disabled:opacity-30">←</button><button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move later" className="border hairline px-2 py-1 disabled:opacity-30">→</button></div>
              <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-semibold text-red-700">Remove</button>
            </div>
          </div>
        );
      })}</div>}
      <label onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void upload(event.dataTransfer.files); }} className="grid min-h-28 cursor-pointer place-items-center border border-dashed border-[var(--accent)] bg-[var(--accent-soft)]/20 p-4 text-center">
        <span><strong className="block">{busy ? "Uploading…" : "Drop images or videos, or choose files"}</strong><small className="mt-1 block text-[var(--muted)]">{hint} Images and PDFs up to 10 MB, videos up to 40 MB.</small></span>
        <input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" onChange={event => event.target.files && void upload(event.target.files)} />
      </label>
      <div className="flex gap-2">
        <input value={link} onChange={event => setLink(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addLink(); } }} placeholder="https://youtu.be/… or a direct .mp4 link" className="focus-ring w-full border hairline bg-white px-4 py-3 text-sm" />
        <button type="button" onClick={addLink} className="focus-ring whitespace-nowrap border hairline px-4 text-sm font-semibold">Add link</button>
      </div>
      {error && <span className="text-sm text-red-700">{error}</span>}
    </div>
  );
}

function PasswordEditor({ onSaved }: { onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("newPassword") !== form.get("confirm")) return setError("The new passwords do not match.");
    setBusy(true);
    setError("");
    const response = await api({ endpoint: "/api/admin/change-password", currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") });
    setBusy(false);
    if (!response.ok) return setError(response.error);
    event.currentTarget.reset();
    onSaved();
  }

  return <form onSubmit={submit} className="grid max-w-2xl gap-5 border hairline bg-white p-6"><FieldInput label="Current password" name="currentPassword" /><FieldInput label="New password" name="newPassword" /><FieldInput label="Confirm new password" name="confirm" /><p className="text-xs leading-5 text-[var(--muted)]">Use at least 12 characters. Saving signs out all other active sessions.</p><FormMessage error={error} /><SaveButton busy={busy} label="Change password" /></form>;
}

function FieldInput({ label, name }: { label: string; name: string }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input required minLength={name === "currentPassword" ? 1 : 12} name={name} type="password" autoComplete={name === "currentPassword" ? "current-password" : "new-password"} className="focus-ring h-12 border hairline px-4 font-normal" /></label>;
}

function SaveButton({ busy, label }: { busy: boolean; label: string }) {
  return <button disabled={busy} className="focus-ring bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : label}</button>;
}

function FormMessage({ error }: { error: string }) {
  return error ? <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800 md:col-span-2">{error}</p> : null;
}

function displayValue(type: Section, key: string, value: unknown) {
  if (value !== undefined && value !== null) return value;
  if (key === "images" || key in LIST_FIELDS && !(type !== "project" && key === "description")) return [];
  if (key === "track") return "systems";
  if (key === "visibility") return "public";
  return "";
}

function toList(value: unknown, separator: string) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value ?? "").split(separator).map(item => item.trim()).filter(Boolean);
}

function normalizeForApi(type: Section, row: Row) {
  const { id: _id, order: _order, updatedAt: _updatedAt, ...data } = row;
  if (type === "project") {
    delete data.imageUrl;
    data.stackTags = toList(row.stackTags, ",");
    data.description = toList(row.description, "\n");
    data.metricLines = toList(row.metricLines, "\n");
    data.track = row.track || "systems";
    data.visibility = row.visibility || "public";
    delete data.metrics;
    data.images = (Array.isArray(row.images) ? row.images : []).map(item => typeof item === "string" ? item : String((item as { url?: string }).url || "")).filter(Boolean);
  }
  if (type === "activity") {
    data.images = (Array.isArray(row.images) ? row.images : []).map(item => typeof item === "string" ? item : String((item as { url?: string }).url || "")).filter(Boolean);
  }
  if (type === "volunteer") {
    data.images = (Array.isArray(row.images) ? row.images : []).map(item => typeof item === "string" ? item : String((item as { url?: string }).url || "")).filter(Boolean);
  }
  if (type === "education") data.coursework = toList(row.coursework, "\n");
  if (type === "skillGroup") data.items = toList(row.items, ",");
  return data;
}

async function api(body: Record<string, unknown>) {
  try {
    const endpoint = String(body.endpoint || "/api/admin/content");
    const payload = { ...body };
    delete payload.endpoint;
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    return { ok: response.ok, error: data.error || "That change could not be saved. Please try again.", data };
  } catch {
    return { ok: false, error: "The server could not be reached. Please try again.", data: null };
  }
}
