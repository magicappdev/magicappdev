import type { TemplateVariable } from "@magicappdev/templates-engine";

interface TemplateVariableFormProps {
  variables: TemplateVariable[];
  values: Record<string, string | boolean | number>;
  onChange: (values: Record<string, string | boolean | number>) => void;
}

export function TemplateVariableForm({
  variables,
  values,
  onChange,
}: TemplateVariableFormProps) {
  const update = (name: string, value: string | boolean | number) => {
    onChange({ ...values, [name]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
        Variables
      </h3>
      {variables.map(v => (
        <div key={v.name} className="space-y-1">
          <label
            htmlFor={`var-${v.name}`}
            className="text-xs font-medium text-zinc-400 flex items-center gap-1.5"
          >
            {v.description || v.name}
            {v.required && <span className="text-red-400 text-[10px]">*</span>}
          </label>

          {v.type === "string" && (
            <input
              id={`var-${v.name}`}
              type="text"
              value={String(values[v.name] ?? "")}
              onChange={e => update(v.name, e.target.value)}
              placeholder={v.default !== undefined ? String(v.default) : ""}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}

          {v.type === "boolean" && (
            <button
              type="button"
              onClick={() => update(v.name, !values[v.name])}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                values[v.name]
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-zinc-900 border-zinc-700 text-zinc-500"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  values[v.name]
                    ? "bg-blue-500 border-blue-500"
                    : "border-zinc-600"
                }`}
              >
                {values[v.name] && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              {v.description || v.name}
            </button>
          )}

          {v.type === "number" && (
            <input
              type="number"
              value={Number(values[v.name] ?? 0)}
              onChange={e => update(v.name, Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}

          {v.type === "select" && v.options && (
            <select
              value={String(values[v.name] ?? "")}
              onChange={e => update(v.name, e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {v.options.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
