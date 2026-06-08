"use client";

import { useState, type KeyboardEvent } from "react";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/** Controlled list-of-strings input (chips). Used for fragrance notes/accords. */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => onChange(value.filter((item) => item !== tag));

  return (
    <div className="rounded-md border border-input p-2 focus-within:ring-2 focus-within:ring-ring">
      {value.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge key={tag} variant="muted" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full hover:text-destructive"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder={placeholder}
        className="w-full bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
