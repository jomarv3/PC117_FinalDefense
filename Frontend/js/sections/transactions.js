/* ================= TRANSACTIONS ================= */
let transactionsData = [];

async function loadTransactions() {
    const res = await fetch(`${API}/transactions`, {
        headers: authHeaders()
    });

    transactionsData = await readJson(res);
    renderTransactions();
}

function renderTransactions() {
    const searchInput = document.getElementById("transactionSearchInput");
    const sortSelect = document.getElementById("transactionSortSelect");
    const keyword = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const sortBy = sortSelect ? sortSelect.value : "latest";

    let data = transactionsData.filter(transaction => {
        const userName = transaction.user ? transaction.user.name : transaction.user_id;
        const bookTitle = transaction.book ? transaction.book.title : transaction.book_id;
        const referenceNumber = transaction.book ? transaction.book.isbn : "";

        return [
            userName,
            bookTitle,
            referenceNumber,
            transaction.borrow_date,
            transaction.return_date,
            transaction.status
        ].some(value => String(value ?? "").toLowerCase().includes(keyword));
    });

    data.sort((a, b) => {
        const userA = a.user ? a.user.name : a.user_id;
        const userB = b.user ? b.user.name : b.user_id;
        const bookA = a.book ? a.book.title : a.book_id;
        const bookB = b.book ? b.book.title : b.book_id;
        const refA = a.book ? a.book.isbn : "";
        const refB = b.book ? b.book.isbn : "";

        if (sortBy === "user") return String(userA ?? "").localeCompare(String(userB ?? ""));
        if (sortBy === "book") return String(bookA ?? "").localeCompare(String(bookB ?? ""));
        if (sortBy === "reference") return String(refA ?? "").localeCompare(String(refB ?? ""));
        if (sortBy === "status") return String(a.status ?? "").localeCompare(String(b.status ?? ""));
        if (sortBy === "borrow_date") return String(b.borrow_date ?? "").localeCompare(String(a.borrow_date ?? ""));
        if (sortBy === "return_date") return String(b.return_date ?? "").localeCompare(String(a.return_date ?? ""));

        return Number(b.id ?? 0) - Number(a.id ?? 0);
    });

    let html = `
    <tr>
        <th>ID</th><th>Member</th><th>Book Title</th><th>Library Ref. No.</th><th>Borrow Date</th><th>Due Date</th><th>Return Date</th><th>Status</th><th>Action</th>
    </tr>`;

    data.forEach(t => {
        const userName = t.user ? t.user.name : t.user_id;
        const bookTitle = t.book ? t.book.title : t.book_id;
        const referenceNumber = t.book ? t.book.isbn : '-';
        const borrowDate = t.borrow_date ?? '-';
        const dueDate = t.due_date ?? '-';
        const returnDate = t.return_date ?? '-';
        const returnButton = t.status === 'borrowed'
            ? `<button class="action-btn return" onclick="returnTransaction(${t.id})">Return</button>`
            : '';

        html += `
        <tr>
            <td>${t.id}</td>
            <td>${userName}</td>
            <td>${bookTitle}</td>
            <td>${referenceNumber}</td>
            <td>${borrowDate}</td>
            <td>${dueDate}</td>
            <td>${returnDate}</td>
            <td>${displayStatus(t.status)}</td>
            <td>
                ${returnButton}
                <button class="action-btn view" onclick="openBlob('transactions/${t.id}/receipt')">Receipt</button>
                <button class="action-btn delete" onclick="deleteItem('transactions',${t.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("transTable").innerHTML = html;
}

document.getElementById("transactionSearchInput")?.addEventListener("input", renderTransactions);
document.getElementById("transactionSortSelect")?.addEventListener("change", renderTransactions);

/* ADD TRANSACTION */
async function addTransaction() {
    const [users, books] = await Promise.all([
        fetch(`${API}/borrowers`, { headers: authHeaders() }).then(readJson),
        fetch(`${API}/books`, { headers: authHeaders() }).then(readJson)
    ]);

    const borrowers = users;
    const availableBooks = books.filter(book => Number(book.available_quantity) > 0);

    if (borrowers.length === 0) {
        Swal.fire("No Borrower Accounts", "Please create at least one borrower account before recording a borrowing transaction.", "info");
        return;
    }

    if (availableBooks.length === 0) {
        Swal.fire("No Available Catalog Records", "There are no available copies to lend at this time.", "info");
        return;
    }

    const userOptions = borrowers.map(user =>
        `<option value="${user.id}">${user.name} (${user.email})</option>`
    ).join("");

    let filteredBooks = availableBooks;
    let bookIndex = 0;
    let selectedBookId = availableBooks[0].id;

    const { value: form } = await Swal.fire({
        title: "Record Borrowing Transaction",
        html: `
        <input id="bookSearch" class="borrow-search" placeholder="Search catalog records">
        <div class="borrow-book-carousel">
            <button type="button" id="prevBook" class="borrow-carousel-btn">&lt;</button>
            <div id="bookCarouselCard" class="borrow-book-card"></div>
            <button type="button" id="nextBook" class="borrow-carousel-btn">&gt;</button>
        </div>
        <select id="user_id" class="swal2-select book-category-select">
            ${userOptions}
        </select>
        `,
        showCancelButton: true,
        width: 680,
        didOpen: () => {
            const card = document.getElementById("bookCarouselCard");
            const search = document.getElementById("bookSearch");
            const prev = document.getElementById("prevBook");
            const next = document.getElementById("nextBook");

            const renderBook = () => {
                if (filteredBooks.length === 0) {
                    selectedBookId = "";
                    card.innerHTML = `<div class="borrow-book-title">No matching books</div>`;
                    return;
                }

                if (bookIndex < 0) bookIndex = filteredBooks.length - 1;
                if (bookIndex >= filteredBooks.length) bookIndex = 0;

                const book = filteredBooks[bookIndex];
                const imageUrl = book.image_url ? book.image_url : noBookImage;
                selectedBookId = book.id;

                card.innerHTML = `
                    <img src="${imageUrl}">
                    <div class="borrow-book-title">${book.title}</div>
                    <div class="borrow-book-meta">${book.author}</div>
                    <div class="borrow-book-meta">Library Ref. No.: ${book.isbn}</div>
                    <div class="borrow-book-meta">ISBN: ${book.book_isbn ?? '-'}</div>
                    <div class="borrow-book-meta">Available Copies: ${book.available_quantity}/${book.quantity}</div>
                    <div class="borrow-book-meta">Category: ${book.category ?? 'Uncategorized'}</div>
                `;
            };

            prev.addEventListener("click", () => {
                bookIndex--;
                renderBook();
            });

            next.addEventListener("click", () => {
                bookIndex++;
                renderBook();
            });

            search.addEventListener("input", () => {
                const keyword = search.value.trim().toLowerCase();

                filteredBooks = availableBooks.filter(book => {
                    return [
                        book.title,
                        book.author,
                        book.category,
                        book.isbn,
                        book.book_isbn
                    ].some(value => String(value ?? "").toLowerCase().includes(keyword));
                });

                bookIndex = 0;
                renderBook();
            });

            renderBook();
        },
        preConfirm: () => {
            const user_id = document.getElementById("user_id").value.trim();
            const book_id = String(selectedBookId || "").trim();

            if (!user_id || Number(user_id) < 1) return showFormError("Please select a valid borrower account");
            if (!book_id || Number(book_id) < 1) return showFormError("Please select a valid catalog record");

            return { user_id, book_id };
        }
    });

    if (!form) return;

    try {
        const res = await fetch(`${API}/borrow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify(form)
        });

        await readJson(res);

        Swal.fire("Borrowing Recorded", "The borrowing transaction was recorded successfully.", "success");
        loadTransactions();
        loadBooks();

    } catch (err) {
        Swal.fire("Record Borrowing Failed", apiError(err, "The borrowing transaction could not be recorded."), "error");
    }
}

async function returnTransaction(id) {
    const confirm = await Swal.fire({
        title: "Confirm Book Return",
        text: "This will mark the selected borrowing transaction as returned.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Return",
        confirmButtonColor: "#16a34a"
    });

    if (!confirm.isConfirmed) return;

    try {
        const res = await fetch(`${API}/return/${id}`, {
            method: "POST",
            headers: authHeaders()
        });

        await readJson(res);

        Swal.fire("Return Recorded", "The book return was recorded successfully.", "success");
        loadTransactions();
        loadBooks();

    } catch (err) {
        Swal.fire("Return Failed", apiError(err, "The book return could not be recorded."), "error");
    }
}
