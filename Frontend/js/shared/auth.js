/* AUTH CHECK */
let serverPages = [];
let serverRole = "";
const pageLabels = {
    dashboard: "Dashboard",
    users: "Members",
    books: "Catalog",
    transactions: "Borrowing"
};

if (!token || isSessionExpired()) {
    clearSession();
    window.location.replace("index.html");
}

function allowedPages() {
    return serverPages;
}

function currentRole() {
    return serverRole;
}

async function setupNavigation() {
    const res = await fetch(`${API}/dashboard`, {
        headers: authHeaders()
    });

    const dashboard = await readJson(res);
    serverPages = dashboard.allowed_pages || [];
    serverRole = dashboard.role || "";

    const pages = allowedPages();
    const savedPage = localStorage.getItem("activePage");
    const firstPage = pages.includes(savedPage) ? savedPage : (pages[0] || "dashboard");
    document.querySelector(".sidebar h2").innerText = `${displayStatus(dashboard.role || "library")} Portal`;

    const nav = document.querySelector(".nav");
    nav.innerHTML = "";

    pages.forEach(page => {
        const menu = document.createElement("a");
        menu.className = "menu";
        menu.dataset.page = page;
        menu.textContent = pageLabels[page] || displayStatus(page);
        menu.addEventListener("click", () => {
            showPage(page);
        });

        nav.appendChild(menu);
    });

    showPage(firstPage);
}

function showPage(page) {
    if (!allowedPages().includes(page)) {
        page = allowedPages()[0] || "dashboard";
    }

    localStorage.setItem("activePage", page);

    document.querySelectorAll(".menu").forEach(menu => {
        menu.classList.toggle("active", menu.dataset.page === page);
    });

    document.querySelectorAll(".section").forEach(section => {
        section.classList.toggle("active", section.id === page);
    });

    if (page === "users") loadUsers();
    if (page === "books") loadBooks();
    if (page === "transactions") loadTransactions();
    if (page === "dashboard") loadDashboard();
}
