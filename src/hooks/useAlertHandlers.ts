import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase.js';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ROUTINE_TASKS } from '../constants.js';

export function useAlertHandlers(authState) {
  const [routineState, setRoutineState] = useState({});
  const [reminders, setReminders] = useState([]);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertData, setAlertData] = useState({ message: '', phase: '' });
  const [lastAlertTime, setLastAlertTime] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const unsub = onSnapshot(
      doc(db, 'rotina_state', today),
      (d) => { if (d.exists()) setRoutineState(d.data()); else setRoutineState({}); },
      (err) => console.error('Erro rotina:', err),
    );
    return () => unsub();
  }, []);

  const toggleRoutine = useCallback((category, index) => {
    const key = `${category}-${index}`;
    const today = new Date().toISOString().split('T')[0];
    const newVal = !routineState[key];
    setDoc(doc(db, 'rotina_state', today), { [key]: newVal }, { merge: true });
  }, [routineState]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    const checkAlerts = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (Date.now() - lastAlertTime < 15 * 60 * 1000) return;
      const phases = [
        { name: 'Início - Manhã', start: 570, end: 780, key: 'morning' },
        { name: 'Meio - Tarde', start: 810, end: 990, key: 'afternoon' },
        { name: 'Fim - Fechamento', start: 1020, end: 1110, key: 'evening' },
      ];
      for (const p of phases) {
        if (currentMinutes >= p.start && currentMinutes <= p.end) {
          if (!ROUTINE_TASKS[p.key].every((_, i) => routineState[`${p.key}-${i}`])) {
            setAlertData({
              phase: p.name,
              message: `(${authState.settings.employeeName}) Não esqueça de completar suas tarefas diárias\n${p.name}\nExiste Pendências!`,
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
  }, [authState.isLoggedIn, routineState, lastAlertTime, authState.settings.employeeName]);

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