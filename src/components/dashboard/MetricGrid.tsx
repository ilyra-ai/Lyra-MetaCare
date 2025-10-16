"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyMetric } from "@/hooks/use-daily-metrics";
import { Activity, BedDouble, HeartPulse, Flame, TrendingUp, Zap, BrainCircuit, Utensils, Droplet, Thermometer, Gauge, Moon, Clock, Smile, Dumbbell, RefreshCw, Sun, Waves, Rss, Clock4, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Helper Functions ---
const formatMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

// --- Metric Card Component ---
interface MetricCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    colorClass: string;
    className?: string;
}

function MetricCard({ title, value, description, icon: Icon, colorClass, className }: MetricCardProps) {
    return (
        <Card className={cn("h-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", colorClass)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

interface MetricGridProps {
    metrics: DailyMetric;
}

export function MetricGrid({ metrics }: MetricGridProps) {
    // Longevity Metric Calculations (Simulated based on data)
    const sleepQuality = metrics.sleep_duration_minutes >= 450 ? "Excelente" : (metrics.sleep_duration_minutes >= 360 ? "Bom" : "Abaixo da Meta");
    const hrvStatus = (metrics.hrv_ms || 0) >= 50 ? "Ótimo" : ((metrics.hrv_ms || 0) >= 30 ? "Bom" : "Baixo");
    
    // Using readiness_score for Prontidão
    const readinessScore = metrics.readiness_score || metrics.recovery_score; // Fallback to recovery_score if readiness is null
    const recoveryStatus = (readinessScore || 0) >= 80 ? "Pronto para o dia" : "Priorize o descanso";
    
    const moodStatus = metrics.mood_score === 5 ? "Excelente" : (metrics.mood_score && metrics.mood_score >= 3 ? "Neutro" : "Baixo");
    const hrrStatus = (metrics.hrr_1min_bpm || 0) >= 30 ? "Excelente" : "Atenção";
    const spo2Status = (metrics.spo2_average || 0) >= 95 ? "Normal" : "Monitorar";
    
    // Activity Metrics Status
    const moderateVigorousGoal = 150;
    const activeMinutesStatus = metrics.active_minutes >= moderateVigorousGoal ? "Meta semanal alcançada" : "Aumentar atividade";
    const stepsStatus = metrics.steps >= 8000 ? "Meta de 8k passos alcançada" : "Continue se movendo";
    const sedentaryStatus = (metrics.sedentary_hours || 0) < 8 ? "Baixo" : "Alto";


    const pillars = [
        {
            title: "Recuperação e Resiliência Autonômica",
            description: "Métricas que avaliam a capacidade do seu corpo de se adaptar ao estresse e se recuperar.",
            icon: RefreshCw,
            color: "text-red-600",
            metrics: [
                { 
                    title: "HRV (rMSSD)", 
                    value: metrics.hrv_ms ? `${metrics.hrv_ms} ms` : "N/A", 
                    description: `Resiliência ao estresse: ${hrvStatus}`, 
                    icon: HeartPulse, 
                    colorClass: "text-red-600" 
                },
                { 
                    title: "Score de Prontidão", 
                    value: readinessScore ? `${readinessScore}/100` : "N/A", 
                    description: recoveryStatus, 
                    icon: TrendingUp, 
                    colorClass: "text-green-700" 
                },
                { 
                    title: "FC de Repouso", 
                    value: metrics.resting_heart_rate ? `${metrics.resting_heart_rate} BPM` : "N/A", 
                    description: "Média da noite.", 
                    icon: HeartPulse, 
                    colorClass: "text-pink-600" 
                },
                { 
                    title: "Recuperação da FC (1 min)", 
                    value: metrics.hrr_1min_bpm ? `${metrics.hrr_1min_bpm} bpm` : "N/A", 
                    description: `Sinal de aptidão cardiovascular: ${hrrStatus}`, 
                    icon: Waves, 
                    colorClass: "text-orange-600" 
                },
                { 
                    title: "Temp. Cutânea Noturna", 
                    value: metrics.body_temperature_celsius ? `${metrics.body_temperature_celsius.toFixed(1)} °C` : "N/A", 
                    description: "Desvio da linha de base.", 
                    icon: Thermometer, 
                    colorClass: "text-cyan-600" 
                },
                { 
                    title: "SpO₂ Noturna (Média)", 
                    value: metrics.spo2_average ? `${metrics.spo2_average.toFixed(1)}%` : "N/A", 
                    // Ajustado para refletir que estamos usando a média, conforme o schema do DB
                    description: `Oxigenação do sangue (Média): ${spo2Status}`, 
                    icon: Moon, 
                    colorClass: "text-indigo-600" 
                },
            ]
        },
        {
            title: "Capacidade Cardiorrespiratória e Atividade Física",
            description: "Monitoramento do seu gasto energético, aptidão física e carga de estresse do treino.",
            icon: Activity,
            color: "text-orange-600",
            metrics: [
                { 
                    title: "VO₂max Estimado", // Métrica 13
                    value: metrics.vo2_max ? `${metrics.vo2_max.toFixed(1)} mL/kg/min` : "N/A", 
                    description: "Principal indicador de aptidão.", 
                    icon: Gauge, 
                    colorClass: "text-blue-600" 
                },
                { 
                    title: "Minutos Mod/Vigorosa", // Métrica 14 (Usando active_minutes como proxy)
                    value: `${metrics.active_minutes} min`, 
                    description: activeMinutesStatus, 
                    icon: Dumbbell, 
                    colorClass: "text-orange-600" 
                },
                { 
                    title: "Passos por Dia", // Métrica 15
                    value: `${metrics.steps.toLocaleString()} Steps`, 
                    description: stepsStatus, 
                    icon: Activity, 
                    colorClass: "text-green-600" 
                },
                { 
                    title: "Carga de Treino (EPOC)", // Métrica 16
                    value: metrics.training_load_epoc ? `${metrics.training_load_epoc.toFixed(0)} UA` : "N/A", 
                    description: "Estresse fisiológico do exercício.", 
                    icon: Flame, 
                    colorClass: "text-red-500" 
                },
                { 
                    title: "Strain Diário", // Métrica 17
                    value: metrics.daily_strain ? `${metrics.daily_strain.toFixed(1)} / 21` : "N/A", 
                    description: "Intensidade acumulada do dia.", 
                    icon: Zap, 
                    colorClass: "text-yellow-600" 
                },
                { 
                    title: "Tempo Sedentário", // Métrica 18 (Parte 1)
                    value: metrics.sedentary_hours ? `${metrics.sedentary_hours.toFixed(1)} h` : "N/A", 
                    description: `Nível de sedentarismo: ${sedentaryStatus}`, 
                    icon: Clock4, 
                    colorClass: "text-gray-500" 
                },
                { 
                    title: "Quebras Sedentárias", // Métrica 18 (Parte 2)
                    value: metrics.sedentary_breaks ? `${metrics.sedentary_breaks} pausas` : "N/A", 
                    description: "Número de pausas longas.", 
                    icon: Pause, 
                    colorClass: "text-teal-500" 
                },
            ]
        },
        {
            title: "Sono e Cronobiologia",
            description: "Análise da qualidade e estrutura do seu descanso noturno.",
            icon: BedDouble,
            color: "text-blue-600",
            metrics: [
                { 
                    title: "Duração do sono (h/noite)", // Métrica 7
                    value: formatMinutesToHours(metrics.sleep_duration_minutes), 
                    description: `Qualidade: ${sleepQuality}`, 
                    icon: BedDouble, 
                    colorClass: "text-blue-600" 
                },
                { 
                    title: "Eficiência do sono (%)", // Métrica 8
                    value: metrics.sleep_efficiency ? `${metrics.sleep_efficiency.toFixed(0)}%` : "N/A", 
                    description: "Sono vs. Tempo na cama.", 
                    icon: Clock, 
                    colorClass: "text-teal-600" 
                },
                { 
                    title: "Regularidade do Sono (SRI)", // Métrica 9
                    value: metrics.sleep_regularity_index ? `${metrics.sleep_regularity_index}/100` : "N/A", 
                    description: "Consistência dos horários de sono.", 
                    icon: Sun, 
                    colorClass: "text-yellow-600" 
                },
                { 
                    title: "Social Jetlag (h)", // Métrica 10
                    value: metrics.social_jetlag_hours ? `${metrics.social_jetlag_hours.toFixed(1)} h` : "N/A", 
                    description: "Desalinhamento entre dias úteis/fim de semana.", 
                    icon: Rss, 
                    colorClass: "text-orange-600" 
                },
                { 
                    title: "Sono REM (min)", // Métrica 11
                    value: formatMinutesToHours(metrics.rem_sleep_minutes), 
                    description: "Importante para a memória.", 
                    icon: BrainCircuit, 
                    colorClass: "text-indigo-600" 
                },
                { 
                    title: "WASO (min)", // Métrica 12
                    value: metrics.waso_minutes ? `${metrics.waso_minutes} min` : "N/A", 
                    description: "Tempo acordado após iniciar o sono.", 
                    icon: Moon, 
                    colorClass: "text-purple-600" 
                },
                { 
                    title: "Sono Profundo (min)", 
                    value: formatMinutesToHours(metrics.deep_sleep_minutes), 
                    description: "Crucial para recuperação física.", 
                    icon: BedDouble, 
                    colorClass: "text-pink-600" 
                },
            ]
        },
        {
            title: "Nutrição e Bem-Estar",
            description: "Monitoramento de macronutrientes, hidratação e estado mental.",
            icon: Utensils,
            color: "text-amber-600",
            metrics: [
                { 
                    title: "Proteína Consumida", 
                    value: `${metrics.protein_grams} g`, 
                    description: "Suporte muscular.", 
                    icon: Utensils, 
                    colorClass: "text-amber-600" 
                },
                { 
                    title: "Carboidratos", 
                    value: `${metrics.carb_grams} g`, 
                    description: "Fonte primária de energia.", 
                    icon: Utensils, 
                    colorClass: "text-lime-600" 
                },
                { 
                    title: "Gorduras", 
                    value: `${metrics.fat_grams} g`, 
                    description: "Saúde hormonal e celular.", 
                    icon: Utensils, 
                    colorClass: "text-brown-600" 
                },
                { 
                    title: "Hidratação", 
                    value: `${metrics.water_liters.toFixed(1)} L`, 
                    description: "Meta: 2.5L.", 
                    icon: Droplet, 
                    colorClass: "text-sky-600" 
                },
                { 
                    title: "Score de Humor", 
                    value: metrics.mood_score ? `${metrics.mood_score}/5` : "N/A", 
                    description: `Bem-estar percebido: ${moodStatus}`, 
                    icon: Smile, 
                    colorClass: "text-fuchsia-600" 
                },
                { 
                    title: "Minutos de Meditação", 
                    value: `${metrics.meditation_minutes} min`, 
                    description: "Foco e redução de estresse.", 
                    icon: BrainCircuit, 
                    colorClass: "text-purple-500" 
                },
            ]
        },
    ];

    return (
        <div className="space-y-10">
            {pillars.map((pillar, pillarIndex) => (
                <section key={pillarIndex}>
                    <div className="flex items-center mb-4 space-x-3">
                        <pillar.icon className={cn("h-6 w-6", pillar.color)} />
                        <h2 className="text-xl font-semibold text-foreground">{pillar.title}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">{pillar.description}</p>
                    
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
                        {pillar.metrics.map((data, index) => (
                            <MetricCard key={index} {...data} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}