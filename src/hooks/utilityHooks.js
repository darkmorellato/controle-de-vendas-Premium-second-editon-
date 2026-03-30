import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { storageService } from '../services/storageService.js';

export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return isOnline;
};

export const useInterval = (callback, delay, enabled = true) => {
    useEffect(() => {
        if (!enabled || delay === null) return;
        const id = setInterval(callback, delay);
        return () => clearInterval(id);
    }, [callback, delay, enabled]);
};

export const useClipboard = () => {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch (err) {
            return false;
        }
    }, []);
    return { copy, copied };
};

export const useDeviceType = () => {
    const [deviceType, setDeviceType] = useState({ isMobile: false, isTablet: false, isDesktop: true });
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setDeviceType({
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
            });
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);
    return deviceType;
};

export const useFormState = (initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const handleChange = useCallback((field) => (value) => {
        setValues(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    }, [errors]);
    const resetForm = useCallback(() => { setValues(initialValues); setErrors({}); }, [initialValues]);
    return { values, errors, handleChange, resetForm, setValues, setErrors };
};

export const useNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const addNotification = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        if (duration > 0) setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), duration);
        return id;
    }, []);
    const removeNotification = useCallback((id) => setNotifications(prev => prev.filter(n => n.id !== id)), []);
    const success = useCallback((message) => addNotification(message, 'success'), [addNotification]);
    const error = useCallback((message) => addNotification(message, 'error'), [addNotification]);
    const warning = useCallback((message) => addNotification(message, 'warning'), [addNotification]);
    const info = useCallback((message) => addNotification(message, 'info'), [addNotification]);
    return { notifications, addNotification, removeNotification, success, error, warning, info };
};

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') return storageService.load().theme || 'dark';
        return 'dark';
    });
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        storageService.save({ theme });
    }, [theme]);
    const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
    return { theme, toggleTheme, setTheme };
};

export const useFilter = (data, options = {}) => {
    const { searchFields = [], filterFunctions = {} } = options;
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const setFilter = useCallback((key, value) => setActiveFilters(prev => ({ ...prev, [key]: value })), []);
    const resetFilters = useCallback(() => { setSearchTerm(''); setActiveFilters({}); }, []);
    const filteredData = useMemo(() => {
        let result = data;
        if (searchTerm && searchFields.length > 0) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item => searchFields.some(field => {
                const value = item[field];
                return value && String(value).toLowerCase().includes(lowerTerm);
            }));
        }
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                const filterFn = filterFunctions[key];
                if (filterFn) result = result.filter(item => filterFn(value, item));
                else result = result.filter(item => item[key] === value);
            }
        });
        return result;
    }, [data, searchTerm, activeFilters, searchFields, filterFunctions]);
    return { filteredData, filters: { searchTerm, ...activeFilters }, setSearchTerm, setFilter, resetFilters, total: filteredData.length };
};

export const usePagination = (data, initialPageSize = 10) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const totalPages = Math.ceil(data.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);
    const goToPage = useCallback((page) => setCurrentPage(Math.max(1, Math.min(page, totalPages))), [totalPages]);
    const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
    const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
    // Resetar página quando o tamanho dos dados muda
    const prevLengthRef = useRef(data.length);
    useEffect(() => {
        if (data.length !== prevLengthRef.current) {
            prevLengthRef.current = data.length;
            setCurrentPage(1);
        }
    }, [data.length]);
    return { currentPage, pageSize, totalPages, paginatedData, goToPage, nextPage, prevPage, setPageSize, hasNextPage: currentPage < totalPages, hasPrevPage: currentPage > 1 };
};

export const useKeyPress = (key, callback) => {
    useEffect(() => {
        const handler = (event) => {
            const keys = Array.isArray(key) ? key : [key];
            if (keys.includes(event.key) || keys.includes(event.code)) callback(event);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [key, callback]);
};

export const useKeyCombo = (options, callback) => {
    useEffect(() => {
        const handler = (event) => {
            const { ctrl = false, shift = false, alt = false, key } = options;
            const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey;
            const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
            const altMatch = alt ? event.altKey : !event.altKey;
            const keyMatch = key ? event.key === key || event.code === key : true;
            if (ctrlMatch && shiftMatch && altMatch && keyMatch) { event.preventDefault(); callback(event); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [options, callback]);
};
