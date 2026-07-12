// P4 — კლიენტების გვერდი (ჩატვირთვა, CRUD, ფილტრი)
class ClientsPage {
    constructor() {
        this.clients = [];
        this.filter = 'All';
        this.search = '';
        this.sort = 'newest';

        this.container = document.getElementById('clientsContainer');
        if (!this.container) return;

        this.bindEvents();
        this.load();
    }

    bindEvents() {
        document.getElementById('addClientBtn')?.addEventListener('click', () => this.openModal());
        document.getElementById('closeModalBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('addClientModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'addClientModal') this.closeModal();
        });
        document.getElementById('addClientForm')?.addEventListener('submit', (e) => this.handleAdd(e));

        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.search = e.target.value.toLowerCase();
            this.render();
        });

        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.filter = chip.dataset.filter;
                this.render();
            });
        });

        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            this.sort = e.target.value;
            this.render();
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                this.delete(Number(e.target.dataset.id));
            }
        });
    }

    async load() {
        const stored = Storage.getClients();
        if (stored) {
            this.clients = stored;
            this.render();
            return;
        }

        const loading = document.getElementById('loadingIndicator');
        if (loading) loading.style.display = 'block';

        try {
            const response = await fetch('https://dummyjson.com/users?limit=30');
            if (!response.ok) throw new Error('Network error');

            const data = await response.json();
            this.clients = data.users.map(user => this.mapApiUser(user));
            this.save();
            this.render();
        } catch (error) {
            this.container.innerHTML = '<div class="empty-state">Could not load clients. Check your connection and try again.</div>';
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    mapApiUser(user) {
        return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            company: user.company.name,
            image: user.image,
            status: 'Lead',
            dealValue: Math.floor(Math.random() * 9500) + 500,
            notes: [],
            createdAt: new Date().toISOString()
        };
    }

    save() {
        Storage.saveClients(this.clients);
    }

    getVisibleClients() {
        let list = [...this.clients];

        if (this.filter !== 'All') {
            list = list.filter(c => c.status === this.filter);
        }

        if (this.search) {
            list = list.filter(c =>
                c.name.toLowerCase().includes(this.search) ||
                c.company.toLowerCase().includes(this.search)
            );
        }

        if (this.sort === 'name') {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.sort === 'deal-high') {
            list.sort((a, b) => b.dealValue - a.dealValue);
        } else {
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return list;
    }

    render() {
        const list = this.getVisibleClients();
        this.container.innerHTML = '';

        if (list.length === 0) {
            this.container.innerHTML = '<div class="empty-state">No clients found.</div>';
            return;
        }

        list.forEach(client => {
            const price = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', maximumFractionDigits: 0
            }).format(client.dealValue);

            const card = document.createElement('div');
            card.className = 'client-card';
            card.innerHTML = `
                <div class="client-header">
                    <img src="${client.image}" alt="${client.name}" class="client-avatar">
                    <div class="client-info">
                        <h3>${client.name}</h3>
                        <p>${client.company}</p>
                    </div>
                </div>
                <div class="client-details">
                    <p>📧 ${client.email}</p>
                    <p>📞 ${client.phone}</p>
                    <p>Value: <span class="deal-value">${price}</span></p>
                    <p>Status: <span class="badge badge-${client.status.toLowerCase()}">${client.status}</span></p>
                </div>
                <button class="btn-delete" data-id="${client.id}">Delete</button>
            `;
            this.container.appendChild(card);
        });
    }

    openModal() {
        document.getElementById('addClientModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('addClientModal').classList.remove('active');
        document.getElementById('addClientForm').reset();
        FormErrors.clear();
    }

    async handleAdd(e) {
        e.preventDefault();
        FormErrors.clear();

        const name = document.getElementById('newClientName').value.trim();
        const email = document.getElementById('newClientEmail').value.trim().toLowerCase();
        const phone = document.getElementById('newClientPhone').value.trim();
        const company = document.getElementById('newClientCompany').value.trim();
        const dealValue = parseFloat(document.getElementById('newClientDeal').value);
        const status = document.getElementById('newClientStatus').value;

        if (!this.validateAdd({ name, email, phone, dealValue })) return;

        try {
            const response = await fetch('https://dummyjson.com/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: name.split(' ')[0],
                    lastName: name.split(' ')[1] || '',
                    email, phone,
                    company: { name: company }
                })
            });

            const data = await response.json();

            this.clients.unshift({
                id: data.id || Date.now(),
                name, email, phone, company,
                image: 'https://dummyjson.com/icon/newuser/128',
                status, dealValue,
                notes: [],
                createdAt: new Date().toISOString()
            });

            this.save();
            this.render();
            this.closeModal();
            Toast.show('Client added ✓', 'success');
        } catch (error) {
            Toast.show('Failed to add client', 'error');
        }
    }

    validateAdd({ name, email, phone, dealValue }) {
        let valid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (name.length < 3) {
            FormErrors.show('newClientName', 'errName', 'Name must be at least 3 characters');
            valid = false;
        }

        if (!emailRegex.test(email) || this.clients.some(c => c.email === email)) {
            FormErrors.show('newClientEmail', 'errEmail', 'Please enter a valid email address / A client with this email already exists');
            valid = false;
        }

        if (phone && phone.length < 6) {
            FormErrors.show('newClientPhone', 'errPhone', 'Phone number looks too short');
            valid = false;
        }

        if (isNaN(dealValue) || dealValue <= 0) {
            FormErrors.show('newClientDeal', 'errDeal', 'Deal value must be a positive number');
            valid = false;
        }

        return valid;
    }

    async delete(id) {
        if (!confirm('Delete this client? This cannot be undone.')) return;

        try {
            await fetch(`https://dummyjson.com/users/${id}`, { method: 'DELETE' });
        } catch (error) {
            // API შეიძლება 404 დააბრუნოს — მაინც ვშლით localStorage-დან
        }

        this.clients = this.clients.filter(c => c.id !== id);
        this.save();
        this.render();
        Toast.show('Client deleted', 'success');
    }
}
