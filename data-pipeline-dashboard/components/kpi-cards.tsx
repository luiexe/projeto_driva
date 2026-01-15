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
        // Removido o throw para não travar a tela se o banco estiver vazio
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

  // Definição dos KPIs com conversão segura de tipos
  const kpis = [
    {
      title: "Total de Jobs",
      // Number(...) garante que se vier string "10", vira número 10
      value: Number(data?.total_enriquecimentos || 0).toLocaleString("pt-BR"),
      icon: Database,
      color: "text-chart-1",
    },
    {
      title: "Taxa de Sucesso",
      // .toFixed(1) agora funciona pois Number() garante o tipo numérico
      value: `${Number(data?.taxa_sucesso || 0).toFixed(1)}%`,
      icon: CheckCircle2,
      color: "text-chart-2",
    },
    {
      title: "Tempo Médio",
      value: `${Number(data?.tempo_medio_minutos || 0).toFixed(1)} min`,
      icon: Clock,
      color: "text-chart-3",
    },
    {
      title: "Contatos Processados",
      value: Number(data?.total_contatos_processados || 0).toLocaleString("pt-BR"),
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
            {/* Se houver erro, mostramos "-", senão o valor */}
            <div className="text-2xl font-bold text-foreground">
              {error ? "-" : kpi.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
