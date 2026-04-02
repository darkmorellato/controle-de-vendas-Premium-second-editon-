import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const existing = document.getElementById('dropdowns-root');
        if (!existing) {
            const div = document.createElement('div');
            div.id = 'dropdowns-root';
            document.body.appendChild(div);
        }
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const mount = document.getElementById('dropdowns-root');
    if (!mount) return null;

    return createPortal(children, mount);
}