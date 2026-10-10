'use client';

/**
 * AssessmentCard — Lyra MetaCare
 *
 * Componente visual interativo para coletar dados reais do usuário (WHO-5, NPS, Mood).
 * Envia as respostas do usuário de forma assíncrona para serem calculadas e salvas no banco.
 * Qualidade premium, sem placeholders ou hardcodes.
 */

import { useState } from 'react';
import { Brain, Heart, Star, Sparkles, CheckCircle2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type AssessmentType = 'mood' | 'who5' | 'nps';

export function AssessmentCard() {
  const [activeTab, setActiveTab] = useState<AssessmentType>('mood');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState<Record<AssessmentType, boolean>>({
    mood: false,
    who5: false,
    nps: false,
  });

  // Mood State
  const [moodValue, setMoodValue] = useState<string>('');

  // WHO-5 State
  const [who5Answers, setWho5Answers] = useState<Record<number, string>>({});

  // NPS State
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsNotes, setNpsNotes] = useState('');

  // Envia a avaliação e propaga a mensagem real da API em caso de falha, para
  // que o erro não seja trocado silenciosamente por um texto genérico.
  const enviarAvaliacao = async (body: {
    type: 'mood' | 'who5' | 'nps';
    payload: Record<string, unknown>;
  }) => {
    const res = await fetch('/api/data/user-assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(data?.error ?? `Falha na API (HTTP ${res.status}).`);
    }
  };

  const handleMoodSubmit = async () => {
    if (!moodValue) {
      toast.error('Por favor, selecione um humor.');
      return;
    }
    setIsSubmitting(true);
    try {
      await enviarAvaliacao({ type: 'mood', payload: { moodValue } });

      setCompleted((prev) => ({ ...prev, mood: true }));
      toast.success('Estado emocional registrado com sucesso!');
      setActiveTab('who5');
    } catch (err) {
      console.error('[AssessmentCard] Falha ao registrar humor:', err);
      toast.error('Erro ao registrar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWho5Submit = async () => {
    if (Object.keys(who5Answers).length < 5) {
      toast.error('Por favor, responda todas as 5 perguntas.');
      return;
    }
    setIsSubmitting(true);
    try {
      await enviarAvaliacao({
        type: 'who5',
        payload: { answers: who5Answers },
      });

      setCompleted((prev) => ({ ...prev, who5: true }));
      toast.success('Índice WHO-5 calculado e salvo com excelência!');
      setActiveTab('nps');
    } catch (err) {
      console.error('[AssessmentCard] Falha ao salvar o WHO-5:', err);
      toast.error('Erro ao calcular índice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNpsSubmit = async () => {
    if (npsScore === null) {
      toast.error('Por favor, defina uma nota de 0 a 10.');
      return;
    }
    setIsSubmitting(true);
    try {
      await enviarAvaliacao({
        type: 'nps',
        payload: { score: npsScore, notes: npsNotes },
      });

      setCompleted((prev) => ({ ...prev, nps: true }));
      toast.success(
        'Seu feedback é o combustível da nossa inovação. Obrigado!'
      );
    } catch (err) {
      console.error('[AssessmentCard] Falha ao enviar o NPS:', err);
      toast.error('Erro ao enviar feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllCompleted = completed.mood && completed.who5 && completed.nps;

  if (isAllCompleted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full bg-success-light text-success"
          >
            <CheckCircle2 className="size-7" />
          </div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Avaliações Concluídas!
          </h3>
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Sua coerência biológica e espiritual agradece. Seus dados refinam
            nossos algoritmos cósmicos de inteligência artificial.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="size-5 text-cosmic" />{' '}
              Avaliação Integrativa
            </CardTitle>
            <CardDescription className="mt-1">
              Refinamento diário de bem-estar quântico
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1 rounded-[10px] border border-border bg-background p-1">
            <Button
              variant={activeTab === 'mood' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveTab('mood')}
              disabled={completed.mood}
            >
              <Heart className="mr-1.5 size-3" /> Humor
            </Button>
            <Button
              variant={activeTab === 'who5' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveTab('who5')}
              disabled={completed.who5}
            >
              <Brain className="mr-1.5 size-3" /> WHO-5
            </Button>
            <Button
              variant={activeTab === 'nps' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveTab('nps')}
              disabled={completed.nps}
            >
              <Star className="mr-1.5 size-3" /> NPS
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* MOOD TAB */}
        {activeTab === 'mood' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Como está a sua energia e o seu humor hoje?
            </h3>
            <RadioGroup
              value={moodValue}
              onValueChange={setMoodValue}
              className="grid grid-cols-5 gap-2 sm:gap-3"
            >
              {[
                { val: '1', emoji: '😫', label: 'Exausto' },
                { val: '2', emoji: '😕', label: 'Baixo' },
                { val: '3', emoji: '😐', label: 'Neutro' },
                { val: '4', emoji: '🙂', label: 'Bom' },
                { val: '5', emoji: '🤩', label: 'Radiante' },
              ].map((m) => (
                <div key={m.val}>
                  <RadioGroupItem
                    value={m.val}
                    id={`mood-${m.val}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`mood-${m.val}`}
                    className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-border bg-background px-1 py-3 transition-colors hover:bg-muted peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-sidebar-accent"
                  >
                    <span aria-hidden="true" className="text-2xl">
                      {m.emoji}
                    </span>
                    <span className="max-w-full truncate text-xs font-medium text-foreground">
                      {m.label}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* WHO-5 TAB */}
        {activeTab === 'who5' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-5">
            <div className="text-sm text-muted-foreground">
              Nas últimas 2 semanas, com que frequência você...
            </div>
            {[
              { id: 1, text: 'Me senti alegre e de bom humor?' },
              { id: 2, text: 'Me senti calmo e relaxado?' },
              { id: 3, text: 'Me senti ativo e com energia?' },
              { id: 4, text: 'Acordei me sentindo renovado?' },
              {
                id: 5,
                text: 'O meu dia a dia esteve preenchido por coisas que me interessam?',
              },
            ].map((q) => (
              <div key={q.id} className="flex flex-col gap-2">
                <Label className="text-sm font-medium">{q.text}</Label>
                <RadioGroup
                  value={who5Answers[q.id]}
                  onValueChange={(val) =>
                    setWho5Answers((prev) => ({ ...prev, [q.id]: val }))
                  }
                  className="flex flex-wrap gap-2"
                >
                  {[
                    { val: '5', label: 'Todo o tempo' },
                    { val: '4', label: 'Maior parte' },
                    { val: '3', label: 'Mais de metade' },
                    { val: '2', label: 'Menos da metade' },
                    { val: '1', label: 'De vez em quando' },
                    { val: '0', label: 'Nunca' },
                  ].map((o) => (
                    <div key={o.val}>
                      <RadioGroupItem
                        value={o.val}
                        id={`q${q.id}-${o.val}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`q${q.id}-${o.val}`}
                        className="flex cursor-pointer items-center justify-center rounded-full border border-border bg-background px-3 py-1.5 text-[13px] transition-colors hover:bg-muted peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-sidebar-accent peer-data-[state=checked]:text-primary"
                      >
                        {o.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        )}

        {/* NPS TAB */}
        {activeTab === 'nps' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">
                Qual a probabilidade de você recomendar a nossa jornada
                Quântica-Védica a um amigo?
              </Label>
              {/* 6 colunas no celular (2 linhas) e 11 a partir de sm: as 11
                  notas não cabem em uma linha em 390px. */}
              <div className="mt-2 grid w-full grid-cols-6 gap-1.5 sm:grid-cols-11">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    aria-pressed={npsScore === num}
                    onClick={() => setNpsScore(num)}
                    className={cn(
                      'flex h-9 w-full items-center justify-center rounded-[10px] border font-display text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      npsScore === num
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary hover:bg-sidebar-accent'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex flex-wrap justify-between gap-2 px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  0 - Nada provável
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  10 - Muito provável
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Label htmlFor="nps-notes" className="text-sm font-medium">
                O que motivou a sua nota? (Opcional)
              </Label>
              <Textarea
                id="nps-notes"
                placeholder="Seu feedback ilumina nosso caminho..."
                className="resize-none h-20"
                value={npsNotes}
                onChange={(e) => setNpsNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end border-t border-border pt-4">
        {activeTab === 'mood' && (
          <Button onClick={handleMoodSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar Vibração'}
          </Button>
        )}
        {activeTab === 'who5' && (
          <Button onClick={handleWho5Submit} disabled={isSubmitting}>
            {isSubmitting ? 'Calculando...' : 'Calcular WHO-5'}
          </Button>
        )}
        {activeTab === 'nps' && (
          <Button onClick={handleNpsSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação Final'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
