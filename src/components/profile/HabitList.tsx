"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Habit {
    id: string;
    name: string;
    is_active: boolean;
    frequency: string;
}

export function HabitList() {
    const { supabase, session } = useAuth();
    const [habits, setHabits] = React.useState<Habit[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isInitializing, setIsInitializing] = React.useState(false);

    const fetchHabits = React.useCallback(async () => {
        if (!session?.user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from("habits")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: true });

        if (error) {
            toast.error("Erro ao carregar hábitos.", { description: error.message });
            setHabits([]);
        } else {
            setHabits(data as Habit[]);
        }
        setLoading(false);
    }, [session, supabase]);

    React.useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const handleToggleHabit = async (habit: Habit, newStatus: boolean) => {
        const { error } = await supabase
            .from("habits")
            .update({ is_active: newStatus })
            .eq("id", habit.id);

        if (error) {
            toast.error("Erro ao atualizar hábito.", { description: error.message });
        } else {
            setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, is_active: newStatus } : h));
            toast.success(`Hábito '${habit.name}' ${newStatus ? 'ativado' : 'desativado'}.`);
        }
    };

    const handleInitializeHabits = async () => {
        if (!session?.user) return;
        setIsInitializing(true);

        // 1. Buscar hábitos sugeridos do banco de dados
        const { data: suggestedHabits, error: fetchError } = await supabase
            .from("suggested_habits")
            .select("name, frequency")
            .eq("is_active", true);

        if (fetchError || !suggestedHabits) {
            toast.error("Erro ao buscar sugestões de hábitos.", { description: fetchError?.message });
            setIsInitializing(false);
            return;
        }

        if (suggestedHabits.length === 0) {
            toast.info("Nenhum hábito sugerido encontrado para adicionar.");
            setIsInitializing(false);
            return;
        }

        // 2. Preparar para inserção na tabela de hábitos do usuário
        const habitsToInsert = suggestedHabits.map(h => ({
            user_id: session.user.id,
            name: h.name,
            frequency: h.frequency,
            is_active: true,
        }));

        // 3. Inserir os hábitos
        const { error: insertError } = await supabase
            .from("habits")
            .insert(habitsToInsert);

        setIsInitializing(false);

        if (insertError) {
            toast.error("Erro ao inicializar hábitos.", { description: insertError.message });
        } else {
            toast.success("Hábitos sugeridos adicionados!");
            fetchHabits();
        }
    };

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader><CardTitle>Hábitos de Longevidade</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ListChecks className="h-5 w-5 mr-2 text-green-600" />
                    Hábitos de Longevidade
                </CardTitle>
                <CardDescription>
                    Ative ou desative hábitos que você deseja monitorar diariamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {habits.length === 0 ? (
                    <div className="text-center p-4 space-y-4">
                        <p className="text-muted-foreground">
                            Nenhum hábito encontrado.
                        </p>
                        <Button 
                            onClick={handleInitializeHabits} 
                            disabled={isInitializing}
                            className="w-full"
                        >
                            {isInitializing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adicionar Hábitos Sugeridos
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {habits.map((habit, index) => (
                            <React.Fragment key={habit.id}>
                                <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                                    <div className="flex flex-col">
                                        <p className="font-medium">{habit.name}</p>
                                        <span className="text-xs text-muted-foreground">{habit.frequency}</span>
                                    </div>
                                    <Switch
                                        checked={habit.is_active}
                                        onCheckedChange={(checked) => handleToggleHabit(habit, checked)}
                                    />
                                </div>
                                {index < habits.length - 1 && <Separator />}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}