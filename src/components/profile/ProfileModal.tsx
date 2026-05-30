import { useState, useRef, useEffect } from 'react';
import { X, User, Upload, Loader2, Camera } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useAuth } from '../../store/useAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, setAuth, token } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imgError, setImgError] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.full_name || '');
      setPreviewUrl(user?.profile_picture_url || null);
      setSelectedFile(null);
      setErrorMsg('');
      setImgError(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar maksimal 2MB.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setImgError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    let base64_image = '';
    
    if (selectedFile) {
      base64_image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
    }

    const payload = {
      full_name: fullName,
      ...(base64_image && { base64_image })
    };

    const res = await fetchApi('UPDATE_PROFILE', payload, token!);
    
    if (res.status === 'success') {
      const updatedUser = { 
        ...user!, 
        full_name: res.data.full_name,
        ...(res.data.profile_picture_url && { profile_picture_url: res.data.profile_picture_url })
      };
      setAuth(token!, updatedUser);
      onClose();
    } else {
      setErrorMsg(res.message || 'Terjadi kesalahan saat menyimpan profil.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 lg:slide-in-from-bottom-0 lg:zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-bold">Edit Profil</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-[var(--color-text-foreground)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {previewUrl && !imgError && previewUrl !== 'null' ? (
                <img 
                  src={previewUrl} 
                  alt="Profile Preview" 
                  onError={() => setImgError(true)}
                  className="w-24 h-24 rounded-full object-cover border-4 border-black/5 dark:border-white/10 bg-slate-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-black/5 dark:border-white/10 bg-black/10 dark:bg-white/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-slate-400">Klik gambar untuk mengubah foto (Maks. 2MB)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
            />
          </div>
          
          {errorMsg && (
             <div className="p-3 bg-negative/20 border border-negative/50 rounded-xl text-negative text-sm text-center">
               {errorMsg}
             </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  required
                  className="w-full bg-surface-light border border-black/5 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-text-foreground)] focus:outline-none focus:border-[var(--color-stabilo)] transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-stabilo)] hover:bg-[#b3e600] text-black font-medium py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-70"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
            ) : (
              <><Upload className="w-5 h-5" /> Simpan Profil</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
