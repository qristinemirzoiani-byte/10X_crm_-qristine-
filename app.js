// ფუნქცია: ეკრანზე გამოვიტანოთ იუზერის სახელი და გავუშვათ საათი
function initDashboard() {
    // 1. მოგვაქვს სესია და იუზერები
    const session = JSON.parse(localStorage.getItem('crm_session'));
    const users = JSON.parse(localStorage.getItem('crm_users')) || [];

    if (session) {
        // ვპოულობთ მიმდინარე იუზერს ბაზაში email-ის მიხედვით
        const currentUser = users.find(u => u.email === session.email);
        
        if (currentUser) {
            // ვიღებთ მხოლოდ სახელს (პირველ სიტყვას P3.1 მოთხოვნის მიხედვით)
            const firstName = currentUser.fullName.split(' ')[0];
            
            // ვსვამთ ტექსტს HTML-ში
            const welcomeEl = document.getElementById('welcomeText');
            if (welcomeEl) {
                welcomeEl.innerText = `Welcome back, ${firstName}!`;
            }
        }
    }

    // 2. ცოცხალი საათის ლოგიკა (P3.1 მოთხოვნა)
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
        // ვაახლებთ ყოველ 1000 მილიწამში (1 წამში)
        setInterval(() => {
            const now = new Date();
            clockEl.innerText = now.toLocaleTimeString(); // აბრუნებს დროს, მაგ: 14:30:45
        }, 1000);
    }
}

// რადგან app.js შეიძლება სხვა გვერდებზეც მივაერთოთ, ვამოწმებთ, ვართ თუ არა დეშბორდზე
if (window.location.pathname.includes('dashboard.html')) {
    initDashboard();
}

// =========================================================
// CLIENTS LOGIC (app.js) - P4.2 & P4.3
// =========================================================

// ეს მასივი შეინახავს ჩვენს კლიენტებს მეხსიერებაში
let crmClients = [];

// ფუნქცია: წამოიღოს მონაცემები API-დან ან ლოკალ სთორიჯიდან
async function loadClients() {
    const loadingEl = document.getElementById('loadingIndicator');
    const storedClients = localStorage.getItem('crm_clients');

    if (storedClients) {
        // თუ უკვე გვაქვს შენახული, ვაქცევთ მასივად და ვხატავთ
        crmClients = JSON.parse(storedClients);
        renderClients(crmClients);
    } else {
        // თუ არ გვაქვს, ვაჩვენებთ Loading ტექსტს და მივდივართ API-სთან
        if (loadingEl) loadingEl.style.display = 'block';

        try {
            const response = await fetch('https://dummyjson.com/users?limit=30');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();

            // P4.2: მონაცემების გარდაქმნა (map) ჩვენს ფორმატში
            crmClients = data.users.map(user => {
                return {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    phone: user.phone,
                    company: user.company.name,
                    image: user.image,
                    status: "Lead", // დეფოლტი
                    dealValue: Math.floor(Math.random() * (10000 - 500 + 1)) + 500, // რენდომი 500-დან 10000-მდე
                    notes: [],
                    createdAt: new Date().toISOString()
                };
            });

            // ვინახავთ localStorage-ში
            localStorage.setItem('crm_clients', JSON.stringify(crmClients));
            
            // ვხატავთ ეკრანზე
            renderClients(crmClients);

        } catch (error) {
            console.error("Error fetching clients:", error);
            document.getElementById('clientsContainer').innerHTML = 
                '<div class="empty-state">Could not load clients. Check your connection and try again.</div>';
        } finally {
            // Loading ტექსტის დამალვა
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }
}

// ფუნქცია: კლიენტების დახატვა ეკრანზე (P4.3)
function renderClients(list) {
    const container = document.getElementById('clientsContainer');
    if (!container) return; // თუ ამ გვერდზე არ ვართ, ვაჩერებთ

    container.innerHTML = ''; // ვასუფთავებთ კონტეინერს

    // თუ სია ცარიელია
    if (list.length === 0) {
        container.innerHTML = '<div class="empty-state">No clients found.</div>';
        return;
    }

    // ვუვლით მასივს და ვქმნით ბარათებს
    list.forEach(client => {
        // ფასის ფორმატირება (მაგ: 5000 -> $5,000)
        const formattedDeal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(client.dealValue);
        
        // სტატუსის ფერი
        const badgeClass = `badge-${client.status.toLowerCase()}`;

        // ბარათის HTML
        const cardHTML = `
            <div class="client-card">
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
                    <p>Value: <span class="deal-value">${formattedDeal}</span></p>
                    <p>Status: <span class="badge ${badgeClass}">${client.status}</span></p>
                </div>
                <!-- Delete ღილაკი data-id ატრიბუტით -->
                <button class="btn-delete" data-id="${client.id}" 
                onclick="deleteClient(${client.id})">Delete</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// ვამოწმებთ თუ ვართ Clients გვერდზე და ვუშვებთ ფუნქციას
if (window.location.pathname.includes('clients.html')) {
    loadClients();
}

// DELETE CLIENT (P4.5)
// =========================================================
async function deleteClient(id) {
    // 1. ვეკითხებით, ნამდვილად უნდა თუ არა წაშლა
    const confirmDelete = confirm("Delete this client? This cannot be undone.");
    if (!confirmDelete) return;

    try {
        // 2. ვუშვებთ DELETE მოთხოვნას DummyJSON-ზე
        await fetch(`https://dummyjson.com/users/${id}`, { method: 'DELETE' });
        
        // 3. ვიღებთ ჩვენს მასივს (filter-ით ვაგდებთ იმას ვისი ID-იც დაემთხვა)
        crmClients = crmClients.filter(client => client.id !== id);
        
        // 4. ვინახავთ ლოკალ სთორიჯში და ვხატავთ თავიდან
        localStorage.setItem('crm_clients', JSON.stringify(crmClients));
        renderClients(crmClients);
        
        // 5. გამოგვაქვს მწვანე მესიჯი (auth.js-დან)
        showToast("Client deleted ✓", "success");
    } catch (error) {
        console.error("Error deleting:", error);
        // რეალურად API არ ინახავს ჩვენს დამატებულებს და 404-ს დააბრუნებს ახალზე, 
        // ამიტომ catch-შიც შეგვიძლია ლოკალურად მაინც წავშალოთ, მაგრამ PRD-ის მიხედვით აქამდე არ მივა.
    }
}


// =========================================================
// ADD CLIENT MODAL & FORM LOGIC (P4.4)
// =========================================================
if (window.location.pathname.includes('clients.html')) {
    const addClientBtn = document.getElementById('addClientBtn');
    const modal = document.getElementById('addClientModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addClientForm = document.getElementById('addClientForm');

    // მოდალის გახსნა
    addClientBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    // მოდალის დახურვა ღილაკით
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        addClientForm.reset();
        clearErrors(); // auth.js-დან
    });

    // მოდალის დახურვა შავ ფონზე დაჭერით (ბონუსი PRD-დან)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            addClientForm.reset();
            clearErrors();
        }
    });

    // ახალი კლიენტის დამატება
    addClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const name = document.getElementById('newClientName').value.trim();
        const email = document.getElementById('newClientEmail').value.trim().toLowerCase();
        const phone = document.getElementById('newClientPhone').value.trim();
        const company = document.getElementById('newClientCompany').value.trim();
        const dealValue = parseFloat(document.getElementById('newClientDeal').value);
        const status = document.getElementById('newClientStatus').value;

        let isValid = true;

        // ვალიდაციები P4.4 ცხრილის მიხედვით
        if (name.length < 3) {
            showError('newClientName', 'errName', 'Name must be at least 3 characters');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || crmClients.some(c => c.email === email)) {
            showError('newClientEmail', 'errEmail', 'Please enter a valid email address / A client with this email already exists');
            isValid = false;
        }

        if (phone && phone.length < 6) {
            showError('newClientPhone', 'errPhone', 'Phone number looks too short');
            isValid = false;
        }

        if (isNaN(dealValue) || dealValue <= 0) {
            showError('newClientDeal', 'errDeal', 'Deal value must be a positive number');
            isValid = false;
        }

        if (!isValid) return;

        // POST Request DummyJSON-ზე
        try {
            const response = await fetch('https://dummyjson.com/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] || '', email, phone, company: { name: company } })
            });

            const data = await response.json();

            // ვქმნით ჩვენს ობიექტს
            const newClient = {
                id: data.id || Date.now(), // API-მ თუ id არ მოგვცა, ჩვენსას ვწერთ
                name: name,
                email: email,
                phone: phone,
                company: company,
                image: "https://dummyjson.com/icon/newuser/128", // დეფოლტ სურათი
                status: status,
                dealValue: dealValue,
                notes: [],
                createdAt: new Date().toISOString()
            };

            // ვამატებთ მასივის დასაწყისში (unshift)
            crmClients.unshift(newClient);
            localStorage.setItem('crm_clients', JSON.stringify(crmClients));
            
            // ვხატავთ თავიდან
            renderClients(crmClients);

            // ვხურავთ მოდალს და ვაჩვენებთ Toast-ს
            modal.classList.remove('active');
            addClientForm.reset();
            showToast("Client added ✓", "success");

        } catch (error) {
            console.error("Error adding client:", error);
            showToast("Failed to add client", "error");
        }
    });
}