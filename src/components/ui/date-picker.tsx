'use client';

import * as React from 'react';
import { format, isValid, parse } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { OnSelectHandler } from '@daypicker/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

const normalizeDateInput = (value: string) => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 8);

  if (cleanValue.length < 8) {
    return {
      displayValue: cleanValue
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2}\/\d{2})(\d)/, '$1/$2'),
      date: undefined,
    };
  }

  const day = cleanValue.slice(0, 2);
  const month = cleanValue.slice(2, 4);
  const year = cleanValue.slice(4, 8);
  const displayValue = `${day}/${month}/${year}`;
  const parsedDate = parse(displayValue, 'dd/MM/yyyy', new Date());

  return {
    displayValue,
    date: isValid(parsedDate) ? parsedDate : undefined,
  };
};

export function DatePicker({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  id,
  disabled,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState(
    value ? format(value, 'dd/MM/yyyy') : ''
  );
  const [open, setOpen] = React.useState(false);

  // Sincroniza o texto com o valor vindo do formulário durante a renderização
  // (estado derivado). Quando o valor recebido é o mesmo que o próprio campo
  // acabou de emitir (ex.: `undefined` enquanto a data ainda está incompleta),
  // o texto digitado é preservado; antes ele era apagado a cada tecla quando o
  // campo já tinha uma data.
  const [syncedValue, setSyncedValue] = React.useState(value);
  const [lastEmittedValue, setLastEmittedValue] = React.useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value !== lastEmittedValue) {
      setInputValue(value ? format(value, 'dd/MM/yyyy') : '');
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { displayValue, date } = normalizeDateInput(event.target.value);

    setInputValue(displayValue);
    setLastEmittedValue(date);
    onChange(date);
  };

  const handleSelect: OnSelectHandler<Date | undefined> = (date) => {
    setInputValue(date ? format(date, 'dd/MM/yyyy') : '');
    setLastEmittedValue(date);
    onChange(date);
    setOpen(false);
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
          className="pr-14"
        />
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              'absolute right-1 h-10 w-10 rounded-full p-0',
              !value && 'text-muted-foreground'
            )}
            disabled={disabled}
            aria-label="Abrir calendário"
          >
            <CalendarIcon className="h-[18px] w-[18px]" />
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          autoFocus
          captionLayout="dropdown"
          defaultMonth={value}
          startMonth={new Date(1900, 0)}
          endMonth={new Date(new Date().getFullYear(), 11)}
        />
      </PopoverContent>
    </Popover>
  );
}
