'use client';

import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  User,
  MoreHorizontal,
  ArrowUpDown,
  Trash2,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserDetailModal } from './UserDetailModal';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { AdminUserListItem, AdminUserListResponse } from '@/types/subscription';

type SortColumn = 'created_at' | 'first_name' | 'email';

const PAGE_SIZE = 10;

function extractApiError(payload: unknown) {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }

  return undefined;
}

export function UserManagementContent() {
  const { db } = useAuth();
  const [users, setUsers] = React.useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [sort, setSort] = React.useState<{
    column: SortColumn;
    ascending: boolean;
  }>({
    column: 'created_at',
    ascending: false,
  });

  const [selectedUser, setSelectedUser] =
    React.useState<AdminUserListItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] =
    React.useState<AdminUserListItem | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sortColumn: sort.column,
        ascending: String(sort.ascending),
      });

      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = (await response.json()) as
        AdminUserListResponse | { error?: string };

      if (!response.ok || !('users' in payload)) {
        throw new Error(
          extractApiError(payload) || 'Falha ao carregar os usuários.'
        );
      }

      setUsers(payload.users);
      setTotalUsers(payload.total);
    } catch (error) {
      toast.error('Erro ao carregar usuários.', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido.',
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, sort]);

  React.useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleSort = (column: SortColumn) => {
    setSort((prev) => ({
      column,
      ascending: prev.column === column ? !prev.ascending : true,
    }));
  };

  const handleToggleOnboarding = async (user: AdminUserListItem) => {
    const newStatus = !user.onboardingCompleted;
    const { error } = await db
      .from('profiles')
      .update({ onboarding_completed: newStatus })
      .eq('id', user.id);

    if (error) {
      toast.error('Erro ao atualizar status do onboarding.', {
        description: error.message,
      });
      return;
    }

    toast.success(
      `Onboarding de ${user.firstName || 'usuário'} foi ${newStatus ? 'marcado como completo' : 'redefinido'}.`
    );
    await fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const { error } = await db
      .from('profiles')
      .delete()
      .eq('id', userToDelete.id);

    if (error) {
      toast.error('Erro ao remover perfil do usuário.', {
        description: error.message,
      });
    } else {
      toast.success(
        `Perfil de ${userToDelete.firstName || 'usuário'} foi removido.`
      );
      await fetchUsers();
    }

    setIsDeleteAlertOpen(false);
  };

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Total de {totalUsers} usuários. Visualizando página {page + 1} de{' '}
            {totalPages}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou email..."
              className="w-full pl-8 md:w-1/3"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('first_name')}
                    >
                      Usuário <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('created_at')}
                    >
                      Data de Cadastro <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-10 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="ml-auto h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="ml-auto h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback>
                              {user.firstName?.charAt(0) || (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName || 'Usuário'}{' '}
                              {user.lastName || ''}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.plan.key ? (
                          <div className="space-y-1">
                            <PlanBadge planKey={user.plan.key} />
                            <p className="text-xs text-muted-foreground capitalize">
                              {user.plan.billingInterval === 'annual'
                                ? 'Anual'
                                : 'Mensal'}
                            </p>
                          </div>
                        ) : (
                          <Badge variant="outline">Sem assinatura</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.onboardingCompleted ? (
                            <Badge
                              variant="default"
                              className="bg-success text-success-foreground hover:brightness-95"
                            >
                              Completo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pendente</Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Ações para ${user.email}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                setSelectedUser(user);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleToggleOnboarding(user)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {user.onboardingCompleted
                                ? 'Redefinir Onboarding'
                                : 'Completar Onboarding'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => {
                                setUserToDelete(user);
                                setIsDeleteAlertOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Deletar Perfil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
              onClick={() =>
                setPage((currentPage) => Math.max(0, currentPage - 1))
              }
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => currentPage + 1)}
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
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onSubscriptionUpdated={fetchUsers}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o perfil de{' '}
              <span className="font-bold">
                {userToDelete?.firstName || 'usuário'}
              </span>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
