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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ProfessionalAvatarUploader } from "./ProfessionalAvatarUploader";

// Tipos
interface Professional {
  id: string;
  name: string;
  specialty: string;
  contact?: string | null;
  avatar_url?: string | null;
}

// Schema
const formSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório."),
  specialty: z.string().min(2, "A especialidade é obrigatória."),
  contact: z.string().optional(),
  avatar_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfessionalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FormValues, professionalId?: string) => Promise<void>;
  professionalToEdit?: Professional | null;
}

export function ProfessionalFormModal({
  open,
  onOpenChange,
  onSave,
  professionalToEdit,
}: ProfessionalFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", specialty: "", contact: "", avatar_url: "" },
  });

  const professionalName = form.watch("name");

  React.useEffect(() => {
    if (professionalToEdit) {
      form.reset({
        name: professionalToEdit.name,
        specialty: professionalToEdit.specialty,
        contact: professionalToEdit.contact || "",
        avatar_url: professionalToEdit.avatar_url || "",
      });
    } else {
      form.reset({ name: "", specialty: "", contact: "", avatar_url: "" });
    }
  }, [professionalToEdit, open, form]);

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await onSave(data, professionalToEdit?.id);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{professionalToEdit ? "Editar Profissional" : "Cadastrar Novo Profissional"}</DialogTitle>
          <DialogDescription>
            Adicione as informações do profissional para selecioná-lo em suas consultas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem className="flex justify-center">
                  <FormControl>
                    <ProfessionalAvatarUploader
                      currentAvatarUrl={field.value}
                      professionalName={professionalName}
                      onUploadSuccess={(url) => form.setValue("avatar_url", url, { shouldValidate: true })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Dr. João Silva" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <FormControl><Input placeholder="Cardiologista" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato (Opcional)</FormLabel>
                  <FormControl><Input placeholder="Telefone, email ou endereço" {...field} /></FormControl>
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
                {professionalToEdit ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}