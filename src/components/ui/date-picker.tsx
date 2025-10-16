"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

// Função de formatação e validação de entrada de texto
const formatInputDate = (value: string): { formatted: string, date: Date | undefined } => {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, '');

  let formatted = cleanValue;
  let date: Date | undefined = undefined;

  if (cleanValue.length > 8) {
    formatted = cleanValue.substring(0, 8);
  }

  // Aplica a máscara DD/MM/AAAA
  if (formatted.length > 2) {
    formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
  }
  if (formatted.length > 5) {
    formatted = formatted.substring(0, 5) + '/' + formatted.substring(5);
  }

  // Se tiver 10 caracteres (DD/MM/AAAA), tenta parsear a data
  if (formatted.length === 10) {
    const parsedDate = parse(formatted, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate)) {
      date = parsedDate;
    }
  }

  return { formatted, date };
};

export function DatePicker({ value, onChange, placeholder = "DD/MM/AAAA", id, disabled }: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState(value ? format(value, "dd/MM/yyyy") : "");
  const [open, setOpen] = React.useState(false);

  // Sincroniza o valor externo (value) com o estado interno (inputValue)
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"));
    } else if (value === undefined) {
      setInputValue("");
    }
  }, [value]);

  // Lida com a seleção do calendário
  const handleSelect: SelectSingleEventHandler = (date) => {
    onChange(date);
    setOpen(false);
  };

  // Lida com a digitação no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const { formatted, date } = formatInputDate(rawValue);
    
    setInputValue(formatted);

    // Se a data for válida e completa (10 caracteres), atualiza o valor do formulário
    if (date && formatted.length === 10) {
      onChange(date);
    } else if (formatted.length < 10 && value !== undefined) {
      // Limpa o valor do formulário se o usuário estiver apagando a data
      onChange(undefined);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex items-center">
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className="pr-10" // Adiciona padding para o ícone
        />
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "absolute right-0 h-full px-3 py-2 rounded-l-none border-l-0",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={1900}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}