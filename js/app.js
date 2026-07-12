// თითო გვერდზე საჭირო კლასების გაშვება
document.addEventListener('DOMContentLoaded', () => {
    new Auth();

    const page = AuthGuard.getCurrentPage();

    if (page === 'dashboard.html') new DashboardPage();
    if (page === 'clients.html') new ClientsPage();
    if (document.getElementById('themeToggle')) new Theme();
});
