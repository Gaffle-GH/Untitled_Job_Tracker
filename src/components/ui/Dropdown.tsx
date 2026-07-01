"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";

export type DropdownOption = {
  value: string;
  label: string;
  backgroundColor?: string;
  color?: string;
};

type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  className?: string;
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
  variant?: "default" | "badge";
  align?: "left" | "right";
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

export function Dropdown({
  value,
  onChange,
  options,
  className,
  id,
  "aria-label": ariaLabel,
  disabled = false,
  variant = "default",
  align = "left",
  triggerClassName,
  triggerStyle,
}: DropdownProps) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex] ?? options[0];

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, variant === "badge" ? 160 : rect.width);

    setMenuPosition({
      top: rect.bottom + 4,
      left: align === "right" ? rect.right - width : rect.left,
      width,
    });
  }, [align, variant]);

  const close = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, []);

  const selectOption = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      close();
      triggerRef.current?.focus();
    },
    [close, onChange],
  );

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const onScrollOrResize = () => updateMenuPosition();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (document.getElementById(listId)?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, listId, open, updateMenuPosition]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        const pick = highlightIndex >= 0 ? options[highlightIndex] : selected;
        if (pick) selectOption(pick.value);
        return;
      }

      setHighlightIndex((current) => {
        const base = current >= 0 ? current : selectedIndex >= 0 ? selectedIndex : 0;
        if (event.key === "ArrowDown") return (base + 1) % options.length;
        return (base - 1 + options.length) % options.length;
      });
    }
  };

  const fullWidth = className?.includes("w-full");

  const menu =
    open && menuPosition && typeof document !== "undefined"
      ? createPortal(
          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="fixed z-[100] max-h-60 overflow-y-auto border-[3px] border-black bg-white py-1 brutal-shadow-lg"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightIndex;

              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => selectOption(option.value)}
                    className={clsx(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-bold uppercase tracking-wide outline-none",
                      variant === "badge" && "text-[10px] normal-case",
                      isSelected && "bg-accent-yellow",
                      !isSelected && isHighlighted && "bg-accent-cyan/35",
                      !isSelected && !isHighlighted && "bg-white hover:bg-accent-cyan/25",
                    )}
                    style={
                      variant === "badge"
                        ? {
                            backgroundColor: isSelected || isHighlighted ? undefined : option.backgroundColor,
                            color: option.color,
                          }
                        : undefined
                    }
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {isSelected ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <>
      <div className={clsx("relative", fullWidth ? "w-full" : "inline-flex w-fit", className)}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={ariaLabel}
          onClick={() => {
            if (disabled) return;
            if (open) {
              close();
              return;
            }
            updateMenuPosition();
            setOpen(true);
            setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
          }}
          onKeyDown={handleTriggerKeyDown}
          className={clsx(
            "flex w-full items-center justify-between gap-2 border-[3px] border-black bg-white text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-accent-cyan disabled:cursor-not-allowed disabled:opacity-50",
            variant === "default" && "min-h-10 px-3 py-2 brutal-shadow-sm",
            variant === "badge" &&
              "min-h-[1.625rem] border-2 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-tight brutal-shadow-sm",
            triggerClassName,
          )}
          style={
            variant === "badge" && selected
              ? {
                  backgroundColor: selected.backgroundColor,
                  color: selected.color,
                  ...triggerStyle,
                }
              : triggerStyle
          }
        >
          <span className="min-w-0 truncate text-left">{selected?.label ?? "Select"}</span>
          <ChevronDown
            className={clsx(
              "shrink-0 transition-transform",
              variant === "badge" ? "h-3 w-3" : "h-4 w-4",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </div>
      {menu}
    </>
  );
}
