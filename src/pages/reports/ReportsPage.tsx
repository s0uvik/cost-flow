import { useQueryState, parseAsString, parseAsStringEnum } from "nuqs";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReportDateRange } from "./components/ReportDateRange";
import { ReportSummaryCards } from "./components/ReportSummaryCards";
import { IncomeExpenseChart } from "./components/IncomeExpenseChart";
import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { TopVendors } from "./components/TopVendors";
import { TopClients } from "./components/TopClients";
import { ExportButton } from "./components/ExportButton";
import { useReportsData, type DatePreset } from "./hooks/useReportsData";

const DATE_PRESETS: DatePreset[] = [
  "this_month",
  "last_month",
  "this_quarter",
  "last_quarter",
  "this_year",
  "last_year",
  "custom",
];

export function ReportsPage() {
  const [preset, setPreset] = useQueryState(
    "preset",
    parseAsStringEnum<DatePreset>(DATE_PRESETS).withDefault("this_month")
  );
  const [customFrom, setCustomFrom] = useQueryState(
    "from",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-01"))
  );
  const [customTo, setCustomTo] = useQueryState(
    "to",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-dd"))
  );

  const { data, isLoading } = useReportsData(preset, customFrom, customTo);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analyse your income, expenses, and business performance"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <ReportDateRange
          preset={preset}
          customFrom={customFrom}
          customTo={customTo}
          onPreset={setPreset}
          onFrom={setCustomFrom}
          onTo={setCustomTo}
        />
        {data && (
          <div className="w-full sm:w-auto">
            <ExportButton
              range={data.range}
              rawTransactions={data.rawTransactions}
            />
          </div>
        )}
      </div>

      <ReportSummaryCards summary={data?.summary} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeExpenseChart data={data?.monthlyTrend} isLoading={isLoading} />
        <CategoryBreakdown
          expenseCategories={data?.expenseCategories}
          incomeCategories={data?.incomeCategories}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopVendors vendors={data?.topVendors} isLoading={isLoading} />
        <TopClients clients={data?.topClients} isLoading={isLoading} />
      </div>
    </div>
  );
}
