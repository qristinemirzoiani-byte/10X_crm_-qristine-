// 1. AUTH GUARD (დაცვის მექანიზმი - P0.1)
// =========================================================
(function checkAuthGuard() {
    const currentSession = JSON.parse(localStorage.getItem('crm_session'));
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'signup.html', ''];

    // თუ არ არის დალოგინებული და შედის დაცულ გვერდზე
    if (!publicPages.includes(currentPage) && !currentSession) {
        window.location.href = 'index.html';
    }

    // თუ დალოგინებულია და შედის ლოგინზე ან რეგისტრაციაზე
    if (publicPages.includes(currentPage) && currentSession) {
        window.location.href = 'dashboard.html';
    }
})();

// =========================================================
// 2. დამხმარე ფუნქციები (Toast და შეცდომების გასუფთავება)
// =========================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function clearErrors() {
    document.querySelectorAll('.error-text').forEach(el => el.innerText = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('input-error'));
}

function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(errorId);
    if (input) input.classList.add('input-error');
    if (errorSpan) errorSpan.innerText = message;
}

// =========================================================
// 3. REGISTRATION LOGIC (signup.html) - P1.2 & P1.3
// =========================================================
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault(); // ფორმის გადატვირთვის აღკვეთა
        clearErrors();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const company = document.getElementById('regCompany').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        let isValid = true;

        // ვალიდაცია 1: Full Name (მინიმუმ 3 სიმბოლო)
        if (name.length < 3) {
            showError('regName', 'nameError', 'Full name must be at least 3 characters');
            isValid = false;
        }

        // ვალიდაცია 2: Email ფორმატი
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('regEmail', 'emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // ვალიდაცია 3: Email დუბლირება
        const users = JSON.parse(localStorage.getItem('crm_users')) || [];
        if (users.some(u => u.email === email)) {
            showError('regEmail', 'emailError', 'An account with this email already exists');
            isValid = false;
        }

        // ვალიდაცია 4: Password (მინ. 8 სიმბოლო, 1 ასო, 1 ციფრი)
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            showError('regPassword', 'passwordError', 'Password must be at least 8 characters and contain a letter and a number');
            isValid = false;
        }

        // ვალიდაცია 5: Confirm Password (უნდა ემთხვეოდეს)
        if (password !== confirmPassword) {
            showError('regConfirmPassword', 'confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        // თუ ყველაფერი ვალიდურია -> შენახვა
        if (isValid) {
            const newUser = {
                id: Date.now(),
                fullName: name,
                email: email,
                password: password,
                company: company || "",
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('crm_users', JSON.stringify(users));

            // მწვანე შეტყობინება
            showToast('Account created successfully! Please log in.', 'success');

            // 1.5 წამში გადამისამართება ლოგინზე
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}

// =========================================================
// 4. LOGIN LOGIC (index.html) - P2.2 & P2.3
// =========================================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('emailInput').value.trim().toLowerCase();
        const password = document.getElementById('passwordInput').value;

        let isValid = true;

        if (!email) {
            showError('emailInput', 'loginEmailError', 'Email is required');
            isValid = false;
        }

        if (!password) {
            showError('passwordInput', 'loginPasswordError', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        // მომხმარებლის ძებნა
        const users = JSON.parse(localStorage.getItem('crm_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            const session = {
                userId: user.id,
                email: user.email,
                loginAt: new Date().toISOString()
            };

            localStorage.setItem('crm_session', JSON.stringify(session));
            window.location.href = 'dashboard.html';
        } else {
            // ზოგადი უსაფრთხოების შეცდომა (PRD-ის P2.2 მოთხოვნა)
            document.getElementById('loginGlobalError').innerText = 'Invalid email or password';
        }
    });
}

// =========================================================
// 5. LOGOUT LOGIC
// =========================================================
function logout() {
    localStorage.removeItem('crm_session');
    window.location.href = 'index.html';
}


// ტესტის ფუნქცია, რომელიც localStorage-ში შეინახავს მონაცემს
    // function sheinaxeMonacemi() {
    //         // აი, აქ ვწერთ ზუსტად იმ კოდს
    //         localStorage.setItem('test', 'გამარჯობა, მე ვარ ლოკალ სთორიჯი!');
    //         alert('მონაცემი შენახულია! ახლა შეამოწმე F12-ით');
    //     }