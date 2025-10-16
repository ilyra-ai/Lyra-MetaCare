"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfessionalCard } from "./ProfessionalCard";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { BookingConfirmationModal } from "./BookingConfirmationModal";
import { Button } from "@/components/ui/button";
import { format, setHours, setMinutes, startOfDay } from "date-fns";

interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string | null;
  rating: number | null;
  bio: string | null;
}

export function AppointmentsContent() {
  const { supabase, session } = useAuth();
  const [professionals, setProfessionals] = React.useState<Professional[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedProfessional, setSelectedProfessional] = React.useState<Professional | null>(null);
  const [bookedSlots, setBookedSlots] = React.useState<Date[]>([]);
  const [selectedTime, setSelectedTime] = React.useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchProfessionals = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("professionals").select("*");
    if (error) {
      toast.error("Erro ao carregar profissionais.", { description: error.message });
    } else {
      setProfessionals(data as Professional[]);
    }
    setLoading(false);
  }, [supabase]);

  const fetchBookedSlots = React.useCallback(async (date: Date, professionalId: string) => {
    const startOfDayDate = startOfDay(date);
    const endOfDayDate = setMinutes(setHours(startOfDay(date), 23), 59);

    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("professional_id", professionalId)
      .gte("appointment_time", startOfDayDate.toISOString())
      .lte("appointment_time", endOfDayDate.toISOString());

    if (error) {
      toast.error("Erro ao buscar horários.", { description: error.message });
      setBookedSlots([]);
    } else {
      setBookedSlots(data.map(slot => new Date(slot.appointment_time)));
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  React.useEffect(() => {
    if (selectedDate && selectedProfessional) {
      fetchBookedSlots(selectedDate, selectedProfessional.id);
    }
  }, [selectedDate, selectedProfessional, fetchBookedSlots]);

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    setSelectedTime(null); // Reset time when professional changes
  };

  const handleBookingConfirm = async () => {
    if (!session?.user || !selectedProfessional || !selectedDate || !selectedTime) {
      toast.error("Informações incompletas para o agendamento.");
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      user_id: session.user.id,
      professional_id: selectedProfessional.id,
      appointment_time: selectedTime.toISOString(),
      meeting_link: `https://meet.example.com/${Math.random().toString(36).substring(2)}`, // Link simulado
    });

    if (error) {
      toast.error("Falha ao agendar consulta.", { description: error.message });
    } else {
      toast.success("Consulta agendada com sucesso!");
      setIsModalOpen(false);
      setSelectedTime(null);
      if (selectedDate && selectedProfessional) {
        fetchBookedSlots(selectedDate, selectedProfessional.id); // Refresh slots
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>1. Selecione uma Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="p-0"
              disabled={(date) => date < startOfDay(new Date())}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>2. Escolha um Profissional</CardTitle>
            <CardDescription>Selecione com quem você deseja agendar a consulta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : (
              professionals.map(prof => (
                <ProfessionalCard
                  key={prof.id}
                  professional={prof}
                  isSelected={selectedProfessional?.id === prof.id}
                  onSelect={handleProfessionalSelect}
                />
              ))
            )}
          </CardContent>
        </Card>

        {selectedProfessional && (
          <Card className="animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle>3. Selecione um Horário</CardTitle>
              <CardDescription>
                Horários disponíveis para {selectedProfessional.name} em {selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimeSlotPicker
                selectedDate={selectedDate || new Date()}
                bookedSlots={bookedSlots}
                onTimeSelect={setSelectedTime}
                selectedTime={selectedTime}
              />
              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={!selectedTime}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              >
                Agendar Consulta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <BookingConfirmationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        professional={selectedProfessional}
        date={selectedDate || null}
        time={selectedTime}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
}