import { useState, useEffect, useMemo } from 'react';
import { SELLERS_LIST, ELIGIBLE_FOR_GOAL, GOAL_SELLERS, GOAL_MANAGER } from '../constants.js';
import { countUnits } from '../utils.js'; // S-4: usando a versão canônica de utils.js

function parseDob(dob) {
    if (!dob) return { mm: null, dd: null };
    if (dob.includes('-')) {
        const parts = dob.split('-');
        return { mm: parts[1], dd: parts[2] };
    }
    if (dob.includes('/')) {
        const parts = dob.split('/');
        return { dd: parts[0], mm: parts[1] };
    }
    return { mm: null, dd: null };
}

// S-4: countUnits local removido — usando countUnits de utils.js

export function useNotifications(isLoggedIn, sales, clients) {
    const [todayBirthdays, setTodayBirthdays] = useState([]);
    const [monthlyChartData, setMonthlyChartData] = useState([]);

    useEffect(() => {
        if (clients.length === 0) { setTodayBirthdays([]); return; }
        const today = new Date();
        const todayMM = String(today.getMonth() + 1).padStart(2, '0');
        const todayDD = String(today.getDate()).padStart(2, '0');
        const bdays = clients.filter(c => {
            const { mm, dd } = parseDob(c.dob);
            return mm === todayMM && dd === todayDD;
        });
        setTodayBirthdays(bdays);
    }, [clients]);

    useEffect(() => {
        const now = new Date();
        const chartData = [];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yr = d.getFullYear();
            const mo = d.getMonth();
            const monthSales = sales.filter(s => {
                if (!s.date) return false;
                const sd = new Date(s.date + 'T00:00:00');
                return sd.getFullYear() === yr && sd.getMonth() === mo;
            });
            chartData.push({
                label: monthNames[mo] + "/" + String(yr).slice(-2),
                total: monthSales.reduce((acc, s) => acc + (s.amountPaid || s.amount || 0), 0),
                count: monthSales.filter(s => (s.amountPaid || s.amount) > 0).length,
            });
        }
        setMonthlyChartData(chartData);
    }, [sales]);

    const notifs = useMemo(() => {
        if (!isLoggedIn) return [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const today = now.toISOString().split('T')[0];
        const result = [];

        clients.forEach(c => {
            const { mm, dd } = parseDob(c.dob);
            if (!mm || !dd) return;
            for (let i = 0; i <= 7; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() + i);
                const dMM = String(d.getMonth() + 1).padStart(2, '0');
                const dDD = String(d.getDate()).padStart(2, '0');
                if (mm === dMM && dd === dDD) {
                    const isToday = i === 0;
                    result.push({
                        id: `bday-${c.id}`,
                        type: 'birthday',
                        priority: isToday ? 'high' : 'medium',
                        icon: '🎂',
                        title: isToday ? `Aniversário hoje: ${c.name.split(' ')[0]}` : `Aniversário em ${i} dia${i > 1 ? 's' : ''}: ${c.name.split(' ')[0]}`,
                        detail: c.phone ? `📱 ${c.phone}` : 'Sem telefone',
                        phone: c.phone,
                        name: c.name,
                        at: new Date().toISOString(),
                    });
                    break;
                }
            }
        });

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysLeft = daysInMonth - now.getDate();

        SELLERS_LIST.forEach(seller => {
            const isManager = seller === "Sabrina Almeida";
            const target = isManager ? GOAL_MANAGER : GOAL_SELLERS;
            const sellerSales = sales.filter(s => {
                const d = new Date((s.date || '') + 'T00:00:00');
                return s.employeeName === seller && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            const units = countUnits(sellerSales, ELIGIBLE_FOR_GOAL);
            const pct = (units / target) * 100;
            if (daysLeft <= 7 && pct < 90) {
                const missing = Math.max(0, target - units);
                result.push({
                    id: `goal-${seller}-${currentMonth}-${currentYear}`,
                    type: 'goal',
                    priority: daysLeft <= 3 ? 'high' : 'medium',
                    icon: '🎯',
                    title: `Meta: ${seller.split(' ')[0]} precisa de ${missing} un`,
                    detail: `${units}/${target} un • ${daysLeft} dias restantes${isManager ? ' (Gerente)' : ''}`,
                    at: new Date().toISOString(),
                });
            }
        });

        const imeiMap = {};
        sales.forEach(s => {
            (s.items || []).forEach(i => {
                if (i.imei && i.imei.trim().length > 5) {
                    const key = i.imei.trim();
                    if (!imeiMap[key]) imeiMap[key] = [];
                    imeiMap[key].push(s);
                }
            });
        });
        const dupes = Object.entries(imeiMap).filter(([, arr]) => arr.length > 1);
        if (dupes.length > 0) {
            result.push({
                id: `imei-dupes-${dupes.length}`,
                type: 'warning',
                priority: 'high',
                icon: '⚠️',
                title: `${dupes.length} IMEI${dupes.length > 1 ? 's' : ''} duplicado${dupes.length > 1 ? 's' : ''}`,
                detail: dupes.slice(0, 2).map(([imei]) => imei).join(', ') + (dupes.length > 2 ? '...' : ''),
                at: new Date().toISOString(),
            });
        }

        const newClientsToday = clients.filter(c => c.createdAt && c.createdAt.startsWith(today));
        if (newClientsToday.length > 0) {
            result.push({
                id: `new-clients-${today}`,
                type: 'success',
                priority: 'low',
                icon: '👤',
                title: `${newClientsToday.length} novo${newClientsToday.length > 1 ? 's' : ''} cliente${newClientsToday.length > 1 ? 's' : ''} hoje`,
                detail: newClientsToday.map(c => c.name.split(' ')[0]).join(', '),
                at: new Date().toISOString(),
            });
        }

        return result;
    }, [isLoggedIn, sales, clients]);

    return useMemo(() => ({ todayBirthdays, monthlyChartData, notifs }), [todayBirthdays, monthlyChartData, notifs]);
}
