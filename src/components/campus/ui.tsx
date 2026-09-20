import { cn } from "@/lib/campus/cn";
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "bg-teal text-slate-950 hover:bg-teal-press disabled:opacity-50",
    secondary:
      "bg-surface-2 text-fg border border-border hover:border-muted/40",
    ghost: "bg-transparent text-muted hover:text-fg",
    danger: "bg-danger/15 text-danger hover:bg-danger/25",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors duration-150",
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}

const fieldClass =
  "min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg placeholder:text-muted/80";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, props.className)} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "min-h-24 py-2", props.className)} {...props} />;
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card shadow-[var(--shadow-card)]", className)}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status.includes("READY") || status === "VERIFIED" || status === "COMPLETED" || status === "RETURNED"
      ? "bg-teal/15 text-teal"
      : status.includes("MATCH") || status === "HANDOVER_PENDING"
        ? "bg-accent/15 text-accent"
        : status === "REJECTED"
          ? "bg-danger/15 text-danger"
          : "bg-surface-2 text-muted";
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase", tone)}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors duration-150",
        active ? "bg-fg text-bg" : "bg-surface-2 text-muted",
      )}
    >
      {children}
    </button>
  );
}

export function ChipRow({
  values,
  selected,
  onSelect,
  label,
}: {
  values: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  label?: (value: string) => string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {values.map((value) => (
        <FilterChip key={value} active={selected === value} onClick={() => onSelect(value)}>
          {label ? label(value) : value}
        </FilterChip>
      ))}
    </div>
  );
}
