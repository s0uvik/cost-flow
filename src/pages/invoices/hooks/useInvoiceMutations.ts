import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { InvoiceStatus } from "./useInvoices";

export type InvoicePayload = {
  client_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  terms: string | null;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    sort_order: number;
  }[];
};

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InvoicePayload) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { items, ...invoiceData } = payload;
      const { data: inv, error } = await supabase
        .from("invoices")
        .insert({ ...invoiceData, user_id: user.id })
        .select("id")
        .single();
      if (error) throw error;

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            items.map(({ amount: _amount, ...item }) => ({
              ...item,
              invoice_id: inv.id,
            })),
          );
        if (itemsError) throw itemsError;
      }

      return inv.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: InvoicePayload & { id: string }) => {
      const { items, ...invoiceData } = payload;

      const { error } = await supabase
        .from("invoices")
        .update({ ...invoiceData, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      await supabase.from("invoice_items").delete().eq("invoice_id", id);

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            items.map(({ amount: _amount, ...item }) => ({
              ...item,
              invoice_id: id,
            })),
          );
        if (itemsError) throw itemsError;
      }
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: InvoiceStatus;
    }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
