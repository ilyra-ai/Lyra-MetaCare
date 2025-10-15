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
  
  // Se não tiver 8 dígitos, retorna os dígitos brutos
  if (digits.length < 8) {
    return digits;
  }
  
  // Se tiver 8 dígitos, aplica a máscara DD/MM/YYYY
  return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`;
};

// Função para tentar parsear a data a partir de DD/MM/YYYY ou DDMMYYYY
const parseDateInput = (value: string): Date | undefined => {
    // Remove caracteres não-dígitos para padronizar
    const digits = value.replace(/\D/g, '');
    
    if (digits.length !== 8) {
        return undefined;
    }

    // Tenta parsear o formato contínuo DDMMYYYY
    const parsedDate = parse(digits, "ddMMyyyy", new Date());
    
    if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
        return parsedDate;
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
  // Usamos o estado interno para armazenar a string bruta ou formatada
  const [inputValue, setInputValue] = React.useState(value ? format(value, "dd/MM/yyyy") : "");

  React.useEffect(() => {
    // Sincroniza o estado interno com o valor externo (do formulário)
    // Se o valor externo mudar (ex: reset do form), atualiza o input
    setInputValue(value ? format(value, "dd/MM/yyyy") : "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // 1. Remove caracteres não-dígitos para obter a string bruta
    const digits = rawValue.replace(/\D/g, '');
    
    // 2. Limita a 8 dígitos
    const limitedDigits = digits.substring(0, 8);
    
    // 3. Atualiza o input com os dígitos brutos (sem formatação)
    setInputValue(limitedDigits);

    // 4. Se atingiu 8 dígitos, tenta formatar e parsear
    if (limitedDigits.length === 8) {
        const formattedValue = formatInputDate(limitedDigits);
        setInputValue(formattedValue); // Exibe a data formatada
        
        const parsedDate = parseDateInput(formattedValue);
        
        if (parsedDate) {
            onChange(parsedDate); // Envia a data válida para o hook form
        } else {
            // Se 8 dígitos foram digitados mas o parse falhou (ex: 99/99/9999), limpa o valor do form
            onChange(undefined);
        }
    } else {
        // Se não tiver 8 dígitos, garante que o valor do form seja undefined
        onChange(undefined);
    }
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
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            className="pl-10"
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