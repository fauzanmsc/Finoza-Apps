import { useEffect, useState } from 'react';
import { useTheme } from '../store/useTheme';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isFading, setIsFading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const timer1 = setTimeout(() => setIsFading(true), 800);
    const timer2 = setTimeout(() => onFinish(), 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-background-grad-end) 100%)' }}
    >
      {/* Logo container with pulse and float animation */}
      <div className="relative flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <img 
            src={theme === 'dark' ? '/logo-finoza-light.png' : '/logo-finoza-dark.png'} 
            alt="Finoza Logo" 
            className="w-48 h-48 object-contain relative z-10"
          />
        </div>
      </div>
      
      {/* Loading bar */}
      <div className="absolute bottom-16 w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-stabilo)] rounded-full animate-progress-bar"></div>
      </div>
    </div>
  );
}
