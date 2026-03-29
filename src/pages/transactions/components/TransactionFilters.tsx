import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "../hooks/useTransactions";

type Filters = {
  q: string;
  type: string;
  categoryId: string;
  paymentMethod: string;
  from: string;
  to: string;
};

type Props = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
};

export function TransactionFilters({ filters, onChange, onReset }: Props) {
  const { data: categories } = useCategories();

  const hasActiveFilters =
    filters.q ||
    filters.type ||
    filters.categoryId ||
    filters.paymentMethod ||
    filters.from ||
    filters.to;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-8 w-56"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </div>

      <Select
        value={filters.type || "all"}
        onValueChange={(v) => onChange({ type: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.categoryId || "all"}
        onValueChange={(v) => onChange({ categoryId: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full inline-block"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.paymentMethod || "all"}
        onValueChange={(v) => onChange({ paymentMethod: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All payments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All payments</SelectItem>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="account">Account</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-36"
        value={filters.from}
        onChange={(e) => onChange({ from: e.target.value })}
      />
      <span className="text-muted-foreground text-sm">to</span>
      <Input
        type="date"
        className="w-36"
        value={filters.to}
        onChange={(e) => onChange({ to: e.target.value })}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
