import { useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { RoutineState } from '../types';

interface UseRoutineHandlersProps {
  routineState: RoutineState;
  setRoutineState: (state: RoutineState | ((prev: RoutineState) => RoutineState)) => void;
}

export function useRoutineHandlers({
  routineState,
  setRoutineState,
}: UseRoutineHandlersProps) {
  const toggleRoutine = useCallback((category: string, index: number) => {
    const key = `${category}-${index}`;
    const today = new Date().toISOString().split('T')[0];
    setRoutineState((prev: RoutineState) => {
      const newVal = !prev[key];
      setDoc(doc(db, 'rotina_state', today), { [key]: newVal }, { merge: true });
      return { ...prev, [key]: newVal };
    });
  }, [setRoutineState]);

  return { toggleRoutine };
}