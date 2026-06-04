"use client";

import type { FarmField } from "@/lib/types";
import { MAX_FIELDS, newFieldId } from "@/lib/fields-storage";

const EMOJIS = ["🌽", "🍃", "🫘", "🥬", "🌻", "🍠", "🌾", "🐄"];

interface FieldEditorProps {
  fields: FarmField[];
  onChange: (fields: FarmField[]) => void;
}

export function FieldEditor({ fields, onChange }: FieldEditorProps) {
  const update = (id: string, patch: Partial<FarmField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const remove = (id: string) => {
    if (fields.length <= 1) return;
    onChange(fields.filter((f) => f.id !== id));
  };

  const add = () => {
    if (fields.length >= MAX_FIELDS) return;
    onChange([
      ...fields,
      {
        id: newFieldId(),
        name: "New shamba plot",
        lat: -1.2921,
        lon: 36.8219,
        crop: "mixed",
        emoji: "🌾",
      },
    ]);
  };

  return (
    <section className="paper-card p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-2xl text-soil">Your shamba plots</h2>
          <p className="text-sm text-soil/70 font-hand">
            Save up to {MAX_FIELDS} fields — stored on this device
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={fields.length >= MAX_FIELDS}
          className="btn-secondary text-sm disabled:opacity-40"
        >
          + Add plot
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {fields.map((field) => (
          <div
            key={field.id}
            className="rounded-2xl border-2 border-dashed border-wheat/80 bg-cream/60 p-4 relative"
          >
            <div className="flex gap-2 mb-3 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => update(field.id, { emoji: e })}
                  className={`text-xl rounded-full w-9 h-9 transition-transform hover:scale-110 ${
                    field.emoji === e
                      ? "bg-sun ring-2 ring-soil/30 scale-110"
                      : "bg-white/80"
                  }`}
                  aria-label={`Icon ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold text-soil/60 mb-1">
              Plot name
            </label>
            <input
              className="input-field mb-2"
              value={field.name}
              onChange={(e) => update(field.id, { name: e.target.value })}
            />

            <label className="block text-xs font-semibold text-soil/60 mb-1">
              Crop (optional)
            </label>
            <input
              className="input-field mb-2"
              placeholder="maize, tea, beans…"
              value={field.crop ?? ""}
              onChange={(e) => update(field.id, { crop: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-soil/60 mb-1">
                  Lat
                </label>
                <input
                  type="number"
                  step="any"
                  className="input-field text-sm"
                  value={field.lat}
                  onChange={(e) =>
                    update(field.id, { lat: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-soil/60 mb-1">
                  Lon
                </label>
                <input
                  type="number"
                  step="any"
                  className="input-field text-sm"
                  value={field.lon}
                  onChange={(e) =>
                    update(field.id, { lon: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(field.id)}
                className="mt-3 text-xs text-barn hover:underline font-hand"
              >
                Remove plot
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
