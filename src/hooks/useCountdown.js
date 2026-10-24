import { useState, useEffect } from 'react';
import { getTimeUntilMidnight } from '../logic/dailyWord.js';

// Le temps avant le prochain mot, mis à jour chaque seconde
export function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 1000);
    return () => clearInterval(timer); // on arrête le minuteur quand on quitte la page
  }, []);

  return timeLeft;
}
