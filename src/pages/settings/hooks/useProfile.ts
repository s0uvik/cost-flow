import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

async function fetchUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const userId = await fetchUserId();
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

type ProfileUpdate = {
  business_name?: string;
  owner_name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
  currency?: string;
  tax_name?: string | null;
  tax_rate?: number;
};

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProfileUpdate) => {
      const userId = await fetchUserId();
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("Failed to save settings"),
  });
}

export function useUploadLogo() {
  return useMutation({
    mutationFn: async (file: File) => {
      const userId = await fetchUserId();
      if (!userId) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop();
      const path = `${userId}/logo.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      return data.publicUrl;
    },
    onError: () => toast.error("Failed to upload logo"),
  });
}
