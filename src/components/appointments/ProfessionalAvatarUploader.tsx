"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfessionalAvatarUploaderProps {
  currentAvatarUrl: string | null | undefined;
  professionalName: string;
  onUploadSuccess: (newUrl: string) => void;
}

export function ProfessionalAvatarUploader({ currentAvatarUrl, professionalName, onUploadSuccess }: ProfessionalAvatarUploaderProps) {
  const { supabase, session } = useAuth();
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user) return;
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Arquivo muito grande.", { description: "O limite é de 2MB." });
        return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('professional_avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      setUploading(false);
      toast.error("Erro ao enviar imagem.", { description: uploadError.message });
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('professional_avatars')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;

    setUploading(false);
    toast.success("Avatar enviado com sucesso!");
    onUploadSuccess(publicUrl);
  };

  const initial = professionalName ? professionalName.charAt(0).toUpperCase() : <User />;

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
      
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <Avatar className="h-24 w-24 border-2 border-gray-200">
          <AvatarImage src={currentAvatarUrl || undefined} alt={professionalName} />
          <AvatarFallback className="text-3xl bg-gray-100 text-gray-500">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : initial}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn(
            "absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-300",
            !uploading && "group-hover:opacity-100"
        )}>
            {uploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
                <Camera className="h-6 w-6 text-white" />
            )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Clique para alterar</span>
    </div>
  );
}