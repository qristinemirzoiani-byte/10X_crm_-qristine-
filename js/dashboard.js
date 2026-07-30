// P3 — დეშბორდი (მისალმება + ცოცხალი საათი)
class DashboardPage {
    constructor() {
        if (!document.getElementById('welcomeText')) return;
        this.showWelcome();
        this.startClock();
    }

    showWelcome() {
        const session = Storage.getSession();
        if (!session) return;

        const user = Storage.getUsers().find(u => u.email === session.email);
        if (!user) return;

        const firstName = user.fullName.split(' ')[0];
        document.getElementById('welcomeText').innerText = `Welcome back, ${firstName}!`;
    }

    startClock() {
        const clockEl = document.getElementById('liveClock');
        if (!clockEl) return;

        setInterval(() => {
            const now = new Date();
            clockEl.innerText =
                now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
                ' | ' +
                now.toLocaleDateString('en-GB', { year: 'numeric',
                month: '2-digit',
                day: '2-digit' });
        }, 1000);
    }
}
