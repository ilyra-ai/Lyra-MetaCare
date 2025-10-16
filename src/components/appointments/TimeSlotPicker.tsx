"use client";

import { Button } from "@/components/ui/button";
import { addHours, format, isBefore, setHours, setMinutes, startOfDay } from "date-fns";

interface TimeSlotPickerProps {
  selectedDate: Date;
  bookedSlots: Date[];
  onTimeSelect: (time: Date) => void;
  selectedTime: Date | null;
}

// Gera horários de 30 em 30 minutos
const generateTimeSlots = (date: Date): Date[] => {
  const start = setMinutes(setHours(startOfDay(date), 9), 0); // 9:00
  const end = setMinutes(setHours(startOfDay(date), 17), 0); // 17:00
  const slots = [];
  let current = start;

  while (current <= end) {
    slots.push(current);
    current = new Date(current.getTime() + 30 * 60 * 1000); // Adiciona 30 minutos
  }
  return slots;
};

export function TimeSlotPicker({ selectedDate, bookedSlots, onTimeSelect, selectedTime }: TimeSlotPickerProps) {
  const timeSlots = generateTimeSlots(selectedDate);
  const now = new Date();

  const isSlotBooked = (slot: Date) => {
    return bookedSlots.some(bookedSlot => new Date(bookedSlot).getTime() === slot.getTime());
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {timeSlots.map((slot, index) => {
        const isPast = isBefore(slot, now);
        const isBooked = isSlotBooked(slot);
        const isSelected = selectedTime?.getTime() === slot.getTime();

        return (
          <Button
            key={index}
            variant={isSelected ? "default" : "outline"}
            disabled={isPast || isBooked}
            onClick={() => onTimeSelect(slot)}
            className={isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {format(slot, "HH:mm")}
          </Button>
        );
      })}
    </div>
  );
}