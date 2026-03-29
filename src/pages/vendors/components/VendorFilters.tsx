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
import { useExpenseCategories } from "../hooks/useVendors";

type Props = {
  q: string;
  categoryId: string;
  onSearch: (q: string) => void;
  onCategory: (id: string) => void;
  onReset: () => void;
};

export function VendorFilters({
  q,
  categoryId,
  onSearch,
  onCategory,
  onReset,
}: Props) {
  const { data: categories } = useExpenseCategories();
  const hasFilter = q || categoryId;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          className="pl-8 w-56"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <Select
        value={categoryId || "all"}
        onValueChange={(v) => onCategory(v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-44">
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

      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
