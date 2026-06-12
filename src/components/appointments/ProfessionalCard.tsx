'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string | null;
  rating: number | null;
  bio: string | null;
}

interface ProfessionalCardProps {
  professional: Professional;
  isSelected: boolean;
  onSelect: (professional: Professional) => void;
}

export function ProfessionalCard({
  professional,
  isSelected,
  onSelect,
}: ProfessionalCardProps) {
  const initial = professional.name.charAt(0).toUpperCase();

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/40',
        isSelected && 'border-primary ring-2 ring-primary/40 shadow-teal'
      )}
      onClick={() => onSelect(professional)}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage
            src={professional.avatar_url || undefined}
            alt={professional.name}
          />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">{professional.name}</CardTitle>
          <CardDescription>{professional.specialty}</CardDescription>
        </div>
        {professional.rating && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 border-golden/30 bg-golden-light text-golden"
          >
            <Star className="h-3 w-3 fill-current" />
            {professional.rating.toFixed(1)}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{professional.bio}</p>
      </CardContent>
    </Card>
  );
}
