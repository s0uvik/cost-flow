import { PageHeader } from '@/components/shared/PageHeader'
import { StatCards } from './components/StatCards'
import { MonthlyChart } from './components/MonthlyChart'
import { CategoryChart } from './components/CategoryChart'
import { RecentTransactions } from './components/RecentTransactions'
import { BudgetOverview } from './components/BudgetOverview'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your business finances" />
      <StatCards />
      <div className="grid gap-6 md:grid-cols-2">
        <MonthlyChart />
        <CategoryChart />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <RecentTransactions />
        <BudgetOverview />
      </div>
    </div>
  )
}
