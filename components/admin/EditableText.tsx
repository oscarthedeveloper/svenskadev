"use client";

import { useEffect, useRef } from "react";

export default function EditableText({
  value,
  onChange,
  editing,
  multiline = false,
  placeholder = "Skriv här …",
}: {
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || document.activeElement === element) return;
    if (element.innerText !== value) element.innerText = value;
  }, [value, editing]);

  if (!editing) return <>{value}</>;

  return (
    <span
      ref={ref}
      className="editable-text"
      data-multiline={multiline ? "true" : undefined}
      data-empty={value ? undefined : "true"}
      data-placeholder={placeholder}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      tabIndex={0}
      onPaste={(event) => {
        event.preventDefault();
        document.execCommand(
          "insertText",
          false,
          event.clipboardData.getData("text/plain"),
        );
      }}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") event.currentTarget.blur();
      }}
      onInput={(event) => onChange(event.currentTarget.innerText.replace(/ /g, " "))}
      onBlur={(event) => {
        const nextValue = event.currentTarget.innerText
          .replace(/ /g, " ")
          .trim();
        if (nextValue !== value) onChange(nextValue);
      }}
    />
  );
}
