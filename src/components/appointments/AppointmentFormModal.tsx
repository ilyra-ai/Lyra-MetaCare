"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeInput } from "@/components/ui/time-input";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Tipos para os dados
interface Professional {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  appointment_time: string;
  professional_id: string;
  notes?: string | null;
}

// Schema de validação
const formSchema = z.object({
  professional_id: z.string({ required_error: "Selecione um profissional." }),
  appointment_time: z.string().refine(val => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), "Formato de hora inválido (HH:MM)."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FormValues, appointmentId?: string) => Promise<void>;
  professionals: Professional[];
  selectedDate: Date;
  appointmentToEdit?: Appointment | null;
}

export function AppointmentFormModal({
  open,
  onOpenChange,
  onSave,
  professionals,
  selectedDate,
  appointmentToEdit,
}: AppointmentFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professional_id: "",
      appointment_time: "09:00",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (appointmentToEdit) {
      const time = new Date(appointmentToEdit.appointment_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      form.reset({
        professional_id: appointmentToEdit.professional_id,
        appointment_time: time,
        notes: appointmentToEdit.notes || "",
      });
    } else {
      form.reset({
        professional_id: "",
        appointment_time: "09:00",
        notes: "",
      });
    }
  }, [appointmentToEdit, open, form]);

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data, appointmentToEdit?.id);
    } catch (error) {
      toast.error("Ocorreu um erro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appointmentToEdit ? "Editar Consulta" : "Agendar Nova Consulta"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da sua consulta para o dia {selectedDate.toLocaleDateString('pt-BR')}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="professional_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointment_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário (HH:MM)</FormLabel>
                  <FormControl>
                    <TimeInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Endereço, motivo da consulta..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {appointmentToEdit ? "Salvar Alterações" : "Agendar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}