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
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// Função para formatar a string de entrada para DD/MM/YYYY
const formatInputDate = (value: string): string => {
  // Remove todos os caracteres que não são dígitos
  let digits = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos (DDMMYYYY)
  digits = digits.substring(0, 8);
  
  let formatted = '';
  
  if (digits.length > 0) {
    formatted += digits.substring(0, 2); // DD
  }
  if (digits.length > 2) {
    formatted += '/' + digits.substring(2, 4); // MM
  }
  if (digits.length > 4) {
    formatted += '/' + digits.substring(4, 8); // YYYY
  }
  
  return formatted;
};

// Função para tentar parsear a data a partir de DD/MM/YYYY ou DDMMYYYY
const parseDateInput = (value: string): Date | undefined => {
    // 1. Tenta parsear o formato DD/MM/YYYY
    let parsedDate = parse(value, "dd/MM/yyyy", new Date());
    
    if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
        return parsedDate;
    }

    // 2. Tenta parsear o formato contínuo DDMMYYYY
    const digits = value.replace(/\D/g, '');
    if (digits.length === 8) {
        parsedDate = parse(digits, "ddMMyyyy", new Date());
        if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }

    return undefined;
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
    // Sincroniza o estado interno com o valor externo (do formulário)
    setInputValue(value ? format(value, "dd/MM/yyyy") : "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // 1. Formata a string de entrada para DD/MM/YYYY
    const formattedValue = formatInputDate(rawValue);
    setInputValue(formattedValue);

    // 2. Tenta parsear a data formatada
    const parsedDate = parseDateInput(formattedValue);

    if (parsedDate) {
      // Se a data for válida, atualiza o valor do formulário
      onChange(parsedDate);
    } else if (formattedValue.length === 0) {
      // Se o campo estiver vazio, limpa o valor do formulário
      onChange(undefined);
    }
    // Se for inválido e não vazio, o valor do formulário (value) permanece o último valor válido.
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
            maxLength={10} // Limita o tamanho máximo para DD/MM/YYYY
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