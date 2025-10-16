"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Tipos
export interface SuggestedHabit {
  id: string;
  name: string;
  frequency: string;
  is_active: boolean;
}

// Schema
const formSchema = z.object({
  name: z.string().min(3, "O nome do hábito é obrigatório."),
  frequency: z.string().min(3, "A frequência é obrigatória."),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface SuggestedHabitFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FormValues, habitId?: string) => Promise<void>;
  habitToEdit?: SuggestedHabit | null;
}

export function SuggestedHabitFormModal({
  open,
  onOpenChange,
  onSave,
  habitToEdit,
}: SuggestedHabitFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", frequency: "", is_active: true },
  });

  React.useEffect(() => {
    if (habitToEdit) {
      form.reset(habitToEdit);
    } else {
      form.reset({ name: "", frequency: "", is_active: true });
    }
  }, [habitToEdit, open, form]);

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await onSave(data, habitToEdit?.id);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{habitToEdit ? "Editar Hábito" : "Adicionar Novo Hábito Sugerido"}</DialogTitle>
          <DialogDescription>
            Este hábito aparecerá como uma sugestão para novos usuários.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Hábito</FormLabel>
                  <FormControl><Input placeholder="Ex: Ler 15 minutos" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência</FormLabel>
                  <FormControl><Input placeholder="Ex: Diário" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <FormDescription>
                      Se desativado, não aparecerá como sugestão.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}