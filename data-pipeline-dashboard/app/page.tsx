import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCards } from "@/components/kpi-cards"
import { ChartsSection } from "@/components/charts-section"
import { EnrichmentsTable } from "@/components/enrichments-table"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <KpiCards />
        <ChartsSection />
        <EnrichmentsTable />
      </main>
    </div>
  )
}
