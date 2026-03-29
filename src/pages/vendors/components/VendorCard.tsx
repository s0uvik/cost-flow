import { Mail, Phone, Receipt, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VendorRow } from "../hooks/useVendors";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-lime-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-fuchsia-500",
  "bg-emerald-500",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

type Props = {
  vendor: VendorRow;
  onEdit: (v: VendorRow) => void;
  onDelete: (v: VendorRow) => void;
};

export function VendorCard({ vendor, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const cat = vendor.categories;

  return (
    <div
      className="rounded-xl border p-5 space-y-4 hover:bg-muted/30 transition-colors cursor-pointer group"
      onClick={() =>
        navigate({ to: "/vendors/$id", params: { id: vendor.id } })
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`size-10 shrink-0 rounded-full ${getAvatarColor(vendor.name)} flex items-center justify-center text-white text-sm font-bold`}
          >
            {getInitials(vendor.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{vendor.name}</p>
            {cat && (
              <span
                className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: cat.color + "22", color: cat.color }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </span>
            )}
          </div>
        </div>
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(vendor)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(vendor)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        {vendor.email && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {vendor.email}
          </p>
        )}
        {vendor.phone && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {vendor.phone}
          </p>
        )}
        {!vendor.email && !vendor.phone && (
          <p className="text-xs text-muted-foreground italic">
            No contact info
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-1 border-t">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Receipt className="h-3.5 w-3.5" />
          <span>
            {vendor.transaction_count} transaction
            {vendor.transaction_count !== 1 ? "s" : ""}
          </span>
        </div>
        {vendor.total_spent > 0 && (
          <Badge variant="secondary" className="text-xs font-medium">
            {formatINR(vendor.total_spent)}
          </Badge>
        )}
      </div>
    </div>
  );
}
