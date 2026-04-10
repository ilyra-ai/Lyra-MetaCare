'use client';

import type { ComponentType } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type CalendarProps,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  allDay: 'Dia todo',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`,
};

export interface AgendaEvent<TResource extends object> {
  title: string;
  start: Date;
  end: Date;
  resource: TResource;
}

interface SlotInfo {
  start: Date;
  end: Date;
  slots: Date[];
  action: 'select' | 'click' | 'doubleClick';
}

interface AgendaProps<TResource extends object> {
  events: AgendaEvent<TResource>[];
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: (event: AgendaEvent<TResource>) => void;
}

export function Agenda<TResource extends object>({
  events,
  onSelectSlot,
  onSelectEvent,
}: AgendaProps<TResource>) {
  const TypedCalendar = Calendar as unknown as ComponentType<
    CalendarProps<AgendaEvent<TResource>, object>
  >;

  return (
    <div className="h-[300px]">
      <TypedCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture="pt-BR"
        messages={messages}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
      />
    </div>
  );
}
