"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SuggestedHabit, SuggestedHabitFormModal } from "./SuggestedHabitFormModal";

export function AdminContentManagement() {
  const { supabase } = useAuth();
  const [habits, setHabits] = React.useState<SuggestedHabit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [habitToEdit, setHabitToEdit] = React.useState<SuggestedHabit | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [habitToDelete, setHabitToDelete] = React.useState<SuggestedHabit | null>(null);

  const fetchHabits = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suggested_habits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar hábitos sugeridos.", { description: error.message });
    } else {
      setHabits(data);
    }
    setLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleSave = async (data: any, habitId?: string) => {
    const { error } = habitId
      ? await supabase.from("suggested_habits").update(data).eq("id", habitId)
      : await supabase.from("suggested_habits").insert(data);

    if (error) {
      toast.error("Erro ao salvar hábito.", { description: error.message });
    } else {
      toast.success("Hábito salvo com sucesso!");
      setIsModalOpen(false);
      fetchHabits();
    }
  };

  const handleDelete = async () => {
    if (!habitToDelete) return;
    const { error } = await supabase.from("suggested_habits").delete().eq("id", habitToDelete.id);
    if (error) {
      toast.error("Erro ao remover hábito.", { description: error.message });
    } else {
      toast.success("Hábito removido.");
      fetchHabits();
    }
    setIsDeleteDialogOpen(false);
    setHabitToDelete(null);
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestão de Conteúdo</CardTitle>
            <CardDescription>Adicione ou edite os hábitos sugeridos para os usuários.</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setHabitToEdit(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Hábito
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Hábito</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {habits.map(habit => (
                  <TableRow key={habit.id}>
                    <TableCell className="font-medium">{habit.name}</TableCell>
                    <TableCell>{habit.frequency}</TableCell>
                    <TableCell>
                      <Badge variant={habit.is_active ? "default" : "secondary"} className={habit.is_active ? "bg-green-600" : ""}>
                        {habit.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setHabitToEdit(habit); setIsModalOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => { setHabitToDelete(habit); setIsDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SuggestedHabitFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        habitToEdit={habitToEdit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o hábito "{habitToDelete?.name}" da lista de sugestões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}