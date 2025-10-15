"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyMetric } from "@/hooks/use-daily-metrics";
import { Activity, BedDouble, HeartPulse, Flame, TrendingUp, Zap, BrainCircuit, Utensils, Droplet, Thermometer, Gauge, Moon, Clock, Smile, Dumbbell } from "lucide-react";
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
    const recoveryStatus = (metrics.recovery_score || 0) >= 80 ? "Pronto para o dia" : "Priorize o descanso";
    const moodStatus = metrics.mood_score === 5 ? "Excelente" : (metrics.mood_score && metrics.mood_score >= 3 ? "Neutro" : "Baixo");

    const metricData = [
        // --- Pilar: Atividade e Energia ---
        { 
            title: "Passos Hoje", 
            value: `${metrics.steps.toLocaleString()} Steps`, 
            description: metrics.steps >= 8000 ? "Meta alcançada!" : "Continue se movendo.", 
            icon: Activity, 
            colorClass: "text-green-600" 
        },
        { 
            title: "Minutos Ativos", 
            value: `${metrics.active_minutes} min`, 
            description: "Tempo em zona moderada/alta.", 
            icon: Dumbbell, 
            colorClass: "text-orange-600" 
        },
        { 
            title: "Distância Total", 
            value: `${(metrics.total_distance_km || 0).toFixed(1)} km`, 
            description: "Caminhada e corrida.", 
            icon: Zap, 
            colorClass: "text-yellow-600" 
        },
        { 
            title: "VO2 Máximo", 
            value: metrics.vo2_max ? `${metrics.vo2_max.toFixed(1)}` : "N/A", 
            description: "Capacidade aeróbica.", 
            icon: Gauge, 
            colorClass: "text-blue-600" 
        },
        
        // --- Pilar: Sono e Recuperação ---
        { 
            title: "Sono Total", 
            value: formatMinutesToHours(metrics.sleep_duration_minutes), 
            description: `Qualidade: ${sleepQuality}`, 
            icon: BedDouble, 
            colorClass: "text-blue-600" 
        },
        { 
            title: "Sono Profundo", 
            value: formatMinutesToHours(metrics.deep_sleep_minutes), 
            description: "Crucial para recuperação física.", 
            icon: BrainCircuit, 
            colorClass: "text-purple-600" 
        },
        { 
            title: "Sono REM", 
            value: formatMinutesToHours(metrics.rem_sleep_minutes), 
            description: "Importante para a memória.", 
            icon: Moon, 
            colorClass: "text-indigo-600" 
        },
        { 
            title: "Eficiência do Sono", 
            value: metrics.sleep_efficiency ? `${metrics.sleep_efficiency.toFixed(0)}%` : "N/A", 
            description: "Tempo dormido vs. tempo na cama.", 
            icon: Clock, 
            colorClass: "text-teal-600" 
        },

        // --- Pilar: Fisiologia e Resiliência ---
        { 
            title: "Variabilidade Cardíaca (HRV)", 
            value: metrics.hrv_ms ? `${metrics.hrv_ms} ms` : "N/A", 
            description: `Resiliência ao estresse: ${hrvStatus}`, 
            icon: HeartPulse, 
            colorClass: "text-red-600" 
        },
        { 
            title: "Score de Recuperação", 
            value: metrics.recovery_score ? `${metrics.recovery_score}/100` : "N/A", 
            description: recoveryStatus, 
            icon: TrendingUp, 
            colorClass: "text-green-700" 
        },
        { 
            title: "Frequência Cardíaca (Repouso)", 
            value: metrics.resting_heart_rate ? `${metrics.resting_heart_rate} BPM` : "N/A", 
            description: "Média da noite.", 
            icon: HeartPulse, 
            colorClass: "text-pink-600" 
        },
        { 
            title: "Temperatura Corporal", 
            value: metrics.body_temperature_celsius ? `${metrics.body_temperature_celsius.toFixed(1)} °C` : "N/A", 
            description: "Variação da linha de base.", 
            icon: Thermometer, 
            colorClass: "text-cyan-600" 
        },

        // --- Pilar: Nutrição e Bem-Estar ---
        { 
            title: "Proteína Consumida", 
            value: `${metrics.protein_grams} g`, 
            description: "Suporte muscular.", 
            icon: Utensils, 
            colorClass: "text-amber-600" 
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
            colorClass: "text-lime-600" 
        },
        { 
            title: "Minutos de Meditação", 
            value: `${metrics.meditation_minutes} min`, 
            description: "Foco e redução de estresse.", 
            icon: BrainCircuit, 
            colorClass: "text-fuchsia-600" 
        },
    ];

    return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
            {metricData.map((data, index) => (
                <MetricCard key={index} {...data} />
            ))}
        </div>
    );
}