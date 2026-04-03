/**
 * Unified routine and alert management hook.
 * Merges: useAlertHandlers + routine logic from useAppState + App.jsx
 * Single source of truth for daily routine tracking and periodic alerts.
 */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase.js';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ROUTINE_TASKS } from '../../constants.js';

interface UseRoutineAlertsProps {
  isLoggedIn: boolean;
  employeeName: string;
}

export function useRoutineAlerts({ isLoggedIn, employeeName }: UseRoutineAlertsProps) {
  const [routineState, setRoutineState] = useState<Record<string, boolean>>({});
  const [reminders, setReminders] = useState<string[]>([]);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertData, setAlertData] = useState({ message: '', phase: '' });
  const [lastAlertTime, setLastAlertTime] = useState(0);

  // Firestore listener for daily routine state
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const unsub = onSnapshot(
      doc(db, 'rotina_state', today),
      (d) => { if (d.exists()) setRoutineState(d.data() as Record<string, boolean>); else setRoutineState({}); },
      (err) => console.error('Erro rotina:', err),
    );
    return () => unsub();
  }, []);

  const toggleRoutine = useCallback((category: string, index: number) => {
    const key = `${category}-${index}`;
    const today = new Date().toISOString().split('T')[0];
    const newVal = !routineState[key];
    setDoc(doc(db, 'rotina_state', today), { [key]: newVal }, { merge: true });
  }, [routineState]);

  // Periodic alert checker
  useEffect(() => {
    if (!isLoggedIn) return;
    const checkAlerts = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (Date.now() - lastAlertTime < 15 * 60 * 1000) return;
      const phases = [
        { name: 'Início - Manhã', start: 570, end: 780, key: 'morning' as const },
        { name: 'Meio - Tarde', start: 810, end: 990, key: 'afternoon' as const },
        { name: 'Fim - Fechamento', start: 1020, end: 1110, key: 'evening' as const },
      ];
      for (const p of phases) {
        if (currentMinutes >= p.start && currentMinutes <= p.end) {
          const tasks = ROUTINE_TASKS[p.key];
          if (tasks && !tasks.every((_: unknown, i: number) => routineState[`${p.key}-${i}`])) {
            setAlertData({
              phase: p.name,
              message: `(${employeeName}) Não esqueça de completar suas tarefas diárias\n${p.name}\nExiste Pendências!`,
            });
            setAlertModalOpen(true);
            setLastAlertTime(Date.now());
            try { new Audio('/speech_1771176567518.mp3').play().catch(() => {}); } catch {}
            break;
          }
        }
      }
    };
    const interval = setInterval(checkAlerts, 60_000);
    checkAlerts();
    return () => clearInterval(interval);
  }, [isLoggedIn, routineState, lastAlertTime, employeeName]);

  return {
    routineState,
    setRoutineState,
    reminders,
    setReminders,
    alertModalOpen,
    setAlertModalOpen,
    alertData,
    lastAlertTime,
    toggleRoutine,
  };
}
