import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  type Template,
  type TemplateCategory,
} from "../templates.js";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TemplateGalleryProps {
  onSelect: (template: Template) => void;
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const [activeTab, setActiveTab] = useState<TemplateCategory>("all");
  const filtered =
    activeTab === "all"
      ? TEMPLATES
      : TEMPLATES.filter(t => t.category === activeTab);

  return (
    <div>
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === cat.id
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(template => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className="group text-left rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
          >
            <div
              className={cn(
                "h-28 flex items-center justify-center text-4xl bg-gradient-to-br",
                template.gradientFrom,
                template.gradientTo,
              )}
            >
              {template.emoji}
            </div>
            <div className="p-3 bg-zinc-900">
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-white leading-tight">
                  {template.name}
                </span>
                {!template.free && (
                  <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    PRO
                  </span>
                )}
                {template.category === "component" && (
                  <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    COMPONENT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2 mb-2">
                {template.description}
              </p>
              {template.preview && (
                <p className="text-[10px] text-zinc-600 line-clamp-1 mb-2">
                  {template.preview}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <Star className="w-2.5 h-2.5 fill-zinc-600" />
                <span>{template.likes.toLocaleString()}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
