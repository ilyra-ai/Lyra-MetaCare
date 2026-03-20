'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Informe um titulo com pelo menos 3 caracteres.'),
  description: z.string().trim(),
  category: z.string().trim(),
  target_value: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || Number.isFinite(Number(value)),
      'Informe um numero valido para o valor-alvo.'
    )
    .refine(
      (value) => value.length === 0 || Number(value) > 0,
      'Informe um valor-alvo maior que zero.'
    ),
  current_value: z.coerce
    .number()
    .min(0, 'O progresso inicial nao pode ser negativo.'),
  unit: z.string().trim(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGoalModalProps {
  children: React.ReactNode;
  onCreated: () => void;
}

export function CreateGoalModal({ children, onCreated }: CreateGoalModalProps) {
  const { db, session } = useAuth();
  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      target_value: '',
      current_value: 0,
      unit: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!session?.user) {
      toast.error('Sessao invalida para criar meta.');
      return;
    }

    const description = data.description || null;
    const category = data.category || null;
    const unit = data.unit || null;
    const targetValue =
      data.target_value.length > 0 ? Number(data.target_value) : null;
    const currentValue = data.current_value;
    const status =
      targetValue !== null && currentValue >= targetValue
        ? 'completed'
        : 'in_progress';

    const { error } = await db.from('goals').insert({
      user_id: session.user.id,
      title: data.title.trim(),
      description,
      category,
      target_value: targetValue,
      current_value: currentValue,
      unit,
      status,
    });

    if (error) {
      toast.error('Erro ao criar meta.', { description: error.message });
      return;
    }

    toast.success('Meta criada com sucesso!');
    setOpen(false);
    form.reset({
      title: '',
      description: '',
      category: '',
      target_value: '',
      current_value: 0,
      unit: '',
    });
    onCreated();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          form.reset({
            title: '',
            description: '',
            category: '',
            target_value: '',
            current_value: 0,
            unit: '',
          });
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar meta manual</DialogTitle>
          <DialogDescription>
            Cadastre uma meta personalizada com alvo, unidade e progresso
            inicial para acompanhar sua evolucao real no app.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titulo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Dormir 8 horas por noite"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: horas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="target_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor-alvo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ex: 8"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progresso inicial</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o objetivo e o criterio de acompanhamento."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Salvando meta...' : 'Salvar Meta'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
