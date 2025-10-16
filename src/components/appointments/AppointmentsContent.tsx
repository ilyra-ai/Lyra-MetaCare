"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, MoreVertical } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Agenda } from "./Agenda";

// Tipos
interface Professional {
  id: string;
  name: string;
  specialty: string;
  contact?: string | null;
  avatar_url?: string | null;
}

interface Appointment {
  id: string;
  appointment_time: string;
  professional_id: string;
  notes?: string | null;
  professionals: { name: string; specialty: string; avatar_url?: string | null } | null;
}

export function AppointmentsContent() {
  const { supabase, session } = useAuth();
  const [loading, setLoading] = React.useState(true);
  
  const [professionals, setProfessionals] = React.useState<Professional[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = React.useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = React.useState<Appointment | null>(null);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = React.useState(false);
  const [professionalToEdit, setProfessionalToEdit] = React.useState<Professional | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    
    const professionalsPromise = supabase.from("professionals").select("*").eq("user_id", session.user.id).order("name");
    const appointmentsPromise = supabase.from("appointments").select("*, professionals(name, specialty, avatar_url)").eq("user_id", session.user.id);

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

  const handleSaveProfessional = async (data: any, professionalId?: string) => {
    if (!session?.user) return;
    const payload = { ...data, user_id: session.user.id };

    const { error } = professionalId
      ? await supabase.from("professionals").update(payload).eq("id", professionalId)
      : await supabase.from("professionals").insert(payload);

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

  const handleSaveAppointment = async (data: any, appointmentId?: string) => {
    if (!session?.user) return;
    
    const appointmentDate = data.appointment_date;
    const [hours, minutes] = data.appointment_time.split(':').map(Number);
    const appointmentDateTime = setMinutes(setHours(startOfDay(appointmentDate), hours), minutes);

    const payload = {
      user_id: session.user.id,
      professional_id: data.professional_id,
      appointment_time: appointmentDateTime.toISOString(),
      notes: data.notes,
    };

    const { error } = appointmentId
      ? await supabase.from("appointments").update(payload).eq("id", appointmentId)
      : await supabase.from("appointments").insert(payload);

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

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
    setAppointmentToEdit(null);
    setIsAppointmentModalOpen(true);
  };

  const handleSelectEvent = (event: { resource: Appointment }) => {
    setSelectedDate(parseISO(event.resource.appointment_time));
    setAppointmentToEdit(event.resource);
    setIsAppointmentModalOpen(true);
  };

  const calendarEvents = appointments.map(app => ({
    title: `${format(parseISO(app.appointment_time), 'HH:mm')} - ${app.professionals?.name}`,
    start: parseISO(app.appointment_time),
    end: parseISO(app.appointment_time),
    resource: app,
  }));

  const upcomingAppointments = appointments
    .filter(app => new Date(app.appointment_time) >= startOfDay(new Date()))
    .sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime());

  if (loading) {
    return <Skeleton className="h-[80vh] w-full" />;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div>
                <CardTitle className="text-xl">Próximas Consultas</CardTitle>
                <CardDescription>Suas consultas agendadas.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setAppointmentToEdit(null); setSelectedDate(new Date()); setIsAppointmentModalOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Agendar
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {upcomingAppointments.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingAppointments.map(app => (
                    <li key={app.id} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={app.professionals?.avatar_url || undefined} />
                          <AvatarFallback>{app.professionals?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{app.professionals?.name}</p>
                          <p className="text-sm text-muted-foreground">{format(parseISO(app.appointment_time), "dd/MM/yy 'às' HH:mm")}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleSelectEvent({ resource: app })}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Cancelar
                            </DropdownMenuItem></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteAppointment(app.id)}>Confirmar</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">Nenhuma consulta futura agendada.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div>
                <CardTitle className="text-xl">Cadastro de Profissionais</CardTitle>
                <CardDescription>Gerencie sua lista de contatos.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setProfessionalToEdit(null); setIsProfessionalModalOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {professionals.length > 0 ? (
                <ul className="space-y-2">
                  {professionals.map(prof => (
                    <li key={prof.id} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={prof.avatar_url || undefined} />
                          <AvatarFallback>{prof.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{prof.name}</p>
                          <p className="text-sm text-muted-foreground">{prof.specialty}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setProfessionalToEdit(prof); setIsProfessionalModalOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Remover
                            </DropdownMenuItem></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação removerá o profissional.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteProfessional(prof.id)}>Confirmar</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">Nenhum profissional cadastrado.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <Agenda
              events={calendarEvents}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
            />
          </CardContent>
        </Card>
      </div>

      {isAppointmentModalOpen && (
        <AppointmentFormModal
          open={isAppointmentModalOpen}
          onOpenChange={setIsAppointmentModalOpen}
          onSave={handleSaveAppointment}
          professionals={professionals}
          initialDate={selectedDate}
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