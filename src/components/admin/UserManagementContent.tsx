"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, User, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDetailModal } from "./UserDetailModal";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  onboarding_completed: boolean;
  created_at: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  activity_level: number | null;
  goals: string[] | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
}

const PAGE_SIZE = 10;

export function UserManagementContent() {
  const { supabase } = useAuth();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [sort, setSort] = React.useState({ column: 'created_at', ascending: false });
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from("profiles")
      .select("*", { count: 'exact' });

    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    query = query.order(sort.column, { ascending: sort.ascending }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      toast.error("Erro ao carregar usuários.", { description: error.message });
    } else {
      setUsers(data as UserProfile[]);
      setTotalUsers(count || 0);
    }
    setLoading(false);
  }, [supabase, searchTerm, page, sort]);

  React.useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce para evitar chamadas excessivas ao digitar
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleSort = (column: string) => {
    setSort(prev => ({
      column,
      ascending: prev.column === column ? !prev.ascending : true,
    }));
  };

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Total de {totalUsers} usuários. Visualizando página {page + 1} de {totalPages}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou email..."
              className="pl-8 w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0); // Reseta para a primeira página ao buscar
              }}
            />
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('first_name')}>
                      Usuário <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('created_at')}>
                      Data de Cadastro <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
                  users.map((user: UserProfile) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{user.first_name?.charAt(0) || <User className="h-4 w-4" />}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.first_name || 'Usuário'} {user.last_name || ''}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.onboarding_completed ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">Completo</Badge>
                        ) : (
                          <Badge variant="secondary">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => { setSelectedUser(user); setIsModalOpen(true); }}>
                              Ver Detalhes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Próximo
            </Button>
          </div>
        </CardContent>
      </Card>
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}