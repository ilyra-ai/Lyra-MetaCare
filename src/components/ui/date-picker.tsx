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
const formatInputDate = (value: string): { displayValue: string, date: Date | undefined } => {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, '');

  let displayValue = value; // Valor a ser exibido no input
  let date: Date | undefined = undefined;

  if (cleanValue.length === 8) {
    // Se tiver exatamente 8 dígitos, aplica a máscara e tenta parsear
    const day = cleanValue.substring(0, 2);
    const month = cleanValue.substring(2, 4);
    const year = cleanValue.substring(4, 8);
    
    const formattedDateString = `${day}/${month}/${year}`;
    
    const parsedDate = parse(formattedDateString, 'dd/MM/yyyy', new Date());
    
    if (isValid(parsedDate)) {
      date = parsedDate;
      displayValue = formattedDateString; // Exibe a data formatada
    } else {
      // Se for inválida (ex: 35/02/2000), exibe a entrada original limpa
      displayValue = cleanValue;
    }
  } else if (cleanValue.length < 8) {
    // Se tiver menos de 8 dígitos, exibe apenas os dígitos limpos
    displayValue = cleanValue;
  } else {
    // Se tiver mais de 8 dígitos, trunca e exibe os 8 dígitos limpos
    displayValue = cleanValue.substring(0, 8);
  }

  return { displayValue, date };
};

export function DatePicker({ value, onChange, placeholder = "DD/MM/AAAA", id, disabled }: DatePickerProps) {
  // O estado interno agora armazena a string de exibição (pode ser DDMMAAAA ou DD/MM/AAAA)
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
    const { displayValue, date } = formatInputDate(rawValue);
    
    setInputValue(displayValue);

    // Se a data for válida e completa (8 dígitos limpos), atualiza o valor do formulário
    if (date) {
      onChange(date);
    } else if (date === undefined && value !== undefined) {
      // Limpa o valor do formulário se a entrada não for uma data válida de 8 dígitos
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
          maxLength={10} // Permite 10 caracteres (DD/MM/AAAA)
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