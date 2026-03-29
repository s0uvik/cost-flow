import { useParams, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { InvoiceStatusBadge } from "@/pages/invoices/components/InvoiceStatusBadge";
import { supabase } from "@/lib/supabase";
import type { InvoiceStatus } from "@/pages/invoices/hooks/useInvoices";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function useClientDetail(id: string) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;

      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, status, issue_date, due_date, total")
        .eq("client_id", id)
        .order("issue_date", { ascending: false });

      const all = invoices ?? [];
      const stats = {
        total: all.reduce((s, i) => s + i.total, 0),
        paid: all
          .filter((i) => i.status === "paid")
          .reduce((s, i) => s + i.total, 0),
        outstanding: all
          .filter((i) => ["sent", "overdue"].includes(i.status))
          .reduce((s, i) => s + i.total, 0),
        count: all.length,
      };

      return { client, invoices: all, stats };
    },
    enabled: !!id,
  });
}

export function ClientDetailPage() {
  const { id } = useParams({ from: "/_app/clients/$id" });
  const navigate = useNavigate();
  const { data, isLoading } = useClientDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Client not found.
      </div>
    );
  }

  const { client, invoices, stats } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={client.company ?? "Client"}
        action={
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/clients" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {client.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{client.company}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a
                  href={`mailto:${client.email}`}
                  className="text-primary hover:underline"
                >
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap">{client.address}</span>
              </div>
            )}
            {client.notes && (
              <p className="text-muted-foreground border-t pt-3 mt-3 whitespace-pre-wrap">
                {client.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Total Invoiced */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR(stats.total)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.count} invoice{stats.count !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Paid + Outstanding */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-green-600">
                {formatINR(stats.paid)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-amber-600">
                {formatINR(stats.outstanding)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Invoice History</CardTitle>
          <Button size="sm" onClick={() => navigate({ to: "/invoices/new" })}>
            New Invoice
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium text-muted-foreground">
                    Invoice #
                  </th>
                  <th className="text-left pb-3 font-medium text-muted-foreground">
                    Issue Date
                  </th>
                  <th className="text-left pb-3 font-medium text-muted-foreground">
                    Due Date
                  </th>
                  <th className="text-left pb-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right pb-3 font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() =>
                      navigate({ to: "/invoices/$id", params: { id: inv.id } })
                    }
                  >
                    <td className="py-3 font-mono font-medium">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {format(parseISO(inv.issue_date), "dd MMM yyyy")}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {format(parseISO(inv.due_date), "dd MMM yyyy")}
                    </td>
                    <td className="py-3">
                      <InvoiceStatusBadge
                        status={inv.status as InvoiceStatus}
                      />
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {formatINR(inv.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
