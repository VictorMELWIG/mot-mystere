import { useState, useEffect } from 'react';
import { getTimeUntilMidnight } from '../logic/dailyWord.js';

export function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}
