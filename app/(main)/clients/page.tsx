"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Plus, Search, Phone, Building2, User, Wallet, AlertCircle, 
  LayoutGrid, List, MoreVertical, CreditCard 
} from "lucide-react"
import Link from "next/link"
import { Client } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DebtPaymentModal } from "@/components/clients/DebtPaymentModal"


export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDebtors, setShowDebtors] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetchWithAuth("/api/customers/")
      if (!response.ok) throw new Error("Failed to fetch clients")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(
    (client) => {
      const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && client.phone.includes(searchTerm));

      const matchesDebtor = showDebtors ? (client.balance || 0) < 0 : true;

      return matchesSearch && matchesDebtor;
    }
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-outfit uppercase italic">Mijozlar</h1>
          <p className="text-[10px] text-slate-500 mt-1 font-black uppercase tracking-widest pl-1 border-l-2 border-primary ml-1 h-3 flex items-center">
             &nbsp; Jami: {clients.length} ta hamkor
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/clients/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto font-black shadow-lg rounded-xl h-12 bg-primary text-white border-none text-[11px] uppercase tracking-widest px-8">
              <Plus className="h-4 w-4 mr-2" />
              Yangi mijoz
            </Button>
          </Link>
        </div>
      </div>


      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mijoz qidirish..."
            className="pl-10 h-10 bg-card border-border rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 px-4 py-2.5 rounded-xl shadow-sm">
            <Switch id="debtors-mode" checked={showDebtors} onCheckedChange={setShowDebtors} />
            <Label htmlFor="debtors-mode" className="cursor-pointer text-[10px] font-black text-slate-500 uppercase tracking-widest">Qarzdorlar</Label>
          </div>

          <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Mijozlar topilmadi
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClients.map((client) => {
            const balance = Number(client.balance || 0);

            return (
              <Card key={client.id} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card border-border overflow-hidden rounded-2xl">
                <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                  <Avatar className="h-12 w-12 border-2 border-muted">
                    <AvatarFallback className="font-bold bg-primary/10 text-primary">{getInitials(client.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold truncate">{client.full_name}</CardTitle>
                        {balance < 0 && (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-black h-5 px-1.5 uppercase tracking-tighter">
                                🔴 Qarzdor
                            </Badge>
                        )}
                    </div>
                    {client.company && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <Building2 className="h-3 w-3" /> {client.company}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/clients/${client.id}`}><DropdownMenuItem>Ko'rish</DropdownMenuItem></Link>
                      <Link href={`/clients/${client.id}/edit`}><DropdownMenuItem>Tahrirlash</DropdownMenuItem></Link>
                      <DropdownMenuItem onClick={() => {
                        setSelectedClient(client)
                        setIsPaymentModalOpen(true)
                      }} className="text-emerald-500 font-bold">
                        Qarz to'lash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-4 pt-2">

                  <div className="p-3 bg-muted/30 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                      <span>Balans holati</span>
                      <Wallet className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-lg font-bold font-mono ${balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {balance.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">so'm</span>
                    </div>
                    {/* Visual Balance Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
                      {balance < 0 ? (
                        <div className="bg-red-500 h-full rounded-full" style={{ width: '100%' }}></div>
                      ) : (
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href={`/orders/new?client=${client.id}`} className="w-full">
                      <Button size="sm" className="w-full text-xs font-bold rounded-lg" variant="outline">
                        Buyurtma
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant={(balance < 0) ? "default" : "outline"} 
                      className={`w-full text-xs font-black rounded-lg ${balance < 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-emerald-950 border-none' : 'border-border text-emerald-500 hover:bg-emerald-500/10'}`}
                      onClick={() => {
                        setSelectedClient(client)
                        setIsPaymentModalOpen(true)
                      }}
                    >
                      <Wallet className="h-3.5 w-3.5 mr-1" /> Qarz to&apos;lash
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b-border">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-bold">Mijoz</TableHead>
                <TableHead className="font-bold">Telefon</TableHead>
                <TableHead className="text-right font-bold">Balans</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const balance = Number(client.balance || 0);
                return (
                  <TableRow key={client.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">{getInitials(client.full_name)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm">{client.full_name}</div>
                      {client.company && <div className="text-xs text-muted-foreground">{client.company}</div>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{client.phone}</TableCell>
                    <TableCell className={`text-right font-mono font-bold ${balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className={`h-8 w-8 ${balance < 0 ? 'text-emerald-500 hover:text-emerald-600' : 'text-muted-foreground'}`}
                          disabled={balance >= 0}
                          onClick={() => {
                            setSelectedClient(client)
                            setIsPaymentModalOpen(true)
                          }}
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                        <Link href={`/clients/${client.id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground"><CreditCard className="h-4 w-4" /></Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedClient && (
        <DebtPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          client={selectedClient}
          onSuccess={fetchClients}
        />
      )}
    </div>
  )
}
