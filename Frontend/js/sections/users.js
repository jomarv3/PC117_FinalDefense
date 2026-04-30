/* ================= USERS ================= */
async function loadUsers() {
    const res = await fetch(`${API}/users`, {
        headers: authHeaders()
    });

    const data = await readJson(res);

    let html = `
    <tr>
        <th>ID</th>
        <th>Profile Photo</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>System Role</th>
        <th>Action</th>
    </tr>`;

    data.forEach(u => {
        html += `
        <tr>
            <td>${u.id}</td>
            <td>
                <img src="${u.profile_image_url ? u.profile_image_url : noUserImage}" width="50" height="50" style="border-radius:50%">
            </td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.phone ?? '-'}</td>
            <td>${u.role}</td>
            <td>
                <button class="action-btn edit" onclick="editUser(${u.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteItem('users',${u.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("usersTable").innerHTML = html;
}
/* ADD USER */
async function addUser() {
    const { value: form } = await Swal.fire({
        title: "Add Member Account",
        html: `
        <input id="name" class="swal2-input" placeholder="Full name">
        <input id="email" class="swal2-input" placeholder="Email address">
        <input id="phone" class="swal2-input" placeholder="Phone number">
        <input id="password" class="swal2-input" placeholder="Password">

        <select id="role" class="swal2-input">
            <option value="admin">Admin</option>
            <option value="librarian">Librarian</option>
            <option value="borrower">Borrower</option>
        </select>

        <input type="file" id="image" class="swal2-input" title="Profile photo">
        `,
        preConfirm: () => {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;
            const image = document.getElementById("image").files[0] || null;

            if (!name) return showFormError("Full name is required");
            if (!email || !validEmail(email)) return showFormError("A valid email address is required");
            if (!password || password.length < 6) return showFormError("Password must be at least 6 characters");
            if (!role) return showFormError("System role is required");
            if (!validateImage(image)) return showFormError("Profile photo must be a JPG or PNG file");

            return {
                name,
                email,
                phone,
                password,
                role,
                image
            };
        }
    });

    if (!form) return;

    let fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("password", form.password);
    fd.append("role", form.role);
    if (form.image) fd.append("profile_image", form.image);

    try {
        const res = await fetch(`${API}/users`, {
            method: "POST",
            headers: authHeaders(),
            body: fd
        });

        await readJson(res);

        Swal.fire("Member Created", "The member account was created successfully.", "success");
        loadUsers();

    } catch (err) {
        Swal.fire("Create Member Failed", apiError(err, "The member account could not be created."), "error");
    }
}

/* EDIT USER */
window.editUser = async function(id) {

    const res = await fetch(`${API}/users/${id}`, {
        headers: authHeaders()
    });

    const u = await readJson(res);

    const { value: form } = await Swal.fire({
        title: "Edit Member Account",
        html: `
        <input id="name" class="swal2-input" value="${u.name}" placeholder="Full name">
        <input id="email" class="swal2-input" value="${u.email}" placeholder="Email address">
        <input id="phone" class="swal2-input" value="${u.phone ?? ""}" placeholder="Phone number">
        <input id="password" class="swal2-input" placeholder="New Password (optional)">

        <select id="role" class="swal2-input">
            <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
            <option value="librarian" ${u.role === "librarian" ? "selected" : ""}>Librarian</option>
            <option value="borrower" ${u.role === "borrower" ? "selected" : ""}>Borrower</option>
        </select>

        <input type="file" id="image" class="swal2-input" title="Profile photo">
        `,
        preConfirm: () => {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;
            const image = document.getElementById("image").files[0] || null;

            if (!name) return showFormError("Full name is required");
            if (!email || !validEmail(email)) return showFormError("A valid email address is required");
            if (password && password.length < 6) return showFormError("Password must be at least 6 characters");
            if (!role) return showFormError("System role is required");
            if (!validateImage(image)) return showFormError("Profile photo must be a JPG or PNG file");

            return {
                name,
                email,
                phone,
                password,
                role,
                image
            };
        }
    });

    if (!form) return;

    let fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("role", form.role);

    fd.append("_method", "PUT");
    if (form.password) fd.append("password", form.password);
    if (form.image) fd.append("profile_image", form.image);

    try {
        const res = await fetch(`${API}/users/${id}`, {
            method: "POST",
            headers: authHeaders(),
            body: fd
        });

        await readJson(res);

        Swal.fire("Member Updated", "The member account was updated successfully.", "success");
        loadUsers();

    } catch (err) {
        Swal.fire("Update Member Failed", apiError(err, "The member account could not be updated."), "error");
    }
};
