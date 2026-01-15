"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchEnrichments, type EnrichmentsResponse } from "@/lib/api"

const STATUS_STYLES: Record<string, string> = {
  CONCLUIDO: "bg-green-500/20 text-green-400 border-green-500/30",
  EM_PROCESSAMENTO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  FALHOU: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELADO: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
}

export function EnrichmentsTable() {
  const [data, setData] = useState<EnrichmentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const result = await fetchEnrichments({
          page,
          limit: 10,
          status: statusFilter,
          search: searchTerm,
        })
        setData(result)
      } catch (err) {
        console.error("Erro ao carregar tabela:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [page, statusFilter, searchTerm])

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch { return "-" }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Enriquecimentos</CardTitle>
        <CardDescription>Lista detalhada de todos os jobs processados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por workspace..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="CONCLUIDO">Concluído</SelectItem>
              <SelectItem value="EM_PROCESSAMENTO">Em Processamento</SelectItem>
              <SelectItem value="FALHOU">Falhou</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || !data.data || data.data.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">Nenhum registro encontrado</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Workspace</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Contatos</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Duração</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((item) => (
                    <TableRow key={item.id_enriquecimento || Math.random()}>
                      <TableCell className="font-medium">{item.nome_workspace || "N/A"}</TableCell>
                      <TableCell>{item.tipo_contato || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        {Number(item.total_contatos || 0).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/50">
                          {item.categoria_tamanho_job || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[item.status_processamento] || ""}>
                          {item.status_processamento || "PENDENTE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {Number(item.duracao_processamento_minutos || 0).toFixed(1)} min
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(item.data_criacao || item.data_atualizacao)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {data.data.length} de {Number(data.meta?.total_items || 0).toLocaleString("pt-BR")} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {page} de {data.meta?.total_pages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.meta?.total_pages || 1, p + 1))}
                  disabled={page >= (data.meta?.total_pages || 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
