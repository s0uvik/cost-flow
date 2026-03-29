import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoiceSummary } from "../hooks/useInvoices";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

type Props = {
  q: string;
  status: string;
  onSearch: (q: string) => void;
  onStatus: (s: string) => void;
  onReset: () => void;
};

export function InvoiceFilters({
  q,
  status,
  onSearch,
  onStatus,
  onReset,
}: Props) {
  const { data: summary } = useInvoiceSummary();
  const counts = summary?.counts;

  return (
    <div className="space-y-3">
      <Tabs value={status || ""} onValueChange={onStatus}>
        <TabsList className="h-auto w-full justify-start">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === ""
                ? counts?.all
                : counts?.[tab.value as keyof typeof counts];
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs px-3"
              >
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice number..."
            className="w-full pl-8 sm:w-56"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {(q || status) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="w-full gap-1 sm:w-auto"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
