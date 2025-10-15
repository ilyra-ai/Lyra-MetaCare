"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | undefined;
  onChange: (value: string) => void;
}

// Função para formatar a string de entrada para HH:MM
const formatInputTime = (value: string): string => {
  // Remove todos os caracteres que não são dígitos
  let digits = value.replace(/\D/g, '');
  
  // Limita a 4 dígitos (HHMM)
  digits = digits.substring(0, 4);
  
  // Se tiver 4 dígitos, aplica a máscara HH:MM
  if (digits.length === 4) {
    return `${digits.substring(0, 2)}:${digits.substring(2, 4)}`;
  }
  
  // Caso contrário, retorna os dígitos brutos
  return digits;
};

export function TimeInput({ value, onChange, className, ...props }: TimeInputProps) {
  // Garante que o estado interno comece com uma string vazia se o valor for undefined
  const [inputValue, setInputValue] = React.useState(value || "");

  React.useEffect(() => {
    // Sincroniza o estado interno com o valor externo (do formulário)
    setInputValue(value || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // 1. Remove caracteres não-dígitos
    const digits = rawValue.replace(/\D/g, '');
    
    // 2. Limita a 4 dígitos
    const limitedDigits = digits.substring(0, 4);
    
    // 3. Se atingiu 4 dígitos, aplica a formatação HH:MM
    if (limitedDigits.length === 4) {
        const formattedValue = formatInputTime(limitedDigits);
        setInputValue(formattedValue);
        onChange(formattedValue); // Envia o valor formatado para o hook form
    } else {
        // Se não tiver 4 dígitos, exibe os dígitos brutos e envia para o hook form
        setInputValue(limitedDigits);
        onChange(limitedDigits);
    }
  };

  return (
    <Input
      type="text"
      placeholder="HH:MM"
      value={inputValue}
      onChange={handleInputChange}
      maxLength={5} // HH:MM tem 5 caracteres
      className={cn("font-mono", className)}
      {...props}
    />
  );
}