import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  q: string;
  onChange: (q: string) => void;
  onReset: () => void;
};

export function ClientFilters({ q, onChange, onReset }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          className="pl-8 w-64"
          value={q}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {q && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
