'use client';

import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AvatarUploaderProps {
  currentAvatarUrl: string | null;
  firstName: string;
  onUploadSuccess: (newUrl: string) => void;
}

export function AvatarUploader({
  currentAvatarUrl,
  firstName,
  onUploadSuccess,
}: AvatarUploaderProps) {
  const { db, session } = useAuth();
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!session?.user) return;
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error('Arquivo muito grande.', {
        description: 'O limite é de 5MB.',
      });
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    // Define o caminho como user_id/nome_aleatorio.ext
    const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

    // 1. Upload do arquivo para o storage local servido pela aplicação
    const { error: uploadError } = await db.storage
      .from('avatars')
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

    // 2. Get public URL
    const { data: publicUrlData } = db.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Update profile table with the new URL
    const { error: updateError } = await db
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);

    setUploading(false);

    if (updateError) {
      toast.error('Erro ao salvar URL do perfil.', {
        description: updateError.message,
      });
    } else {
      toast.success('Avatar atualizado com sucesso!');
      onUploadSuccess(publicUrl);
    }
  };

  const initial = firstName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={uploading}
      />

      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className="size-32 border-4 border-primary/20 shadow-[0_22px_50px_-28px_rgba(49,155,142,0.45)] transition-all duration-300 group-hover:scale-[1.02]">
          <AvatarImage src={currentAvatarUrl || undefined} alt={firstName} />
          <AvatarFallback className="bg-[linear-gradient(145deg,rgba(49,155,142,0.12),rgba(139,92,246,0.12),rgba(255,255,255,0.92))] text-5xl text-primary">
            {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : initial}
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-foreground/14 opacity-0 transition-opacity duration-300',
            !uploading && 'group-hover:opacity-100'
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : 'Atualizar avatar'}
      </Button>
    </div>
  );
}
