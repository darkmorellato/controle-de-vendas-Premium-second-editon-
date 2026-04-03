import { useMemo } from 'react';

interface Sale {
  date: string;
  employeeName: string;
  items: Array<{ type: string; unitPrice: number; quantity: number }>;
}

interface Client {
  createdAt: string;
  dob: string | null;
}

interface Reminder {
  date: string;
  completed: boolean;
}

interface HeaderCalculationsParams {
  sales: Sale[];
  clients: Client[];
  reminders: Reminder[];
  GOAL_SELLERS: number;
  GOAL_MANAGER: number;
  ELIGIBLE_FOR_GOAL: string[];
}

export function useHeaderCalculations({
  sales,
  clients,
  reminders,
  GOAL_SELLERS,
  GOAL_MANAGER,
  ELIGIBLE_FOR_GOAL
}: HeaderCalculationsParams) {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const currentMonth = useMemo(() => new Date().getMonth(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const todayDate = useMemo(() => new Date().getDate(), []);

  const todayReminders = useMemo(() => {
    return reminders.filter(r => r.date === todayStr && !r.completed).length;
  }, [reminders, todayStr]);

  const recentClients = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return clients.filter(c => {
      if (!c.createdAt) return false;
      return new Date(c.createdAt) >= thirtyDaysAgo;
    }).length;
  }, [clients]);

  const sellerGoalsAtRisk = useMemo(() => {
    const SELLERS_LIST = ['Gabriela Ferreira', 'Sabrina Almeida'];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysLeft = daysInMonth - todayDate;
    if (daysLeft > 5) return 0;
    
    let count = 0;
    SELLERS_LIST.forEach(seller => {
      const isMgr = seller === "Sabrina Almeida";
      const target = isMgr ? GOAL_MANAGER : GOAL_SELLERS;
      const sellerSales = sales.filter(s => {
        const d = new Date((s.date || '') + 'T00:00:00');
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
        return isMgr ? true : s.employeeName === seller;
      });
      const units = sellerSales.reduce((acc, s) => {
        const pos = (s.items||[]).filter(i => ELIGIBLE_FOR_GOAL.includes(i.type) && i.unitPrice > 0);
        const neg = (s.items||[]).filter(i => ELIGIBLE_FOR_GOAL.includes(i.type) && i.unitPrice < 0);
        return acc + pos.reduce((sum,i)=>sum+i.quantity,0) - neg.reduce((sum,i)=>sum+Math.abs(i.quantity),0);
      }, 0);
      if (units < target) count++;
    });
    return count;
  }, [sales, currentMonth, currentYear, todayDate, GOAL_MANAGER, GOAL_SELLERS, ELIGIBLE_FOR_GOAL]);

  const upcomingBirthdays = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dMM = String(d.getMonth() + 1).padStart(2, '0');
      const dDD = String(d.getDate()).padStart(2, '0');
      clients.forEach(c => {
        if (c.dob) {
          const parts = c.dob.includes('-') ? c.dob.split('-') : c.dob.includes('/') ? c.dob.split('/') : null;
          if (parts && parts.length >= 2) {
            const mm = parts.length === 3 ? parts[1] : parts[0];
            const dd = parts.length === 3 ? parts[2] : parts[1];
            if (mm === dMM && dd === dDD) count++;
          }
        }
      });
    }
    return count;
  }, [clients]);

  const hasNotifications = (todayReminders > 0 || recentClients > 0 || sellerGoalsAtRisk > 0 || upcomingBirthdays > 0);
  const totalNotifications = todayReminders + recentClients + sellerGoalsAtRisk + upcomingBirthdays;

  return {
    todayReminders,
    recentClients,
    sellerGoalsAtRisk,
    upcomingBirthdays,
    hasNotifications,
    totalNotifications
  };
}