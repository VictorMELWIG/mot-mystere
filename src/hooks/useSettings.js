import { useState } from 'react';
import { loadSettings, saveSettings } from '../services/gamesStorage.js';

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  function changeSettings(newSettings) {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  }

  return { settings, changeSettings };
}
