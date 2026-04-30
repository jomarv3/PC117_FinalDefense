function logout() {
    fetch(`${API}/logout`, {
        method: "POST",
        headers: authHeaders()
    }).finally(() => {
        clearSession();
        window.location.replace("index.html");
    });
}

async function loadDashboard() {
    const statsContainer = document.getElementById("dashboardStats");
    const activityTable = document.getElementById("dashboardActivityTable");

    if (!statsContainer || !activityTable) return;

    const res = await fetch(`${API}/dashboard/summary`, {
        headers: authHeaders()
    });
    const summary = await readJson(res);

    statsContainer.innerHTML = (summary.stats || []).map(item => `
        <div class="dashboard-card">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
        </div>
    `).join("");

    const rows = summary.recent_transactions || [];
    let html = `
    <tr>
        <th>Member</th>
        <th>Book</th>
        <th>Library Ref. No.</th>
        <th>Borrow Date</th>
        <th>Due Date</th>
        <th>Status</th>
    </tr>`;

    if (rows.length === 0) {
        html += `
        <tr>
            <td colspan="6">No borrowing activity is available yet.</td>
        </tr>`;
    }

    rows.forEach(row => {
        html += `
        <tr>
            <td>${row.member ?? "-"}</td>
            <td>${row.book ?? "-"}</td>
            <td>${row.reference ?? "-"}</td>
            <td>${row.borrow_date ?? "-"}</td>
            <td>${row.due_date ?? "-"}</td>
            <td>${displayStatus(row.status)}</td>
        </tr>`;
    });

    activityTable.innerHTML = html;
}

async function initializeDashboard() {
    try {
        await setupNavigation();

        if (allowedPages().includes("users")) loadUsers();
        if (allowedPages().includes("books")) loadBooks();
        if (allowedPages().includes("transactions")) loadTransactions();
    } catch (err) {
        clearSession();
        window.location.replace("index.html");
    }
}

initializeDashboard();
