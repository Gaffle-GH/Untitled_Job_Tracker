"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui";
import type { LocationSuggestion } from "@/lib/geocode";
import { searchLocationsApi } from "@/services/authService";

type LocationAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: LocationSuggestion) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  onBlur,
  placeholder = "City, US ZIP, or country",
  className,
  id,
  disabled = false,
}: LocationAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const requestIdRef = useRef(0);

  const updateMenuPosition = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setOpen(true);
    setLoading(true);
    const requestId = ++requestIdRef.current;

    const timer = window.setTimeout(() => {
      void searchLocationsApi(trimmed)
        .then((results) => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions(results);
          setOpen(true);
          setHighlightIndex(-1);
          updateMenuPosition();
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions([]);
          setOpen(true);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setLoading(false);
        });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [value, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onLayout = () => updateMenuPosition();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, suggestions, updateMenuPosition]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      const menu = document.getElementById(listId);
      if (menu?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [listId]);

  const selectSuggestion = useCallback(
    (suggestion: LocationSuggestion) => {
      onChange(suggestion.label);
      onSelect?.(suggestion);
      setOpen(false);
      setHighlightIndex(-1);
    },
    [onChange, onSelect],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (open && highlightIndex >= 0) {
        const picked = suggestions[highlightIndex];
        if (picked) selectSuggestion(picked);
      }
      return;
    }

    if (!open || suggestions.length === 0) {
      if (event.key === "Escape") setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  const showMenu = open && value.trim().length >= 2;
  const menu =
    showMenu && menuPosition ? (
      <ul
        id={listId}
        role="listbox"
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
          zIndex: 9999,
        }}
        className="max-h-60 overflow-y-auto border-[3px] border-black bg-white brutal-shadow-lg"
      >
        {loading ? (
          <li className="px-3 py-2.5 text-xs font-medium text-black/55">Searching places…</li>
        ) : null}

        {!loading && suggestions.length === 0 ? (
          <li className="px-3 py-2.5 text-xs font-medium text-black/55">
            No places found — try a city or country name
          </li>
        ) : null}

        {suggestions.map((suggestion, index) => {
          const highlighted = index === highlightIndex;
          return (
            <li key={suggestion.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={highlighted}
                className={clsx(
                  "flex w-full items-start gap-2 border-b border-black/10 px-3 py-2.5 text-left last:border-b-0",
                  highlighted ? "bg-accent-cyan/50" : "bg-white hover:bg-accent-yellow/40",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => selectSuggestion(suggestion)}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight">{suggestion.label}</span>
                  <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-black/55">
                    {suggestion.country} · {suggestion.continent}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <Input
        ref={inputRef}
        id={id}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showMenu}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => {
          if (value.trim().length >= 2) {
            setOpen(true);
            updateMenuPosition();
          }
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            onBlur?.();
          }, 180);
        }}
        onKeyDown={onKeyDown}
      />

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
