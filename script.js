
// USER ACCOUNT SYSTEM

let users = JSON.parse(localStorage.getItem("ch_users")) || [];
// Create a demo admin account if it does not exist

if (!users.some(user => user.email === "admin@contacthub.com")) {

    users.push({
        id: "admin001",
        name: "ContactHub Admin",
        email: "admin@contacthub.com",
        password: "admin123",
        role: "admin"
    });

    localStorage.setItem("ch_users", JSON.stringify(users));
}
let currentUser = JSON.parse(sessionStorage.getItem("ch_currentUser")) || null;

const registerSection = document.getElementById("registerSection");
const loginSection = document.getElementById("loginSection");
const profileSection = document.getElementById("profileSection");
const dashboard = document.getElementById("dashboard");
const userNavigation = document.getElementById("userNavigation");

function saveUsers() {
    localStorage.setItem("ch_users", JSON.stringify(users));
}

function showPage(page) {
    registerSection.hidden = page !== "register";
    loginSection.hidden = page !== "login";
    profileSection.hidden = page !== "profile";
    dashboard.hidden = page !== "dashboard";
}

function saveSession() {
    sessionStorage.setItem("ch_currentUser", JSON.stringify(currentUser));
}

function updateNavigation() {
    userNavigation.hidden = !currentUser;

    if (currentUser) {
        document.getElementById("welcomeUser").textContent =
            "Welcome, " + currentUser.name;
    }
}


function openDashboard() {
    showPage("dashboard");
    updateNavigation();

    const isAdmin = currentUser.role === "admin";

    // Show statistics only for normal users
    document.getElementById("userStats").hidden = isAdmin;

    // Admin and user dashboard visibility
    document.getElementById("adminDashboard").hidden = !isAdmin;
    document.getElementById("contact").hidden = isAdmin;

    document.querySelector("#dashboard > .records-section").hidden = isAdmin;

    if (isAdmin) {
        displayAdminDashboard();
    } else {
        displayContacts();
    }
}

// Switch between login and registration

document.getElementById("showLogin").addEventListener("click", function(event) {
    event.preventDefault();
    showPage("login");
});

document.getElementById("showRegister").addEventListener("click", function(event) {
    event.preventDefault();
    showPage("register");
});

// Registration

document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;

    if (users.some(user => user.email === email)) {
        alert("This email is already registered.");
        return;
    }

    users.push({
    id: Date.now().toString(),
    name: name,
    email: email,
    password: password,
    role: "user"
});

    saveUsers();
    this.reset();

    alert("Registration successful! Please login.");
    showPage("login");
});

// Login

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const user = users.find(
        item => item.email === email && item.password === password
    );

    if (!user) {
        alert("Invalid email or password.");
        return;
    }
currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user"
};

    saveSession();
    this.reset();
    openDashboard();
});

// Profile

document.getElementById("profileBtn").addEventListener("click", function() {
    if (!currentUser) return;

    document.getElementById("profileName").value = currentUser.name;
    document.getElementById("profileEmail").value = currentUser.email;

    showPage("profile");
});

document.getElementById("profileForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("profileName").value.trim();
    const email = document.getElementById("profileEmail").value.trim().toLowerCase();

    const emailUsed = users.some(
        user => user.email === email && user.id !== currentUser.id
    );

    if (emailUsed) {
        alert("This email is already used by another account.");
        return;
    }

    const user = users.find(item => item.id === currentUser.id);

    if (!user) {
        alert("Account not found. Please login again.");
        logout();
        return;
    }

    user.name = name;
    user.email = email;

    currentUser.name = name;
    currentUser.email = email;

    saveUsers();
    saveSession();

    alert("Profile updated successfully!");
    openDashboard();
});

document.getElementById("closeProfile").addEventListener("click", openDashboard);

// Logout

function logout() {
    currentUser = null;
    sessionStorage.removeItem("ch_currentUser");
    updateNavigation();
    showPage("login");
}

document.getElementById("logoutBtn").addEventListener("click", logout);


// CONTACT MANAGEMENT

function getAllContacts() {
    return JSON.parse(localStorage.getItem("ch_contacts")) || [];
}

function getUserContacts() {
    if (!currentUser) return [];

    return getAllContacts()
        .filter(contact => contact.userId === currentUser.id);
}

function saveContacts(contacts) {
    const allContacts = getAllContacts().filter(
        contact => contact.userId !== currentUser.id
    );

    localStorage.setItem(
        "ch_contacts",
        JSON.stringify([...allContacts, ...contacts])
    );
}

// Display contacts

function displayContacts() {
    if (!currentUser) return;const allUserContacts = getUserContacts();

document.getElementById("userTotalContacts").textContent =
    allUserContacts.length;

document.getElementById("userPending").textContent =
    allUserContacts.filter(c => !c.status || c.status === "Pending").length;

document.getElementById("userProgress").textContent =
    allUserContacts.filter(c => c.status === "In Progress").length;

document.getElementById("userResolved").textContent =
    allUserContacts.filter(c => c.status === "Resolved").length;

    const contactList = document.getElementById("contactList");
    const search = document.getElementById("searchInput").value.toLowerCase();
    const filter = document.getElementById("statusFilter").value;

    contactList.innerHTML = "";

    const contacts = getUserContacts();

    const filtered = contacts
        .map((contact, index) => ({ contact, index }))
        .filter(item => {
            const c = item.contact;

            const matchesSearch =
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search) ||
                c.phone.includes(search);

            const matchesStatus =
                filter === "All" || c.status === filter;

            return matchesSearch && matchesStatus;
        });

    if (filtered.length === 0) {
        contactList.textContent = "No matching contacts found.";
        return;
    }

    filtered.forEach(item => {
        const c = item.contact;
        const index = item.index;

        const card = document.createElement("div");
        card.className = "contact-card";

        const heading = document.createElement("h3");
        heading.textContent = c.name;

        const details = document.createElement("p");
        details.textContent = "Email: " + c.email + " | Phone: " + c.phone;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + c.subject;

        const message = document.createElement("p");
        message.textContent = "Message: " + c.message;

        const status = document.createElement("select");

        ["Pending", "In Progress", "Resolved"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            status.appendChild(option);
        });

        status.value = c.status || "Pending";

function applyStatusColor() {
    status.style.fontWeight = "bold";

    if (status.value === "Pending") {
        status.style.backgroundColor = "#ffedd5";
        status.style.color = "#c2410c";
        status.style.borderColor = "#fb923c";
    }
    else if (status.value === "In Progress") {
        status.style.backgroundColor = "#dbeafe";
        status.style.color = "#1d4ed8";
        status.style.borderColor = "#60a5fa";
    }
    else if (status.value === "Resolved") {
        status.style.backgroundColor = "#dcfce7";
        status.style.color = "#15803d";
        status.style.borderColor = "#4ade80";
    }
}

applyStatusColor();

        status.addEventListener("change", function() {
    contacts[index].status = status.value;
    saveContacts(contacts);
    applyStatusColor();
    displayContacts();
});

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {
            editContact(index);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            deleteContact(index);
        });

        card.append(
            heading, details, subject, message,
            status, editButton, deleteButton
        );

        contactList.appendChild(card);
    });
}

// Add or update contact

document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Enter a valid 10 digit phone number.");
        return;
    }

    const contacts = getUserContacts();
    const editIndex = document.getElementById("editIndex").value;

    const newContact = {
        name,
        email,
        phone,
        subject,
        message,
        status: "Pending",
        userId: currentUser.id
    };

    if (editIndex === "") {
        contacts.push(newContact);
        document.getElementById("successMessage").textContent =
            "Contact added successfully!";
    } else {
        newContact.status = contacts[Number(editIndex)].status || "Pending";
        contacts[Number(editIndex)] = newContact;
        document.getElementById("successMessage").textContent =
            "Contact updated successfully!";
    }

    saveContacts(contacts);
    this.reset();
    resetEdit();
    displayContacts();
});

// Edit contact

function editContact(index) {
    const contact = getUserContacts()[index];

    document.getElementById("name").value = contact.name;
    document.getElementById("email").value = contact.email;
    document.getElementById("phone").value = contact.phone;
    document.getElementById("subject").value = contact.subject;
    document.getElementById("message").value = contact.message;

    document.getElementById("editIndex").value = index;
    document.getElementById("formTitle").textContent = "Edit Contact";
    document.getElementById("submitBtn").textContent = "Update Contact";
    document.getElementById("cancelBtn").hidden = false;

    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
}

function resetEdit() {
    document.getElementById("editIndex").value = "";
    document.getElementById("formTitle").textContent = "Add New Contact";
    document.getElementById("submitBtn").textContent = "Save Contact";
    document.getElementById("cancelBtn").hidden = true;
}

document.getElementById("cancelBtn").addEventListener("click", function() {
    document.getElementById("contactForm").reset();
    resetEdit();
});

// Delete contact

function deleteContact(index) {
    if (!confirm("Delete this contact?")) return;

    const contacts = getUserContacts();
    contacts.splice(index, 1);
    saveContacts(contacts);
    displayContacts();
}

// Search and filter

document.getElementById("searchInput").addEventListener("input", displayContacts);
document.getElementById("statusFilter").addEventListener("change", displayContacts);

// Restore session when page opens

if (currentUser && users.some(user => user.id === currentUser.id)) {
    openDashboard();
} else {
    currentUser = null;
    sessionStorage.removeItem("ch_currentUser");
    showPage("register");
    updateNavigation();
}

// ADMIN DASHBOARD FUNCTIONS

function displayAdminDashboard() {

    const allUsers = JSON.parse(
        localStorage.getItem("ch_users")
    ) || [];

    const allContacts = JSON.parse(
        localStorage.getItem("ch_contacts")
    ) || [];

    // Calculate dashboard statistics

    document.getElementById("totalUsers").textContent =
        allUsers.filter(user => user.role !== "admin").length;

    document.getElementById("totalContacts").textContent =
        allContacts.length;

    document.getElementById("pendingContacts").textContent =
        allContacts.filter(c => !c.status || c.status === "Pending").length;

    document.getElementById("progressContacts").textContent =
        allContacts.filter(c => c.status === "In Progress").length;

    document.getElementById("resolvedContacts").textContent =
        allContacts.filter(c => c.status === "Resolved").length;

    displayAdminContacts();
}

// Display every user's contacts

function displayAdminContacts() {

    const allContacts = JSON.parse(
        localStorage.getItem("ch_contacts")
    ) || [];

    const allUsers = JSON.parse(
        localStorage.getItem("ch_users")
    ) || [];

    const search = document.getElementById("adminSearch")
        .value.toLowerCase();

    const list = document.getElementById("adminContactList");

    list.innerHTML = "";

    const filtered = allContacts
        .map((contact, index) => ({ contact, index }))
        .filter(item => {
            const c = item.contact;

            return (
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search) ||
                c.phone.includes(search)
            );
        });

    if (filtered.length === 0) {
        list.textContent = "No contacts found.";
        return;
    }

    filtered.forEach(item => {

        const c = item.contact;
        const index = item.index;

        const user = allUsers.find(u => u.id === c.userId);

        const card = document.createElement("div");
        card.className = "admin-contact";

        const heading = document.createElement("h3");
        heading.textContent = c.name;

        const email = document.createElement("p");
        email.textContent = "Email: " + c.email;

        const phone = document.createElement("p");
        phone.textContent = "Phone: " + c.phone;

        const owner = document.createElement("p");
        owner.textContent = "Submitted by: " +
            (user ? user.name : "Unknown User");

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + c.subject;

        const message = document.createElement("p");
        message.textContent = "Message: " + c.message;

        const status = document.createElement("select");

        ["Pending", "In Progress", "Resolved"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            status.appendChild(option);
        });

        status.value = c.status || "Pending";
        status.classList.add(
    (c.status || "Pending").toLowerCase().replace(" ", "-")
);
status.classList.add("status-select");

        status.addEventListener("change", function() {

            const contacts = JSON.parse(
                localStorage.getItem("ch_contacts")
            ) || [];

            contacts[index].status = status.value;

            localStorage.setItem(
                "ch_contacts",
                JSON.stringify(contacts)
            );

            displayAdminDashboard();
        });

        card.append(
            heading, email, phone, owner,
            subject, message, status
        );

        list.appendChild(card);

    });
}

// Admin search

document.getElementById("adminSearch")
    .addEventListener("input", displayAdminContacts);
 {
    const allUsers = JSON.parse(localStorage.getItem("ch_users")) || [];
    const allContacts = JSON.parse(localStorage.getItem("ch_contacts")) || [];

    document.getElementById("totalUsers").textContent =
        allUsers.filter(user => user.role !== "admin").length;

    document.getElementById("totalContacts").textContent = allContacts.length;

    document.getElementById("pendingContacts").textContent =
        allContacts.filter(c => !c.status || c.status === "Pending").length;

    document.getElementById("progressContacts").textContent =
        allContacts.filter(c => c.status === "In Progress").length;

    document.getElementById("resolvedContacts").textContent =
        allContacts.filter(c => c.status === "Resolved").length;

    displayAdminContacts();
}

function displayAdminContacts() {
    const allContacts = JSON.parse(localStorage.getItem("ch_contacts")) || [];
    const allUsers = JSON.parse(localStorage.getItem("ch_users")) || [];

    const search = document.getElementById("adminSearch").value.toLowerCase();
    const list = document.getElementById("adminContactList");

    list.innerHTML = "";

    const filtered = allContacts
        .map((contact, index) => ({ contact, index }))
        .filter(item => {
            const c = item.contact;

            return (
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search) ||
                c.phone.includes(search)
            );
        });

    if (filtered.length === 0) {
        list.textContent = "No contacts found.";
        return;
    }

    filtered.forEach(item => {
        const c = item.contact;
        const index = item.index;

        const user = allUsers.find(u => u.id === c.userId);

        const card = document.createElement("div");
        card.className = "admin-contact";

        card.innerHTML = `
            <h3>${c.name}</h3>
            <p>Email: ${c.email}</p>
            <p>Phone: ${c.phone}</p>
            <p>Submitted by: ${user ? user.name : "Unknown User"}</p>
            <p>Subject: ${c.subject}</p>
            <p>Message: ${c.message}</p>
        `;

        const status = document.createElement("select");

        ["Pending", "In Progress", "Resolved"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            status.appendChild(option);
        });

        status.value = c.status || "Pending";
        status.className = "status-select " +
    (c.status || "Pending").toLowerCase().replace(" ", "-");

        status.addEventListener("change", function () {
            const contacts = JSON.parse(localStorage.getItem("ch_contacts")) || [];

            contacts[index].status = status.value;

            localStorage.setItem("ch_contacts", JSON.stringify(contacts));

            displayAdminDashboard();
        });

        card.appendChild(status);
        list.appendChild(card);
    });
}

document.getElementById("adminSearch")
    .addEventListener("input", displayAdminContacts);

