const API = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("token");
const SESSION_KEY = "sessionExpiresAt";
const noUserImage = "https://dummyimage.com/50x50/cccccc/000000&text=Member";
const noBookImage = "https://dummyimage.com/60x80/cccccc/000000&text=No+Image";

function authHeaders() {
    return {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json"
    };
}

function saveSession(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem(SESSION_KEY, data.expires_at);
}

function clearSession() {
    localStorage.clear();
}

function isSessionExpired() {
    const expiresAt = localStorage.getItem(SESSION_KEY);

    return !expiresAt || new Date(expiresAt).getTime() <= Date.now();
}

async function readJson(res) {
    const text = await res.text();
    let data = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: "The server returned an unexpected response." };
    }

    if (!res.ok) throw data;

    return data;
}

function showFormError(message) {
    Swal.showValidationMessage(message);
    return false;
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateImage(file) {
    if (!file) return true;

    return ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
}

function validOptionalIsbn(isbn) {
    return !isbn || /^\d{1,13}$/.test(isbn);
}

function apiError(err, fallback) {
    if (err.errors) {
        return Object.values(err.errors).flat().join('\n');
    }

    return err.message || fallback;
}

function generateIsbn() {
    const datePart = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const randomPart = Math.floor(100000 + Math.random() * 900000);

    return `LIB-${datePart}-${randomPart}`;
}

async function getCategories() {
    const res = await fetch(`${API}/categories`, {
        headers: authHeaders()
    });

    return await readJson(res);
}

function categoryOptions(categories, selected = "") {
    let options = `<option value="">Select category</option>`;

    categories.forEach(category => {
        const isSelected = category === selected ? "selected" : "";
        options += `<option value="${category}" ${isSelected}>${category}</option>`;
    });

    return options;
}

async function openBlob(path) {
    const target = window.open("about:blank", "_blank");

    try {
        const res = await fetch(`${API}/${path}`, {
            headers: authHeaders()
        });

        if (!res.ok) {
            throw await readJson(res);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (target) {
            target.location.href = url;
        } else {
            window.location.href = url;
        }
    } catch (err) {
        if (target) {
            target.close();
        }

        throw err;
    }
}

async function downloadBlob(path, filename) {
    const res = await fetch(`${API}/${path}`, {
        headers: authHeaders()
    });

    if (!res.ok) {
        throw await readJson(res);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function openReport(type) {
    openBlob(`reports/${type}`).catch(err => {
        Swal.fire("Report Unavailable", apiError(err, "The requested report could not be opened."), "error");
    });
}

function downloadFile(path) {
    const filename = path.split("/").pop() + ".xlsx";

    downloadBlob(path, filename).catch(err => {
        Swal.fire("Export Failed", apiError(err, "The requested export could not be downloaded."), "error");
    });
}

async function importRecords(type) {
    const { value: file } = await Swal.fire({
        title: `Import ${recordLabel(type)}`,
        input: "file",
        inputAttributes: {
            accept: ".xlsx,.xls,.csv"
        },
        showCancelButton: true,
        preConfirm: file => {
            if (!file) return showFormError("Please select an Excel or CSV file");

            return file;
        }
    });

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(`${API}/import/${type}`, {
            method: "POST",
            headers: authHeaders(),
            body: formData
        });

        await readJson(res);

        Swal.fire("Import Completed", `${recordLabel(type)} records were imported successfully.`, "success");

        if (type === "users") loadUsers();
        if (type === "books") loadBooks();
        if (type === "transactions") loadTransactions();
    } catch (err) {
        Swal.fire("Import Failed", apiError(err, "The selected records could not be imported."), "error");
    }
}

function recordLabel(type) {
    if (type === "users") return "member account";
    if (type === "books") return "catalog";
    if (type === "transactions") return "borrowing transaction";

    return type;
}

function displayStatus(status) {
    return String(status ?? "Pending")
        .replaceAll("_", " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

window.openBlob = openBlob;
window.openReport = openReport;
window.downloadFile = downloadFile;
window.importRecords = importRecords;
