/* ================= BOOKS ================= */
let booksData = [];

async function loadBooks() {
    const res = await fetch(`${API}/books`, {
        headers: authHeaders()
    });

    booksData = await readJson(res);
    renderBooks();
}

function renderBooks() {
    const searchInput = document.getElementById("bookSearchInput");
    const sortSelect = document.getElementById("bookSortSelect");
    const booksTable = document.getElementById("booksTable");
    const bookCards = document.getElementById("bookCards");
    const managementActions = document.querySelector(".book-management-actions");
    const keyword = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const sortBy = sortSelect ? sortSelect.value : "latest";
    const isBorrower = currentRole() === "borrower";

    let data = booksData.filter(book => {
        return [
            book.title,
            book.author,
            book.category,
            book.isbn,
            book.book_isbn,
            book.status
        ].some(value => String(value ?? "").toLowerCase().includes(keyword));
    });

    data.sort((a, b) => {
        if (sortBy === "title") return String(a.title ?? "").localeCompare(String(b.title ?? ""));
        if (sortBy === "author") return String(a.author ?? "").localeCompare(String(b.author ?? ""));
        if (sortBy === "category") return String(a.category ?? "").localeCompare(String(b.category ?? ""));
        if (sortBy === "available") return Number(b.available_quantity ?? 0) - Number(a.available_quantity ?? 0);
        if (sortBy === "status") return String(a.status ?? "").localeCompare(String(b.status ?? ""));

        return Number(b.id ?? 0) - Number(a.id ?? 0);
    });

    if (managementActions) {
        managementActions.hidden = isBorrower;
    }

    if (booksTable) {
        booksTable.hidden = isBorrower;
    }

    if (bookCards) {
        bookCards.hidden = !isBorrower;
    }

    if (isBorrower) {
        renderBorrowerBooks(data);
        return;
    }

    let html = `
    <tr>
        <th>ID</th>
        <th>Cover</th>
        <th>Title</th>
        <th>Author</th>
        <th>Category</th>
        <th>Library Ref. No.</th>
        <th>ISBN</th>
        <th>Availability</th>
        <th>Status</th>
        <th>Action</th>
    </tr>`;

    data.forEach(b => {
        const imageUrl = b.image_url
            ? b.image_url
            : noBookImage;
        const status = b.status ?? 'available';
        const statusClass = status === 'unavailable' ? 'status-unavailable' : 'status-available';
        const availableQuantity = b.available_quantity ?? b.quantity;

        html += `
        <tr>
            <td>${b.id}</td>
            <td><img src="${imageUrl}" width="50"></td>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.category ?? 'Uncategorized'}</td>
            <td>${b.isbn}</td>
            <td>${b.book_isbn ?? '-'}</td>
            <td>${availableQuantity}/${b.quantity}</td>
            <td><span class="status-badge ${statusClass}">${displayStatus(status)}</span></td>
            <td>
                <button class="action-btn view" onclick="viewBookHistory(${b.id})">History</button>
                <button class="action-btn qr" onclick="viewBookQr(${b.id})">QR</button>
                <button class="action-btn edit" onclick="editBook(${b.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteItem('books',${b.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("booksTable").innerHTML = html;
}

function renderBorrowerBooks(data) {
    const bookCards = document.getElementById("bookCards");

    if (!bookCards) return;

    if (data.length === 0) {
        bookCards.innerHTML = `<div class="empty-state">No catalog records match your search.</div>`;
        return;
    }

    bookCards.innerHTML = data.map(book => {
        const imageUrl = book.image_url ? book.image_url : noBookImage;
        const status = book.status ?? "available";
        const statusClass = status === "unavailable" ? "status-unavailable" : "status-available";
        const availableQuantity = book.available_quantity ?? book.quantity;

        return `
        <article class="book-card">
            <img src="${imageUrl}" alt="${book.title} cover">
            <div class="book-card-body">
                <div>
                    <span class="status-badge ${statusClass}">${displayStatus(status)}</span>
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                </div>
                <dl>
                    <div>
                        <dt>Category</dt>
                        <dd>${book.category ?? "Uncategorized"}</dd>
                    </div>
                    <div>
                        <dt>Library Ref. No.</dt>
                        <dd>${book.isbn ?? "-"}</dd>
                    </div>
                    <div>
                        <dt>ISBN</dt>
                        <dd>${book.book_isbn ?? "-"}</dd>
                    </div>
                    <div>
                        <dt>Available Copies</dt>
                        <dd>${availableQuantity}/${book.quantity}</dd>
                    </div>
                </dl>
            </div>
        </article>`;
    }).join("");
}

document.getElementById("bookSearchInput")?.addEventListener("input", renderBooks);
document.getElementById("bookSortSelect")?.addEventListener("change", renderBooks);

/* ADD BOOK */
async function addBook() {
    const categories = await getCategories();
    const isbn = generateIsbn();

    const { value: form } = await Swal.fire({
        title: "Add Catalog Record",
        html: `
            <input id="title" class="swal2-input" placeholder="Book title">
            <input id="author" class="swal2-input" placeholder="Author name">
            <select id="category" class="swal2-select book-category-select">
                ${categoryOptions(categories)}
            </select>
            <input id="isbn" class="swal2-input" value="${isbn}" placeholder="Library reference number" readonly>
            <input id="book_isbn" class="swal2-input" placeholder="ISBN (optional, up to 13 digits)" maxlength="13" inputmode="numeric">
            <input id="quantity" type="number" class="swal2-input" placeholder="Total copies">
            <input id="image" type="file" class="swal2-file">
        `,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
            const popup = Swal.getPopup();
            const title = popup.querySelector("#title").value.trim();
            const author = popup.querySelector("#author").value.trim();
            const category = popup.querySelector("#category").value.trim();
            const isbn = popup.querySelector("#isbn").value.trim();
            const book_isbn = popup.querySelector("#book_isbn").value.trim();
            const quantity = popup.querySelector("#quantity").value;
            const image = popup.querySelector("#image").files[0] || null;

            if (!title) return showFormError("Book title is required");
            if (!author) return showFormError("Author name is required");
            if (!category) return showFormError("Category is required");
            if (!isbn) return showFormError("Library reference number is required");
            if (!validOptionalIsbn(book_isbn)) return showFormError("ISBN must be numbers only and up to 13 digits");
            if (!quantity || Number(quantity) < 1) return showFormError("Total copies must be at least 1");
            if (!validateImage(image)) return showFormError("Book cover must be a JPG or PNG file");

            return {
                title,
                author,
                category,
                isbn,
                book_isbn,
                quantity,
                image
            };
        }
    });

    if (!form) return;

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("author", form.author);
    fd.append("category", form.category);
    fd.append("isbn", form.isbn);
    fd.append("book_isbn", form.book_isbn);
    fd.append("quantity", form.quantity);

    if (form.image) {
        fd.append("image", form.image);
    }

    try {
        const res = await fetch(`${API}/books`, {
            method: "POST",
            headers: authHeaders(),
            body: fd
        });

        await readJson(res);

        Swal.fire("Catalog Record Created", "The catalog record was created successfully.", "success");
        loadBooks();

    } catch (err) {
        Swal.fire("Create Catalog Record Failed", apiError(err, "The catalog record could not be created."), "error");
    }
}
window.editBook = async function (id) {
    const categories = await getCategories();
    const res = await fetch(`${API}/books/${id}`, {
        headers: authHeaders()
    });

    if (!res.ok) {
        Swal.fire("Catalog Record Unavailable", "The selected catalog record could not be loaded.", "error");
        return;
    }

    const b = await readJson(res);

    const { value: form } = await Swal.fire({
        title: "Edit Catalog Record",
        html: `
            <input id="title" class="swal2-input" value="${b.title ?? ""}">
            <input id="author" class="swal2-input" value="${b.author ?? ""}">
            <select id="category" class="swal2-select book-category-select">
                ${categoryOptions(categories, b.category ?? "")}
            </select>
            <input id="isbn" class="swal2-input" value="${b.isbn ?? ""}" placeholder="Library reference number">
            <input id="book_isbn" class="swal2-input" value="${b.book_isbn ?? ""}" placeholder="ISBN (optional, up to 13 digits)" maxlength="13" inputmode="numeric">
            <input id="quantity" type="number" class="swal2-input" value="${b.quantity ?? 1}">
            <input id="image" type="file" class="swal2-file">
        `,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
            const popup = Swal.getPopup();
            const title = popup.querySelector("#title").value.trim();
            const author = popup.querySelector("#author").value.trim();
            const category = popup.querySelector("#category").value.trim();
            const isbn = popup.querySelector("#isbn").value.trim();
            const book_isbn = popup.querySelector("#book_isbn").value.trim();
            const quantity = popup.querySelector("#quantity").value;
            const image = popup.querySelector("#image").files[0] || null;

            if (!title) return showFormError("Book title is required");
            if (!author) return showFormError("Author name is required");
            if (!category) return showFormError("Category is required");
            if (!isbn) return showFormError("Library reference number is required");
            if (!validOptionalIsbn(book_isbn)) return showFormError("ISBN must be numbers only and up to 13 digits");
            if (!quantity || Number(quantity) < 1) return showFormError("Total copies must be at least 1");
            if (!validateImage(image)) return showFormError("Book cover must be a JPG or PNG file");

            return {
                title,
                author,
                category,
                isbn,
                book_isbn,
                quantity,
                image
            };
        }
    });

    if (!form) return;

    const fd = new FormData();
    fd.append("_method", "PUT");
    fd.append("title", form.title);
    fd.append("author", form.author);
    fd.append("category", form.category);
    fd.append("isbn", form.isbn);
    fd.append("book_isbn", form.book_isbn);
    fd.append("quantity", form.quantity);

    if (form.image) {
        fd.append("image", form.image);
    }

    try {
        const updateRes = await fetch(`${API}/books/${id}`, {
            method: "POST",
            headers: authHeaders(),
            body: fd
        });

        await readJson(updateRes);

        Swal.fire("Catalog Record Updated", "The catalog record was updated successfully.", "success");
        loadBooks();

    } catch (err) {
        Swal.fire("Update Catalog Record Failed", apiError(err, "The catalog record could not be updated."), "error");
    }
};

async function viewBookHistory(id) {
    try {
        const res = await fetch(`${API}/books/${id}`, {
            headers: authHeaders()
        });

        const book = await readJson(res);
        const transactions = book.transactions || [];

        let history = `
        <table style="width:100%; border-collapse:collapse; text-align:left;">
            <tr>
                <th style="padding:8px; border-bottom:1px solid #eee;">Member</th>
                <th style="padding:8px; border-bottom:1px solid #eee;">Borrow Date</th>
                <th style="padding:8px; border-bottom:1px solid #eee;">Return Date</th>
                <th style="padding:8px; border-bottom:1px solid #eee;">Status</th>
            </tr>`;

        if (transactions.length === 0) {
            history += `
            <tr>
                <td colspan="4" style="padding:8px; border-bottom:1px solid #eee;">No borrowing history is available for this record.</td>
            </tr>`;
        }

        transactions.forEach(t => {
            history += `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">${t.user ? t.user.name : t.user_id}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${t.borrow_date ?? '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${t.return_date ?? '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${t.status ?? 'pending'}</td>
            </tr>`;
        });

        history += `</table>`;

        Swal.fire({
            title: `${book.title} Borrowing History`,
            html: history,
            width: 700
        });

    } catch (err) {
        Swal.fire("Borrowing History Unavailable", apiError(err, "The borrowing history could not be loaded."), "error");
    }
}

async function viewBookQr(id) {
    try {
        const res = await fetch(`${API}/books/${id}`, {
            headers: authHeaders()
        });

        const book = await readJson(res);

        if (!book.qr_url) {
            Swal.fire("QR Code Unavailable", "This catalog record does not have a generated QR code yet.", "info");
            return;
        }

        Swal.fire({
            title: `${book.title} QR Code`,
            html: `
                <img src="${book.qr_url}" width="220" height="220" style="object-fit:contain;">
                <p style="margin-top:12px;">${book.isbn}</p>
            `
        });

    } catch (err) {
        Swal.fire("QR Code Unavailable", apiError(err, "The QR code could not be loaded."), "error");
    }
}

async function manageCategories() {
    try {
        const categories = await getCategories();
        const list = categories.length
            ? categories.map(category => `<li>${category}</li>`).join("")
            : "<li>No categories have been added yet.</li>";

        const { value: name } = await Swal.fire({
            title: "Manage Catalog Categories",
            html: `
                <input id="categoryName" class="swal2-input" placeholder="Category name">
                <div style="text-align:left; margin:15px auto 0; max-width:300px;">
                    <strong>Available Categories</strong>
                    <ul style="margin:10px 0 0 18px;">${list}</ul>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Save Category",
            preConfirm: () => {
                const categoryName = document.getElementById("categoryName").value.trim();

                if (!categoryName) return showFormError("Category name is required");

                return categoryName;
            }
        });

        if (!name) return;

        const res = await fetch(`${API}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({ name })
        });

        await readJson(res);

        Swal.fire("Category Saved", "The catalog category was saved successfully.", "success");

    } catch (err) {
        Swal.fire("Category Save Failed", apiError(err, "The catalog category could not be saved."), "error");
    }
}
