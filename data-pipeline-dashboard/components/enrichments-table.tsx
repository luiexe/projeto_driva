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
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [page, statusFilter, searchTerm])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Enriquecimentos</CardTitle>
        <CardDescription>Lista detalhada de todos os jobs de enriquecimento processados</CardDescription>
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
              <SelectValue placeholder="Filtrar por status" />
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
        ) : !data || data.data.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">
              {!data ? "Aguardando conexão com a API" : "Nenhum enriquecimento encontrado"}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="text-muted-foreground">Workspace</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground text-right">Contatos</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Duração</TableHead>
                    <TableHead className="text-muted-foreground">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((enrichment) => (
                    <TableRow key={enrichment.id_enriquecimento} className="hover:bg-secondary/30">
                      <TableCell className="font-medium text-foreground">{enrichment.nome_workspace}</TableCell>
                      <TableCell className="text-muted-foreground">{enrichment.tipo_contato}</TableCell>
                      <TableCell className="text-right text-foreground">
                        {enrichment.total_contatos.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border">
                          {enrichment.categoria_tamanho_job}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[enrichment.status_processamento] || ""}>
                          {enrichment.status_processamento}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {enrichment.duracao_processamento_minutos?.toFixed(1) || "-"} min
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(enrichment.data_criacao)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {data.data.length} de {data.meta.total_items.toLocaleString("pt-BR")} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-secondary border-border"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {data.meta.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.meta.total_pages, p + 1))}
                  disabled={page >= data.meta.total_pages}
                  className="bg-secondary border-border"
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
