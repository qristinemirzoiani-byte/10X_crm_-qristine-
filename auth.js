// give the current session from localStorage

const currentSession = JSON.parse(localStorage.getItem('crm_session'));
// take the current page name from the URL
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
// public pages that don't require authentication
const publicPages = ['index.html', 'signup.html'];

// თუ გვერდი დაცულია და სესია არ გვაქვს -> მივდივართ ლოგინზე
if (!publicPages.includes(currentPage) && !currentSession) {
    window.location.href = 'index.html';
}

// თუ საჯარო გვერდზე ვართ და უკვე დალოგინებული ვართ -> მივდივართ დეშბორდზე
if (publicPages.includes(currentPage) && currentSession) {
    window.location.href = 'dashboard.html';
}

// login function
function login() {
    const emailValue = document.getElementById('emailInput').value;
    const passwordValue = document.getElementById('passwordInput').value;
    const users = JSON.parse(localStorage.getItem('crm_users')) || [];
    const user = users.find(u => u.email === emailValue && u.password === passwordValue);
    
    if (user) {
        const session = {
            userId: user.id,
            email: user.email,
            loginAt: new Date().toISOString()
        };
        localStorage.setItem('crm_session', JSON.stringify(session));
        window.location.href = 'dashboard.html';
    } else {
        alert("email or password is incorrect!");
    }
}

function logout() {
    localStorage.removeItem('crm_session');
    window.location.href = 'index.html'; // გადმოაგდებს ლოგინზე
}

// register function
function registerUser() {
    const nameValue = document.getElementById('regName').value;
    const emailValue = document.getElementById('regEmail').value.toLowerCase();
    const passwordValue = document.getElementById('regPassword').value;
    // ვამოწმებთ, ცარიელი ხომ არ დატოვა რომელიმე ველი
    if (!nameValue || !emailValue || !passwordValue) {
        alert("გთხოვთ შეავსოთ ყველა ველი!");
        return; // აქ ვაჩერებთ ფუნქციას
    }

    // 2. მოგვაქვს უკვე დარეგისტრირებული ხალხი (ან ცარიელი სია)
    const users = JSON.parse(localStorage.getItem('crm_users')) || [];

    // ვამოწმებთ, ეს მეილი უკვე ხომ არ არის ბაზაში
    const existingUser = users.find(u => u.email === emailValue);
    if (existingUser) {
        alert("ამ მეილით მომხმარებელი უკვე არსებობს!");
        return;
    }

    // 3. ვქმნით ახალ User ობიექტს (დავალების მოთხოვნის მიხედვით)
    const newUser = {
        id: Date.now(), // ანიჭებს უნიკალურ რიცხვს იმ წამის მიხედვით
        fullName: nameValue,
        email: emailValue,
        password: passwordValue,
        company: "10X manager", 
        createdAt: new Date().toISOString()
    };

    // 4. ვაგდებთ ამ ახალ იუზერს ჩვენს სიაში (მასივში)
    users.push(newUser);

    // 5. აი შენი დაკარგული setItem! შევინახოთ განახლებული სია მეხსიერებაში
    localStorage.setItem('crm_users', JSON.stringify(users));

    alert("რეგისტრაცია წარმატებულია! გთხოვთ გაიაროთ ავტორიზაცია.");
    
    // 6. გადავისროლოთ ლოგინის გვერდზე
    window.location.href = 'index.html';
}



// ტესტის ფუნქცია, რომელიც localStorage-ში შეინახავს მონაცემს
    // function sheinaxeMonacemi() {
    //         // აი, აქ ვწერთ ზუსტად იმ კოდს
    //         localStorage.setItem('test', 'გამარჯობა, მე ვარ ლოკალ სთორიჯი!');
    //         alert('მონაცემი შენახულია! ახლა შეამოწმე F12-ით');
    //     }