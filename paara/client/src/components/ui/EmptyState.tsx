import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-20 h-20 rounded-full bg-[#FFF8EC] grid place-items-center mb-6 shadow-sm">
        <Icon size={32} className="text-[#C9921A]" strokeWidth={1.5} />
      </div>
      <h3 className="display-serif text-2xl text-[#1C3A2A] mb-2">{title}</h3>
      <p className="text-[#6B645A] text-sm leading-relaxed max-w-xs mb-8">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
