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
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          className="w-full pl-8 sm:w-64"
          value={q}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {q && (
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
  );
}
