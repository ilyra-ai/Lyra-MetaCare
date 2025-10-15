"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// Define Goal type based on the new Supabase schema
interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  status: string;
}

const formSchema = z.object({
  current_value: z.coerce.number().min(0, "O valor deve ser positivo."),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateGoalProgressModalProps {
  goal: Goal;
  onUpdate: () => void;
  children: React.ReactNode;
}

export function UpdateGoalProgressModal({ goal, onUpdate, children }: UpdateGoalProgressModalProps) {
  const { supabase } = useAuth();
  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_value: goal.current_value,
    },
  });

  const onSubmit = async (data: FormValues) => {
    let newStatus = goal.status;
    
    if (goal.target_value && data.current_value >= goal.target_value) {
        newStatus = 'completed';
    } else if (goal.target_value && data.current_value > 0) {
        newStatus = 'in_progress';
    } else {
        newStatus = 'missed'; // Simplified logic for demonstration
    }

    const { error } = await supabase
      .from("goals")
      .update({
        current_value: data.current_value,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goal.id);

    if (error) {
      toast.error("Erro ao atualizar meta.", { description: error.message });
    } else {
      toast.success("Progresso atualizado com sucesso!");
      setOpen(false);
      onUpdate(); // Trigger parent refresh
    }
  };

  const progressPercentage = goal.target_value
    ? Math.min(100, (goal.current_value / goal.target_value) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal.title}</DialogTitle>
          <DialogDescription>
            Atualize seu progresso para esta meta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{goal.description}</p>
            {goal.target_value && (
                <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Meta: {goal.target_value} {goal.unit}</span>
                        <span>Progresso: {progressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>
            )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="current_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Atual ({goal.unit || 'unidade'})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar Progresso"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}