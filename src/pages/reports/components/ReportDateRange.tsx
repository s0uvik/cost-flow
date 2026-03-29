import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DatePreset } from "../hooks/useReportsData";

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom" },
];

type Props = {
  preset: DatePreset;
  customFrom: string;
  customTo: string;
  onPreset: (p: DatePreset) => void;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
};

export function ReportDateRange({
  preset,
  customFrom,
  customTo,
  onPreset,
  onFrom,
  onTo,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Period:</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={preset === p.value ? "default" : "outline"}
            onClick={() => onPreset(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              className="h-8 w-full text-sm sm:w-36"
              value={customFrom}
              onChange={(e) => onFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              className="h-8 w-full text-sm sm:w-36"
              value={customTo}
              onChange={(e) => onTo(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
