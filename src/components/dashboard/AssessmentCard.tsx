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

  const handleMoodSubmit = async () => {
    if (!moodValue) {
      toast.error('Por favor, selecione um humor.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/data/user-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mood',
          payload: { moodValue }
        })
      });
      if (!res.ok) throw new Error('Falha na API');
      
      setCompleted((prev) => ({ ...prev, mood: true }));
      toast.success('Estado emocional registrado com sucesso!');
      setActiveTab('who5');
    } catch (err) {
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
      const score = Object.values(who5Answers).reduce((acc, val) => acc + Number(val), 0);
      const res = await fetch('/api/data/user-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'who5',
          payload: { answers: who5Answers }
        })
      });
      if (!res.ok) throw new Error('Falha na API');
      
      setCompleted((prev) => ({ ...prev, who5: true }));
      toast.success('Índice WHO-5 calculado e salvo com excelência!');
      setActiveTab('nps');
    } catch (err) {
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
      const res = await fetch('/api/data/user-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nps',
          payload: { score: npsScore, notes: npsNotes }
        })
      });
      if (!res.ok) throw new Error('Falha na API');
      
      setCompleted((prev) => ({ ...prev, nps: true }));
      toast.success('Seu feedback é o combustível da nossa inovação. Obrigado!');
    } catch (err) {
      toast.error('Erro ao enviar feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllCompleted = completed.mood && completed.who5 && completed.nps;

  if (isAllCompleted) {
    return (
      <Card className="overflow-hidden border-success/20 bg-success/5 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-success/20 text-success">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Avaliações Concluídas!</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Sua coerência biológica e espiritual agradece. Seus dados refinam nossos algoritmos cósmicos de inteligência artificial.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Avaliação Integrativa
            </CardTitle>
            <CardDescription className="mt-1">
              Refinamento diário de bem-estar quântico
            </CardDescription>
          </div>
          <div className="flex gap-2 bg-background/50 p-1 rounded-lg border border-border/50">
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
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Como está a sua energia e o seu humor hoje?
            </h4>
            <RadioGroup
              value={moodValue}
              onValueChange={setMoodValue}
              className="grid grid-cols-5 gap-3"
            >
              {[
                { val: '1', emoji: '😫', label: 'Exausto' },
                { val: '2', emoji: '😕', label: 'Baixo' },
                { val: '3', emoji: '😐', label: 'Neutro' },
                { val: '4', emoji: '🙂', label: 'Bom' },
                { val: '5', emoji: '🤩', label: 'Radiante' },
              ].map((m) => (
                <div key={m.val}>
                  <RadioGroupItem value={m.val} id={`mood-${m.val}`} className="peer sr-only" />
                  <Label
                    htmlFor={`mood-${m.val}`}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-muted/50 p-3 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider">{m.label}</span>
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
              { id: 5, text: 'O meu dia a dia esteve preenchido por coisas que me interessam?' },
            ].map((q) => (
              <div key={q.id} className="flex flex-col gap-2">
                <Label className="text-sm font-medium">{q.text}</Label>
                <RadioGroup
                  value={who5Answers[q.id]}
                  onValueChange={(val) => setWho5Answers((prev) => ({ ...prev, [q.id]: val }))}
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
                        className="flex cursor-pointer items-center justify-center rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-all"
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
                Qual a probabilidade de você recomendar a nossa jornada Quântica-Védica a um amigo?
              </Label>
              <div className="flex justify-between w-full mt-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNpsScore(num)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md border text-sm font-medium transition-all hover:bg-primary/10 hover:border-primary/50",
                      npsScore === num 
                        ? "bg-primary text-primary-foreground border-primary scale-110 shadow-sm" 
                        : "bg-background border-border/60 text-foreground/80"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">0 - Nada provável</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase">10 - Muito provável</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <Label htmlFor="nps-notes" className="text-sm font-medium">O que motivou a sua nota? (Opcional)</Label>
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

      <CardFooter className="bg-muted/10 border-t border-border/40 pt-4 flex justify-end">
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
