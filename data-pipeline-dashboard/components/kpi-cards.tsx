"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, CheckCircle2, Clock, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchOverview, type OverviewData } from "@/lib/api"

export function KpiCards() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchOverview()
        if (!result) throw new Error("Não foi possível carregar os dados")
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total de Jobs", value: "-", icon: Database, color: "text-chart-1" },
          { title: "Taxa de Sucesso", value: "-", icon: CheckCircle2, color: "text-chart-2" },
          { title: "Tempo Médio", value: "-", icon: Clock, color: "text-chart-3" },
          { title: "Contatos Processados", value: "-", icon: Users, color: "text-chart-5" },
        ].map((kpi) => (
          <Card key={kpi.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: "Total de Jobs",
      value: data?.total_enriquecimentos.toLocaleString("pt-BR") || "0",
      icon: Database,
      color: "text-chart-1",
    },
    {
      title: "Taxa de Sucesso",
      value: `${data?.taxa_sucesso.toFixed(1) || 0}%`,
      icon: CheckCircle2,
      color: "text-chart-2",
    },
    {
      title: "Tempo Médio",
      value: `${data?.tempo_medio_minutos.toFixed(1) || 0} min`,
      icon: Clock,
      color: "text-chart-3",
    },
    {
      title: "Contatos Processados",
      value: data?.total_contatos_processados.toLocaleString("pt-BR") || "0",
      icon: Users,
      color: "text-chart-5",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
