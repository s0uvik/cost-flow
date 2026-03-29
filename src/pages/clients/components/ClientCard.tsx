import { Mail, Phone, Building2, FileText, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ClientRow } from "../hooks/useClients";

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
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

type Props = {
  client: ClientRow;
  onEdit: (c: ClientRow) => void;
  onDelete: (c: ClientRow) => void;
};

export function ClientCard({ client, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl border p-5 space-y-4 hover:bg-muted/30 transition-colors cursor-pointer group"
      onClick={() =>
        navigate({ to: "/clients/$id", params: { id: client.id } })
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`size-10 shrink-0 rounded-full ${getAvatarColor(client.name)} flex items-center justify-center text-white text-sm font-bold`}
          >
            {getInitials(client.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{client.name}</p>
            {client.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3 shrink-0" />
                {client.company}
              </p>
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
            onClick={() => onEdit(client)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(client)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5">
        {client.email && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {client.email}
          </p>
        )}
        {client.phone && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {client.phone}
          </p>
        )}
      </div>

      {/* Invoice stats */}
      <div className="flex items-center justify-between pt-1 border-t">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>
            {client.invoice_count} invoice
            {client.invoice_count !== 1 ? "s" : ""}
          </span>
        </div>
        {client.total_billed > 0 && (
          <Badge variant="secondary" className="text-xs font-medium">
            {formatINR(client.total_billed)}
          </Badge>
        )}
      </div>
    </div>
  );
}
