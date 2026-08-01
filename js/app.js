// Main entry point — initialize page-specific scripts on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    new Auth();

    const page = AuthGuard.getCurrentPage();

    if (page === 'dashboard.html') new DashboardPage();
    if (page === 'clients.html') new ClientsPage();
    if (page === 'profile.html') new ProfilePage();

    if (document.getElementById('themeToggle')) new Theme();
});
