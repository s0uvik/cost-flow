import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";

const CURRENCIES = [
  { value: "INR", label: "₹ Indian Rupee (INR)" },
  { value: "USD", label: "$ US Dollar (USD)" },
  { value: "EUR", label: "€ Euro (EUR)" },
  { value: "GBP", label: "£ British Pound (GBP)" },
  { value: "AED", label: "AED UAE Dirham" },
  { value: "SGD", label: "S$ Singapore Dollar (SGD)" },
];

const schema = z.object({
  currency: z.string().min(1),
  tax_name: z.string(),
  tax_rate: z.coerce.number().min(0).max(100),
});

type FormValues = z.infer<typeof schema>;

export function TaxCurrencyForm() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "INR", tax_name: "", tax_rate: 0 },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        currency: profile.currency ?? "INR",
        tax_name: profile.tax_name ?? "",
        tax_rate: profile.tax_rate ?? 0,
      });
    }
  }, [profile]);

  async function onSubmit(values: FormValues) {
    await updateMutation.mutateAsync({
      currency: values.currency,
      tax_name: values.tax_name || null,
      tax_rate: values.tax_rate,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax & Currency</CardTitle>
        <CardDescription>Applied to new invoices by default.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tax_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tax Label{" "}
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="GST, VAT, etc." {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Shown on invoices
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          placeholder="18"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Default rate for new invoices
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Tax & Currency
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
