/* ================= DELETE ================= */
async function deleteItem(type, id) {
    const confirm = await Swal.fire({
        title: "Delete Record",
        text: "This action is permanent and cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#ef4444"
    });

    if (!confirm.isConfirmed) return;

    try {
        const res = await fetch(`${API}/${type}/${id}`, {
            method: "DELETE",
            headers: authHeaders()
        });

        await readJson(res);

        Swal.fire("Record Deleted", "The selected record was deleted successfully.", "success");

        if (type === "users") loadUsers();
        if (type === "books") loadBooks();
        if (type === "transactions") {
            loadTransactions();
            loadBooks();
        }

    } catch (err) {
        Swal.fire("Delete Failed", apiError(err, "The selected record could not be deleted."), "error");
    }
}
