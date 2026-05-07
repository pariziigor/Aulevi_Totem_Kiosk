import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKioskStore } from '../store/useKioskStore';

export const useInactivityTimeout = (timeoutSeconds: number = 60) => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetSession = useKioskStore((state) => state.resetSession);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Não aciona o timeout se já estiver na tela de Standby
      if (location.pathname !== '/standby') {
        timeoutId = setTimeout(() => {
          resetSession();
          navigate('/standby');
        }, timeoutSeconds * 1000);
      }
    };

    // Escuta eventos de toque e clique do Electron
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('keydown', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [navigate, location.pathname, resetSession, timeoutSeconds]);
};