"use client";
import { useEffect, useState } from "react";

type Tmpl = { id: string; text: string; savedAt: number };
const KEY = "hype.templates.v1";

function read(): Tmpl[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(all: Tmpl[]) { localStorage.setItem(KEY, JSON.stringify(all.slice(0, 30))); }

export default function TemplatesMenu({
  currentText,
  onInsert,
}: { currentText: string; onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Tmpl[]>([]);

  useEffect(() => { if (open) setList(read()); }, [open]);

  function save() {
    const t = currentText.trim();
    if (!t) return;
    const all = [{ id: crypto.randomUUID(), text: t, savedAt: Date.now() }, ...read()]
      .filter((v, i, a) => a.findIndex(x => x.text === v.text) === i);
    write(all);
    setList(all);
    setOpen(true);
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(v => !v)}>
        <span className="mr-1">🧩</span> Templates
      </button>
      <button type="button" className="btn-ghost text-sm" onClick={save}>
        <span className="mr-1">💾</span> Save
      </button>

      {open && (
        <div className="menu-surface absolute z-40 mt-10 w-[420px] max-w-[90vw] p-0">
          <div className="px-3 py-2 text-xs opacity-70">Saved prompts</div>
          <div className="max-h-64 overflow-y-auto">
            {list.length === 0 ? (
              <div className="px-3 py-3 text-sm opacity-70">No templates yet.</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {list.map(t => (
                  <li key={t.id} className="flex items-center justify-between px-3 py-2">
                    <button
                      type="button"
                      className="text-left text-sm hover:underline truncate mr-2"
                      onClick={() => onInsert(t.text)}
                      title={t.text}
                    >
                      {t.text}
                    </button>
                    <button
                      type="button"
                      className="text-xs opacity-60 hover:opacity-100"
                      onClick={() => {
                        const next = read().filter(x => x.id !== t.id);
                        write(next); setList(next);
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}