(function () {
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos em ms
    let inactivityTimer;

    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            location.reload();
        }, INACTIVITY_LIMIT);
    }

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(event => {
        document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();
})();
