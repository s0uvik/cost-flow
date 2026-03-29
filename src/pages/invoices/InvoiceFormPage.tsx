import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { InvoiceForm } from "./components/InvoiceForm";
import { generateInvoiceNumber } from "./hooks/useInvoices";
import { supabase } from "@/lib/supabase";

export function InvoiceFormPage() {
  const navigate = useNavigate();
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        generateInvoiceNumber(user.id).then(setInvoiceNumber);
      }
    });
  }, []);

  if (!invoiceNumber) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Invoice"
        description="Create a new invoice for your client"
        action={
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/invoices" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <InvoiceForm
        invoiceNumber={invoiceNumber}
        onCancel={() => navigate({ to: "/invoices" })}
        onSaved={(id) => navigate({ to: "/invoices/$id", params: { id } })}
      />
    </div>
  );
}
