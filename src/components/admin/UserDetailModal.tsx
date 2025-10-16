"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Calendar, Clock, MapPin, Activity, Target } from "lucide-react";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  onboarding_completed: boolean;
  created_at: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  activity_level: number | null;
  goals: string[] | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
}

interface UserDetailModalProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Não informado"}</p>
    </div>
  </div>
);

export function UserDetailModal({ user, open, onOpenChange }: UserDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="text-3xl">{user.first_name?.charAt(0) || <User />}</AvatarFallback>
          </Avatar>
          <DialogTitle className="text-2xl">{user.first_name} {user.last_name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
          <div>
            {user.onboarding_completed ? (
              <Badge className="bg-green-600">Onboarding Completo</Badge>
            ) : (
              <Badge variant="secondary">Onboarding Pendente</Badge>
            )}
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <DetailItem icon={Calendar} label="Data de Cadastro" value={format(new Date(user.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} />
          <DetailItem icon={User} label="Gênero" value={user.gender} />
          <DetailItem icon={Calendar} label="Idade" value={user.age ? `${user.age} anos` : null} />
          <DetailItem icon={Activity} label="Nível de Atividade" value={user.activity_level} />
          <DetailItem icon={MapPin} label="Local de Nascimento" value={user.birth_location} />
          <DetailItem icon={Clock} label="Hora de Nascimento" value={user.birth_time} />
          <div className="col-span-2">
            <DetailItem
              icon={Target}
              label="Metas"
              value={
                user.goals && user.goals.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.goals.map(g => <Badge key={g} variant="secondary">{g}</Badge>)}
                  </div>
                ) : "Nenhuma meta definida"
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}