"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, MoreVertical, Lightbulb, ListChecks } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuggestedHabit, SuggestedHabitFormModal } from "./SuggestedHabitFormModal";
import { AITip, AITipFormModal } from "./AITipFormModal";

export function AdminContentManagement() {
  const { supabase } = useAuth();
  const [habits, setHabits] = React.useState<SuggestedHabit[]>([]);
  const [tips, setTips] = React.useState<AITip[]>([]);
  const [loading, setLoading] = React.useState({ habits: true, tips: true });

  const [isHabitModalOpen, setIsHabitModalOpen] = React.useState(false);
  const [habitToEdit, setHabitToEdit] = React.useState<SuggestedHabit | null>(null);
  const [isTipModalOpen, setIsTipModalOpen] = React.useState(false);
  const [tipToEdit, setTipToEdit] = React.useState<AITip | null>(null);
  
  const [itemToDelete, setItemToDelete] = React.useState<{ id: string; name: string; type: 'habit' | 'tip' } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const fetchHabits = React.useCallback(async () => {
    setLoading(prev => ({ ...prev, habits: true }));
    const { data, error } = await supabase.from("suggested_habits").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar hábitos.", { description: error.message });
    else setHabits(data);
    setLoading(prev => ({ ...prev, habits: false }));
  }, [supabase]);

  const fetchTips = React.useCallback(async () => {
    setLoading(prev => ({ ...prev, tips: true }));
    const { data, error } = await supabase.from("ai_tips").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar insights.", { description: error.message });
    else setTips(data);
    setLoading(prev => ({ ...prev, tips: false }));
  }, [supabase]);

  React.useEffect(() => {
    fetchHabits();
    fetchTips();
  }, [fetchHabits, fetchTips]);

  const handleSaveHabit = async (data: any, habitId?: string) => {
    const { error } = habitId
      ? await supabase.from("suggested_habits").update(data).eq("id", habitId)
      : await supabase.from("suggested_habits").insert(data);
    if (error) toast.error("Erro ao salvar hábito.", { description: error.message });
    else {
      toast.success("Hábito salvo!");
      setIsHabitModalOpen(false);
      fetchHabits();
    }
  };

  const handleSaveTip = async (data: any, tipId?: string) => {
    const { error } = tipId
      ? await supabase.from("ai_tips").update(data).eq("id", tipId)
      : await supabase.from("ai_tips").insert(data);
    if (error) toast.error("Erro ao salvar insight.", { description: error.message });
    else {
      toast.success("Insight salvo!");
      setIsTipModalOpen(false);
      fetchTips();
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const fromTable = itemToDelete.type === 'habit' ? 'suggested_habits' : 'ai_tips';
    const { error } = await supabase.from(fromTable).delete().eq("id", itemToDelete.id);
    if (error) toast.error("Erro ao remover item.", { description: error.message });
    else {
      toast.success("Item removido.");
      if (itemToDelete.type === 'habit') fetchHabits();
      else fetchTips();
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Conteúdo Dinâmico</CardTitle>
          <CardDescription>Gerencie os hábitos sugeridos e os insights de IA que são exibidos aos usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="habits">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="habits"><ListChecks className="mr-2 h-4 w-4" /> Hábitos Sugeridos</TabsTrigger>
              <TabsTrigger value="tips"><Lightbulb className="mr-2 h-4 w-4" /> Insights de IA</TabsTrigger>
            </TabsList>
            <TabsContent value="habits" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => { setHabitToEdit(null); setIsHabitModalOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Hábito
                </Button>
              </div>
              {loading.habits ? <Skeleton className="h-64 w-full" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Frequência</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {habits.map(habit => (
                      <TableRow key={habit.id}>
                        <TableCell>{habit.name}</TableCell><TableCell>{habit.frequency}</TableCell>
                        <TableCell><Badge variant={habit.is_active ? "default" : "secondary"} className={habit.is_active ? "bg-green-600" : ""}>{habit.is_active ? "Ativo" : "Inativo"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => { setHabitToEdit(habit); setIsHabitModalOpen(true); }}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onSelect={() => { setItemToDelete({ id: habit.id, name: habit.name, type: 'habit' }); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" /> Remover</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="tips" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => { setTipToEdit(null); setIsTipModalOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Insight
                </Button>
              </div>
              {loading.tips ? <Skeleton className="h-64 w-full" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {tips.map(tip => (
                      <TableRow key={tip.id}>
                        <TableCell>{tip.title}</TableCell><TableCell>{tip.category || 'Geral'}</TableCell>
                        <TableCell><Badge variant={tip.is_active ? "default" : "secondary"} className={tip.is_active ? "bg-green-600" : ""}>{tip.is_active ? "Ativo" : "Inativo"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => { setTipToEdit(tip); setIsTipModalOpen(true); }}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onSelect={() => { setItemToDelete({ id: tip.id, name: tip.title, type: 'tip' }); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" /> Remover</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SuggestedHabitFormModal open={isHabitModalOpen} onOpenChange={setIsHabitModalOpen} onSave={handleSaveHabit} habitToEdit={habitToEdit} />
      <AITipFormModal open={isTipModalOpen} onOpenChange={setIsTipModalOpen} onSave={handleSaveTip} tipToEdit={tipToEdit} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação removerá o item "{itemToDelete?.name}" permanentemente.</AlertDialogDescription>
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