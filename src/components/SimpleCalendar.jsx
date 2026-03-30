import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import CalendarGrid from './calendar/CalendarGrid.jsx';
import ReminderSidebar from './calendar/ReminderSidebar.jsx';
import RoutineChecklist from './calendar/RoutineChecklist.jsx';

const SimpleCalendar = ({ routineState, toggleRoutine, reminders, setReminders }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // BUG-2 fix: migrado de window.db (v8 compat removido) para Firebase v9 modular
    useEffect(() => {
        if (!setReminders) return;
        const q = query(collection(db, 'lembretes'), orderBy('date'));
        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReminders(loaded);
            },
            (err) => console.error('Erro lembretes:', err),
        );
        return () => unsub();
    }, [setReminders]);

    return (
        <div className="flex flex-col gap-8 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row gap-8">
                <CalendarGrid currentDate={currentDate} setCurrentDate={setCurrentDate} reminders={reminders} />
                <ReminderSidebar currentDate={currentDate} reminders={reminders} />
            </div>
            <RoutineChecklist routineState={routineState} toggleRoutine={toggleRoutine} />
        </div>
    );
};

export default SimpleCalendar;
