'use client';

import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfessionalAvatarUploaderProps {
  currentAvatarUrl: string | null | undefined;
  professionalName: string;
  onUploadSuccess: (newUrl: string) => void;
}

export function ProfessionalAvatarUploader({
  currentAvatarUrl,
  professionalName,
  onUploadSuccess,
}: ProfessionalAvatarUploaderProps) {
  const { db, session } = useAuth();
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!session?.user) return;
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast.error('Arquivo muito grande.', {
        description: 'O limite é de 2MB.',
      });
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await db.storage
      .from('professional_avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      setUploading(false);
      toast.error('Erro ao enviar imagem.', {
        description: uploadError.message,
      });
      return;
    }

    const { data: publicUrlData } = db.storage
      .from('professional_avatars')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    setUploading(false);
    toast.success('Avatar enviado com sucesso!');
    onUploadSuccess(publicUrl);
  };

  const initial = professionalName ? (
    professionalName.charAt(0).toUpperCase()
  ) : (
    <User />
  );

  return (
    <div className="flex flex-col items-center space-y-2">
      <input
        type="file"
        id="professional-avatar-upload"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={uploading}
      />

      {/* Botão nativo: o seletor de arquivo também abre pelo teclado. */}
      <button
        type="button"
        className="group relative cursor-pointer rounded-full disabled:cursor-not-allowed"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="Alterar foto do profissional"
      >
        <Avatar className="h-24 w-24 border border-border">
          <AvatarImage
            src={currentAvatarUrl || undefined}
            alt={professionalName}
          />
          <AvatarFallback className="bg-sidebar-accent font-display text-3xl font-semibold text-primary">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            ) : (
              initial
            )}
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 opacity-0 transition-opacity duration-200',
            !uploading &&
              'group-hover:opacity-100 group-focus-visible:opacity-100'
          )}
          aria-hidden="true"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </button>
      <span className="text-xs text-muted-foreground">Clique para alterar</span>
    </div>
  );
}
