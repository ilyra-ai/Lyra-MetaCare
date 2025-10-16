"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, User, Trash2, Edit, MoreVertical } from "lucide-react";
import { format, startOfDay, parseISO, setHours, setMinutes } from "date-fns";
import { AppointmentFormModal } from "./AppointmentFormModal";
import { ProfessionalFormModal } from "./ProfessionalFormModal";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Tipos
interface Professional {
  id: string;
  name: string;
  specialty: string;
  contact?: string | null;
}

interface Appointment {
  id: string;
  appointment_time: string;
  professional_id: string;
  notes?: string | null;
  professionals: { name: string; specialty: string } | null;
}

export function AppointmentsContent() {
  const { supabase, session } = useAuth();
  const [loading, setLoading] = React.useState(true);
  
  // Estados de dados
  const [professionals, setProfessionals] = React.useState<Professional[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  // Estados dos modais
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = React.useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = React.useState<Appointment | null>(null);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = React.useState(false);
  const [professionalToEdit, setProfessionalToEdit] = React.useState<Professional | null>(null);

  // --- Funções de busca de dados ---
  const fetchData = React.useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    
    const professionalsPromise = supabase.from("professionals").select("*").eq("user_id", session.user.id);
    const appointmentsPromise = supabase.from("appointments").select("*, professionals(name, specialty)").eq("user_id", session.user.id);

    const [{ data: professionalsData, error: professionalsError }, { data: appointmentsData, error: appointmentsError }] = await Promise.all([professionalsPromise, appointmentsPromise]);

    if (professionalsError) toast.error("Erro ao buscar profissionais.");
    else setProfessionals(professionalsData || []);

    if (appointmentsError) toast.error("Erro ao buscar consultas.");
    else setAppointments(appointmentsData || []);

    setLoading(false);
  }, [supabase, session]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Funções CRUD para Profissionais ---
  const handleSaveProfessional = async (data: any, professionalId?: string) => {
    if (!session?.user) return;
    const payload = { ...data, user_id: session.user.id };

    const query = professionalId
      ? supabase.from("professionals").update(payload).eq("id", professionalId)
      : supabase.from("professionals").insert(payload);

    const { error } = await query;
    if (error) {
      toast.error("Erro ao salvar profissional.", { description: error.message });
    } else {
      toast.success(`Profissional ${professionalId ? 'atualizado' : 'cadastrado'} com sucesso!`);
      setIsProfessionalModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteProfessional = async (professionalId: string) => {
    const { error } = await supabase.from("professionals").delete().eq("id", professionalId);
    if (error) {
      toast.error("Erro ao remover profissional.", { description: error.message });
    } else {
      toast.success("Profissional removido.");
      fetchData();
    }
  };

  // --- Funções CRUD para Consultas ---
  const handleSaveAppointment = async (data: any, appointmentId?: string) => {
    if (!session?.user || !selectedDate) return;
    
    const [hours, minutes] = data.appointment_time.split(':').map(Number);
    const appointmentDateTime = setMinutes(setHours(startOfDay(selectedDate), hours), minutes);

    const payload = {
      user_id: session.user.id,
      professional_id: data.professional_id,
      appointment_time: appointmentDateTime.toISOString(),
      notes: data.notes,
    };

    const query = appointmentId
      ? supabase.from("appointments").update(payload).eq("id", appointmentId)
      : supabase.from("appointments").insert(payload);

    const { error } = await query;
    if (error) {
      toast.error("Erro ao agendar consulta.", { description: error.message });
    } else {
      toast.success(`Consulta ${appointmentId ? 'atualizada' : 'agendada'} com sucesso!`);
      setIsAppointmentModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", appointmentId);
    if (error) {
      toast.error("Erro ao cancelar consulta.", { description: error.message });
    } else {
      toast.success("Consulta cancelada.");
      fetchData();
    }
  };

  // --- Lógica de UI ---
  const appointmentsOnSelectedDate = appointments.filter(app =>
    selectedDate && format(parseISO(app.appointment_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ).sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime());

  const appointmentDays = React.useMemo(() => 
    appointments.map(app => parseISO(app.appointment_time)), 
  [appointments]);

  if (loading) {
    return <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><Skeleton className="h-96 lg:col-span-1" /><Skeleton className="h-96 lg:col-span-2" /></div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1: Agenda e Consultas do Dia */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Agenda</CardTitle>
              <CardDescription>Clique em um dia para ver ou adicionar consultas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setAppointmentToEdit(null);
                  setIsAppointmentModalOpen(true);
                }}
                className="p-0"
                modifiers={{ booked: appointmentDays }}
                modifiersStyles={{ booked: { border: "2px solid currentColor" } }}
              />
            </CardContent>
          </Card>
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>Consultas em {format(selectedDate, "dd/MM/yy")}</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsOnSelectedDate.length > 0 ? (
                  <ul className="space-y-4">
                    {appointmentsOnSelectedDate.map(app => (
                      <li key={app.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                        <div>
                          <p className="font-semibold">{format(parseISO(app.appointment_time), "HH:mm")}</p>
                          <p className="text-sm text-muted-foreground">{app.professionals?.name}</p>
                          <p className="text-xs text-muted-foreground">{app.professionals?.specialty}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => { setAppointmentToEdit(app); setIsAppointmentModalOpen(true); }}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Cancelar</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialog>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. A consulta será cancelada permanentemente.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteAppointment(app.id)}>Confirmar</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">Nenhuma consulta para este dia.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna 2: Gerenciamento */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>2. Agendamento de Consulta</CardTitle>
              <CardDescription>Adicione uma nova consulta à sua agenda.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => { setAppointmentToEdit(null); setIsAppointmentModalOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Agendar Nova Consulta
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>3. Cadastro de Profissionais</CardTitle>
                <CardDescription>Gerencie sua lista de contatos profissionais.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setProfessionalToEdit(null); setIsProfessionalModalOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {professionals.length > 0 ? (
                <ul className="space-y-2">
                  {professionals.map(prof => (
                    <li key={prof.id} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full"><User className="h-5 w-5 text-gray-600" /></div>
                        <div>
                          <p className="font-semibold">{prof.name}</p>
                          <p className="text-sm text-muted-foreground">{prof.specialty}</p>
                        </div>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => { setProfessionalToEdit(prof); setIsProfessionalModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação removerá o profissional e pode afetar consultas agendadas.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteProfessional(prof.id)}>Confirmar</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">Nenhum profissional cadastrado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modais */}
      {isAppointmentModalOpen && selectedDate && (
        <AppointmentFormModal
          open={isAppointmentModalOpen}
          onOpenChange={setIsAppointmentModalOpen}
          onSave={handleSaveAppointment}
          professionals={professionals}
          selectedDate={selectedDate}
          appointmentToEdit={appointmentToEdit}
        />
      )}
      {isProfessionalModalOpen && (
        <ProfessionalFormModal
          open={isProfessionalModalOpen}
          onOpenChange={setIsProfessionalModalOpen}
          onSave={handleSaveProfessional}
          professionalToEdit={professionalToEdit}
        />
      )}
    </>
  );
}