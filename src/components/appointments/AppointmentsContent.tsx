'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { format, parseISO, setHours, setMinutes, startOfDay } from 'date-fns';
import {
  CalendarClock,
  Edit,
  HeartHandshake,
  MoreVertical,
  Plus,
  Sparkles,
  Stethoscope,
  Trash2,
  UserRoundPlus,
} from 'lucide-react';
import { toast } from 'sonner';

import { AppointmentFormModal } from './AppointmentFormModal';
import { ProfessionalFormModal } from './ProfessionalFormModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';

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
  professionals: {
    name: string;
    specialty: string;
    avatar_url?: string | null;
  } | null;
}

type ProfessionalFormValues = {
  name: string;
  specialty: string;
  contact?: string;
  avatar_url?: string;
};

type AppointmentFormValues = {
  professional_id: string;
  appointment_date: Date;
  appointment_time: string;
  notes?: string;
};

// O calendário (react-big-calendar + agenda.css) é carregado sob demanda:
// importado estaticamente, o prefetch da rota /appointments pelos links da
// navegação pré-carregava esse CSS em todas as páginas sem usá-lo.
const Agenda = dynamic(
  () => import('./Agenda').then((mod) => mod.Agenda<Appointment>),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-[24px]" />,
  }
);

export function AppointmentsContent() {
  const { db, session } = useAuth();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const [loading, setLoading] = React.useState(true);
  const [professionals, setProfessionals] = React.useState<Professional[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] =
    React.useState(false);
  const [appointmentToEdit, setAppointmentToEdit] =
    React.useState<Appointment | null>(null);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] =
    React.useState(false);
  const [professionalToEdit, setProfessionalToEdit] =
    React.useState<Professional | null>(null);

  const userId = session?.user?.id ?? null;

  // Consulta pura de profissionais e consultas do usuário.
  const queryData = React.useCallback(
    (ownerId: string) =>
      Promise.all([
        db
          .from('professionals')
          .select('*')
          .eq('user_id', ownerId)
          .order('name'),
        db
          .from('appointments')
          .select('*, professionals(name, specialty, avatar_url)')
          .eq('user_id', ownerId),
      ]),
    [db]
  );

  const applyData = React.useCallback(
    ([
      { data: professionalsData, error: professionalsError },
      { data: appointmentsData, error: appointmentsError },
    ]: Awaited<ReturnType<typeof queryData>>) => {
      if (professionalsError) {
        toast.error('Erro ao buscar profissionais.', {
          description: professionalsError.message,
        });
      } else {
        setProfessionals(professionalsData || []);
      }

      if (appointmentsError) {
        toast.error('Erro ao buscar consultas.', {
          description: appointmentsError.message,
        });
      } else {
        setAppointments(appointmentsData || []);
      }

      setLoading(false);
    },
    []
  );

  // Recarga após criar/editar/excluir (sem voltar ao estado de carregamento).
  const fetchData = React.useCallback(async () => {
    if (!userId) return;
    applyData(await queryData(userId));
  }, [applyData, queryData, userId]);

  // Carga inicial (o estado inicial já é "carregando").
  React.useEffect(() => {
    if (!userId) return;
    let active = true;
    queryData(userId).then((result) => {
      if (active) applyData(result);
    });
    return () => {
      active = false;
    };
  }, [applyData, queryData, userId]);

  const handleSaveProfessional = async (
    data: ProfessionalFormValues,
    professionalId?: string
  ) => {
    if (!session?.user) return;

    const payload = { ...data, user_id: session.user.id };

    const { error } = professionalId
      ? await db.from('professionals').update(payload).eq('id', professionalId)
      : await db.from('professionals').insert(payload);

    if (error) {
      toast.error('Erro ao salvar profissional.', {
        description: error.message,
      });
      return;
    }

    toast.success(
      `Profissional ${professionalId ? 'atualizado' : 'cadastrado'} com sucesso.`
    );
    setIsProfessionalModalOpen(false);
    await fetchData();
  };

  const handleDeleteProfessional = async (professionalId: string) => {
    const { error } = await db
      .from('professionals')
      .delete()
      .eq('id', professionalId);

    if (error) {
      toast.error('Erro ao remover profissional.', {
        description: error.message,
      });
      return;
    }

    toast.success('Profissional removido com sucesso.');
    await fetchData();
  };

  const handleSaveAppointment = async (
    data: AppointmentFormValues,
    appointmentId?: string
  ) => {
    if (!session?.user) return;

    const appointmentDate = data.appointment_date;
    const [hours, minutes] = data.appointment_time.split(':').map(Number);
    const appointmentDateTime = setMinutes(
      setHours(startOfDay(appointmentDate), hours),
      minutes
    );

    const payload = {
      user_id: session.user.id,
      professional_id: data.professional_id,
      appointment_time: appointmentDateTime.toISOString(),
      notes: data.notes,
    };

    const { error } = appointmentId
      ? await db.from('appointments').update(payload).eq('id', appointmentId)
      : await db.from('appointments').insert(payload);

    if (error) {
      toast.error('Erro ao salvar consulta.', {
        description: error.message,
      });
      return;
    }

    toast.success(
      `Consulta ${appointmentId ? 'atualizada' : 'agendada'} com sucesso.`
    );
    setIsAppointmentModalOpen(false);
    await fetchData();
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    const { error } = await db
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      toast.error('Erro ao cancelar consulta.', {
        description: error.message,
      });
      return;
    }

    toast.success('Consulta cancelada com sucesso.');
    await fetchData();
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

  const calendarEvents = appointments.map((appointment) => ({
    title: `${format(parseISO(appointment.appointment_time), 'HH:mm')} - ${appointment.professionals?.name}`,
    start: parseISO(appointment.appointment_time),
    end: parseISO(appointment.appointment_time),
    resource: appointment,
  }));

  const upcomingAppointments = appointments
    .filter(
      (appointment) =>
        new Date(appointment.appointment_time) >= startOfDay(new Date())
    )
    .sort(
      (left, right) =>
        new Date(left.appointment_time).getTime() -
        new Date(right.appointment_time).getTime()
    );

  const nextAppointment = upcomingAppointments[0] ?? null;

  function formatAppointmentDate(appointment: Appointment) {
    return format(
      parseISO(appointment.appointment_time),
      "dd/MM/yyyy 'às' HH:mm"
    );
  }

  function getProfessionalInitial(name: string | undefined) {
    return name?.trim().charAt(0).toUpperCase() || 'L';
  }

  if (loading) {
    return <Skeleton className="h-[80vh] w-full" />;
  }

  const appointmentsConfig = appConfig.appointments;
  const titleStyle = {
    fontSize: scaleRem(1.875, appConfig.typography.pageTitle),
  };
  const bodyStyle = {
    fontSize: scaleRem(0.95, appConfig.typography.pageBody),
  };
  const cardTitleStyle = {
    fontSize: scaleRem(1.5, appConfig.typography.cardTitle),
  };
  const cardBodyStyle = {
    fontSize: scaleRem(0.95, appConfig.typography.cardBody),
  };
  const buttonStyle = {
    fontSize: scaleRem(0.875, appConfig.typography.buttonLabel),
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-border/70 bg-[linear-gradient(140deg,rgba(255,255,255,0.96),rgba(247,250,255,0.86),rgba(255,255,255,0.92))]">
            <CardHeader className="gap-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
                    <CalendarClock className="mr-2 h-3.5 w-3.5" />
                    {appointmentsConfig.heroBadge}
                  </Badge>
                  <CardTitle className="mt-4" style={titleStyle}>
                    {appointmentsConfig.heroTitle}
                  </CardTitle>
                  <CardDescription
                    className="mt-2 max-w-xl leading-7"
                    style={bodyStyle}
                  >
                    {appointmentsConfig.heroDescription}
                  </CardDescription>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => {
                      setAppointmentToEdit(null);
                      setSelectedDate(new Date());
                      setIsAppointmentModalOpen(true);
                    }}
                    style={buttonStyle}
                  >
                    <Plus data-icon="inline-start" />
                    Agendar consulta
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setProfessionalToEdit(null);
                      setIsProfessionalModalOpen(true);
                    }}
                    style={buttonStyle}
                  >
                    <UserRoundPlus data-icon="inline-start" />
                    Novo profissional
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-border/70 bg-white/82 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                    Próximo encontro
                  </p>
                  <p className="mt-3 font-display text-xl font-semibold text-foreground">
                    {nextAppointment?.professionals?.name ||
                      'Livre por enquanto'}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {nextAppointment
                      ? formatAppointmentDate(nextAppointment)
                      : 'Sem consulta futura agendada. Você pode marcar um novo horário agora.'}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border/70 bg-white/82 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                    Profissionais ativos
                  </p>
                  <p className="mt-3 font-mono text-3xl text-primary">
                    {professionals.length}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Contatos prontos para entrar na sua agenda pessoal.
                  </p>
                </div>

                <div className="rounded-[24px] border border-border/70 bg-white/82 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                    Consultas registradas
                  </p>
                  <p className="mt-3 font-mono text-3xl text-cosmic">
                    {appointments.length}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Histórico sincronizado para acompanhar ritmo e constância.
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Alert className="h-fit border-cosmic/20 bg-cosmic-light/70 text-foreground">
            <Sparkles className="h-4 w-4 text-cosmic" />
            <AlertTitle>Orientação de uso</AlertTitle>
            <AlertDescription className="leading-7">
              Cadastre os profissionais uma única vez e depois agende, reagende
              ou cancele consultas diretamente no fluxo abaixo. O calendário
              permanece em pt-BR e ligado aos registros reais do banco.
            </AlertDescription>
          </Alert>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          {appointmentsConfig.showUpcomingList ? (
            <Card className="border-border/70 bg-white/88">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle style={cardTitleStyle}>
                    {appointmentsConfig.listTitle}
                  </CardTitle>
                  <CardDescription className="mt-2" style={cardBodyStyle}>
                    {appointmentsConfig.listDescription}
                  </CardDescription>
                </div>
                <Badge className="rounded-full border-accent/20 bg-accent/10 px-3 py-1 text-accent">
                  {upcomingAppointments.length} futura(s)
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(250,250,255,0.8))] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12">
                          <AvatarImage
                            src={
                              appointment.professionals?.avatar_url || undefined
                            }
                            alt={
                              appointment.professionals?.name || 'Profissional'
                            }
                          />
                          <AvatarFallback>
                            {getProfessionalInitial(
                              appointment.professionals?.name
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {appointment.professionals?.name || 'Profissional'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.professionals?.specialty ||
                              'Especialidade não informada'}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatAppointmentDate(appointment)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-3 py-1"
                        >
                          {format(
                            parseISO(appointment.appointment_time),
                            'HH:mm'
                          )}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Abrir ações da consulta"
                            >
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleSelectEvent({ resource: appointment })
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(event) => event.preventDefault()}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Cancelar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancelar consulta
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação remove o compromisso do seu
                                    calendário e do histórico agendado.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteAppointment(appointment.id)
                                    }
                                  >
                                    Confirmar cancelamento
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                    <HeartHandshake className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-4 font-display text-xl font-semibold text-foreground">
                      Nenhuma consulta futura agendada
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Quando você marcar um horário, ele aparecerá aqui com
                      acesso rápido para ajustes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {appointmentsConfig.showProfessionalsList ? (
            <Card className="border-border/70 bg-white/88">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle style={cardTitleStyle}>
                    {appointmentsConfig.professionalsTitle}
                  </CardTitle>
                  <CardDescription className="mt-2" style={cardBodyStyle}>
                    {appointmentsConfig.professionalsDescription}
                  </CardDescription>
                </div>
                <Badge className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                  {professionals.length} cadastrado(s)
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {professionals.length > 0 ? (
                  professionals.map((professional) => (
                    <div
                      key={professional.id}
                      className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(249,248,255,0.82))] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12">
                          <AvatarImage
                            src={professional.avatar_url || undefined}
                            alt={professional.name}
                          />
                          <AvatarFallback>
                            {getProfessionalInitial(professional.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {professional.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {professional.specialty}
                          </p>
                          {professional.contact ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {professional.contact}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-3 py-1"
                        >
                          ativo
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Abrir ações do profissional"
                            >
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setProfessionalToEdit(professional);
                                setIsProfessionalModalOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(event) => event.preventDefault()}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Remover
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remover profissional
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação exclui o cadastro do profissional
                                    da sua lista pessoal.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteProfessional(professional.id)
                                    }
                                  >
                                    Confirmar remoção
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                    <Stethoscope className="mx-auto h-10 w-10 text-cosmic" />
                    <p className="mt-4 font-display text-xl font-semibold text-foreground">
                      Nenhum profissional cadastrado
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Adicione seus contatos para acelerar o agendamento e
                      manter tudo organizado.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </section>

        {appointmentsConfig.showCalendar ? (
          <Card className="border-border/70 bg-white/90">
            <CardHeader>
              <CardTitle style={cardTitleStyle}>
                {appointmentsConfig.calendarTitle}
              </CardTitle>
              <CardDescription className="mt-2" style={cardBodyStyle}>
                {appointmentsConfig.calendarDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Agenda
                events={calendarEvents}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>

      {isAppointmentModalOpen ? (
        <AppointmentFormModal
          open={isAppointmentModalOpen}
          onOpenChange={setIsAppointmentModalOpen}
          onSave={handleSaveAppointment}
          professionals={professionals}
          initialDate={selectedDate}
          appointmentToEdit={appointmentToEdit}
        />
      ) : null}

      {isProfessionalModalOpen ? (
        <ProfessionalFormModal
          open={isProfessionalModalOpen}
          onOpenChange={setIsProfessionalModalOpen}
          onSave={handleSaveProfessional}
          professionalToEdit={professionalToEdit}
        />
      ) : null}
    </>
  );
}
