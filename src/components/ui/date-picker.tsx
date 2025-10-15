"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input"; // Importando Input

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "DD/MM/AAAA",
  className,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState(value ? format(value, "dd/MM/yyyy") : "");

  React.useEffect(() => {
    setInputValue(value ? format(value, "dd/MM/yyyy") : "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    // Tenta parsear a data no formato DD/MM/YYYY
    const parsedDate = parse(rawValue, "dd/MM/yyyy", new Date());

    if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
      // Se a data for válida, atualiza o valor do formulário
      onChange(parsedDate);
    } else if (rawValue === "") {
      // Se o campo estiver vazio, limpa o valor do formulário
      onChange(undefined);
    }
    // Se for inválido, mantemos o valor do formulário inalterado até que seja válido
  };

  const handleSelect: SelectSingleEventHandler = (date) => {
    onChange(date);
    setInputValue(date ? format(date, "dd/MM/yyyy") : "");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={cn("relative w-full", className)}>
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            className="pl-10" // Adiciona padding para o ícone
          />
          <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}