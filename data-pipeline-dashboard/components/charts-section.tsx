"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchOverview, type OverviewData } from "@/lib/api"

const STATUS_COLORS: Record<string, string> = {
  CONCLUIDO: "#22c55e",
  EM_PROCESSAMENTO: "#3b82f6",
  FALHOU: "#ef4444",
  CANCELADO: "#f59e0b",
}

const CATEGORY_COLORS: Record<string, string> = {
  PEQUENO: "#3b82f6",
  MEDIO: "#22c55e",
  GRANDE: "#f59e0b",
  MUITO_GRANDE: "#8b5cf6",
}

export function ChartsSection() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchOverview()
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição por Status</CardTitle>
            <CardDescription>Aguardando conexão com a API</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">Sem dados disponíveis</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Jobs por Categoria</CardTitle>
            <CardDescription>Aguardando conexão com a API</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">Sem dados disponíveis</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusData = Object.entries(data?.distribuicao_status || {}).map(([name, value]) => ({
    name,
    value: Number(value),
  }))

  const categoryData = Object.entries(data?.distribuicao_categoria || {}).map(([name, value]) => ({
    name,
    value: Number(value),
  }))

  // Se não houver dados transformados, mostramos o estado "Sem dados"
  if (statusData.length === 0 && categoryData.length === 0) {
     return (
        <div className="grid gap-4 md:grid-cols-2">
           <Card className="bg-card p-10 text-center">Sem dados no banco para gerar gráficos</Card>
        </div>
     )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Distribuição por Status</CardTitle>
          <CardDescription>Quantidade de jobs por status de processamento</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#666"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fafafa" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Jobs por Categoria de Tamanho</CardTitle>
          <CardDescription>Distribuição de jobs por quantidade de contatos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fafafa" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#666"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
