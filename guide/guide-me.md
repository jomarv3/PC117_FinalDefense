# Giya Sa Library Management System

Kini nga giya kay para makasabot ka unsaon paggamit sa system ug asa makita sa code ang matag feature. Ang project adunay duha ka bahin:

- `Backend`: Laravel API para sa login, users, books, borrowing transactions, reports, import/export, QR, ug notifications.
- `Frontend`: static HTML, CSS, ug JavaScript nga mo-consume sa Laravel API.

## Quick Start

### 0. I-setup ang local env files

Ayaw i-hardcode ang local IP or API key sa code. Kada developer dapat adunay kaugalingong local config:

```powershell
Copy-Item Backend/.env.example Backend/.env
Copy-Item Frontend/env.example.js Frontend/env.js
Copy-Item MobileApp/.env.example MobileApp/.env
```

Usba kini nga values depende sa imong machine:

- `Backend/.env`: `APP_URL` para sa backend URL nga mo-serve sa images ug QR codes. Kung gamiton sa phone/Expo Go, ibutang ang LAN IP, pananglitan `http://192.168.1.50:8000`.
- `Backend/.env`: `CORS_ALLOWED_ORIGINS` para sa frontend origins nga allowed mo-call sa API.
- `Backend/.env`: `MOBILE_API_KEY` para sa mobile API key.
- `Frontend/env.js`: `API_URL` para sa web dashboard API, pananglitan `http://127.0.0.1:8000/api`.
- `MobileApp/.env`: `EXPO_PUBLIC_API_URL` ug `EXPO_PUBLIC_LIBRARY_API_KEY`. Ang API key dapat pareho sa `Backend/.env` nga `MOBILE_API_KEY`.

Kung usbon ang `MobileApp/.env`, i-restart ang Expo gamit:

```powershell
npx expo start -c
```

### 1. Paandara ang backend

Adto sa `Backend` folder:

```bash
cd Backend
composer install
php artisan migrate --seed
composer run serve:lan
```

Ang frontend API URL gikan na sa local `Frontend/env.js`.

Code reference:

- `Frontend/js/shared/config.js:1` - diri gi-set ang API base URL.
- `Frontend/env.example.js:1` - example sa frontend local API config.
- `Backend/composer.json:43` - naa diri ang Laravel setup scripts.
- `Backend/composer.json:52` - naa diri ang `composer run dev` command kung gusto nimo usa ka command para server, queue, ug Vite.
- `Backend/config/cors.php:11` - CORS paths para sa API.
- `Backend/config/cors.php:15` - allowed frontend origin.

### 2. Ablihi ang frontend

Ablihi ang login page:

- `Frontend/index.html`

Kung gigamit nimo ang Herd/local domain, siguradua nga ang frontend origin match sa CORS config.

### 3. Sample accounts

Kung nag-run ka ug seeders, naa ni nga accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@library.com` | `password123` |
| Librarian | `librarian@library.com` | `password123` |
| Borrower | `borrower@library.com` | `password123` |

Code reference:

- `Backend/database/seeders/UserSeeder.php:13` - admin seed data.
- `Backend/database/seeders/UserSeeder.php:21` - librarian seed data.
- `Backend/database/seeders/UserSeeder.php:29` - borrower seed data.

## System Flow

### High-level nga dagan

1. User mo-login sa `Frontend/index.html`.
2. `Frontend/js/auth/login.js` mo-send sa login request ngadto sa `/api/login`.
3. `Backend/app/Http/Controllers/Api/AuthController.php` mo-check sa email/password ug mohatag ug Sanctum token.
4. Token ibutang sa `localStorage`.
5. `Frontend/dashboard.html` mo-load, dayon `Frontend/js/shared/auth.js` mangayo sa `/api/dashboard`.
6. Backend mo-return sa role ug allowed pages.
7. Frontend magpakita lang sa menu nga allowed para sa role.
8. Kada action sa dashboard mo-call ug API route sa `Backend/routes/api.php`.

Important code reference:

- `Frontend/index.html:22` - login/register form.
- `Frontend/js/auth/login.js:28` - form submit handler.
- `Frontend/js/auth/login.js:34` - mopili kung `/login` or `/register`.
- `Frontend/js/auth/login.js:44` - fetch request padulong sa API.
- `Frontend/js/auth/login.js:57` - kung login success, i-save ang session.
- `Frontend/js/shared/config.js:14` - `saveSession`.
- `Frontend/js/shared/config.js:20` - `clearSession`.
- `Frontend/js/shared/config.js:24` - session expiration check.
- `Frontend/js/shared/auth.js:24` - kuhaon ang dashboard access info.
- `Frontend/js/shared/auth.js:41` - gihimo ang navigation menu base sa allowed pages.
- `Backend/routes/api.php:12` - login route.
- `Backend/routes/api.php:17` - protected API group gamit ang Sanctum auth.
- `Backend/app/Http/Controllers/Api/AuthController.php:32` - login method.
- `Backend/app/Http/Controllers/Api/AuthController.php:40` - 8-hour token expiration.

## Roles Ug Permissions

### Admin

Ang admin maka-access sa:

- Dashboard
- Member Management
- Catalog Management
- Borrowing Management

Code reference:

- `Backend/app/Http/Controllers/Api/DashboardController.php:66` - allowed pages per role.
- `Backend/app/Http/Controllers/Api/DashboardController.php:67` - admin pages.
- `Backend/routes/api.php:24` - admin-only routes para users.
- `Backend/routes/api.php:33` - admin/librarian routes para books, reports, ug transactions.

### Librarian

Ang librarian maka-access sa:

- Dashboard
- Catalog Management
- Borrowing Management

Code reference:

- `Backend/app/Http/Controllers/Api/DashboardController.php:68` - librarian pages.
- `Backend/routes/api.php:33` - admin/librarian group.

### Borrower

Ang borrower maka-access sa:

- Dashboard
- Catalog browsing

Code reference:

- `Backend/app/Http/Controllers/Api/DashboardController.php:69` - borrower pages.
- `Backend/routes/api.php:21` - authenticated users maka-view sa books list.
- `Backend/app/Http/Controllers/Api/BookController.php:17` - borrower gets books without transaction history.
- `Frontend/js/sections/books.js:21` - frontend mo-check kung borrower.
- `Frontend/js/sections/books.js:44` - tagoan ang management actions kung borrower.
- `Frontend/js/sections/books.js:56` - borrower card view.

### Role middleware

Ang middleware maoy guard para dili maka-access ang wrong role.

Code reference:

- `Backend/bootstrap/app.php:17` - alias sa middleware.
- `Backend/bootstrap/app.php:19` - `role` middleware alias.
- `Backend/app/Http/Middleware/RoleMiddleware.php:10` - role checking entry point.
- `Backend/app/Http/Middleware/RoleMiddleware.php:12` - mo-return ug `403 Forbidden` kung dili allowed.

## Login Ug Registration

### Unsay buhaton sa user

1. Adto sa login page.
2. I-type ang email ug password.
3. Kung borrower pa lang, pindota ang "Create a borrower account".
4. Kung success ang login, dad-on ka sa dashboard.

Code reference:

- `Frontend/index.html:22` - auth form.
- `Frontend/index.html:30` - toggle para borrower registration.
- `Frontend/js/auth/login.js:16` - mo-switch tali sa login ug register mode.
- `Frontend/js/auth/login.js:34` - route selection `/login` or `/register`.
- `Frontend/js/auth/login.js:44` - API request.
- `Frontend/js/auth/login.js:57` - login success branch.
- `Frontend/js/auth/login.js:60` - register success branch.
- `Backend/routes/api.php:12` - `/api/login`.
- `Backend/routes/api.php:13` - `/api/register`.
- `Backend/app/Http/Controllers/Api/AuthController.php:14` - register method.
- `Backend/app/Http/Controllers/Api/AuthController.php:16` - register validation.
- `Backend/app/Http/Controllers/Api/AuthController.php:22` - create borrower user.
- `Backend/app/Http/Controllers/Api/AuthController.php:32` - login method.
- `Backend/app/Http/Controllers/Api/AuthController.php:36` - password check.
- `Backend/app/Http/Controllers/Api/AuthController.php:41` - create Sanctum token.

### Logout

Code reference:

- `Frontend/dashboard.html:27` - Sign Out button.
- `Frontend/js/app.js:1` - logout function.
- `Frontend/js/app.js:2` - POST `/logout`.
- `Backend/routes/api.php:18` - logout route.
- `Backend/app/Http/Controllers/Api/AuthController.php:50` - logout method.
- `Backend/app/Http/Controllers/Api/AuthController.php:52` - delete current token.

## Dashboard

### Unsay makita sa dashboard

Ang dashboard mo-display ug stats ug recent borrowing activity. Lahi ang stats depende sa role:

- Borrower: available catalog records, active borrowings, overdue books.
- Admin/Librarian: members, catalog records, borrowed books, overdue books.

Code reference:

- `Frontend/dashboard.html:32` - dashboard section.
- `Frontend/dashboard.html:34` - stats container.
- `Frontend/dashboard.html:39` - recent activity table.
- `Frontend/js/app.js:11` - `loadDashboard`.
- `Frontend/js/app.js:17` - fetch `/dashboard/summary`.
- `Frontend/js/app.js:22` - render dashboard cards.
- `Frontend/js/app.js:29` - recent transaction rows.
- `Backend/routes/api.php:19` - `/api/dashboard`.
- `Backend/routes/api.php:20` - `/api/dashboard/summary`.
- `Backend/app/Http/Controllers/Api/DashboardController.php:12` - basic dashboard info.
- `Backend/app/Http/Controllers/Api/DashboardController.php:23` - summary method.
- `Backend/app/Http/Controllers/Api/DashboardController.php:26` - transactions query.
- `Backend/app/Http/Controllers/Api/DashboardController.php:46` - stats method.
- `Backend/app/Http/Controllers/Api/DashboardController.php:48` - borrower-specific stats.
- `Backend/app/Http/Controllers/Api/DashboardController.php:56` - admin/librarian stats.

## Member Management

### Kinsa ang maka-access

Admin ra ang maka-manage sa users.

Code reference:

- `Backend/routes/api.php:24` - admin-only route group.
- `Backend/routes/api.php:25` - list users.
- `Backend/routes/api.php:26` - create user.
- `Backend/routes/api.php:27` - view user.
- `Backend/routes/api.php:28` - update user.
- `Backend/routes/api.php:29` - delete user.

### Unsay buhaton sa user

1. Login as admin.
2. Adto sa "Members".
3. Pindota ang "Add Member" para mohimo ug account.
4. Pindota ang "Edit" para usbon ang name/email/phone/password/role/photo.
5. Pindota ang "Delete" para tangtangon ang account.
6. Pwede sad mo-import, export, ug print member list.

Frontend code reference:

- `Frontend/dashboard.html:43` - users section.
- `Frontend/dashboard.html:46` - Add Member button.
- `Frontend/dashboard.html:47` - Import Members button.
- `Frontend/dashboard.html:48` - Export Members button.
- `Frontend/dashboard.html:49` - Print Member List button.
- `Frontend/js/sections/users.js:2` - load users from API.
- `Frontend/js/sections/users.js:20` - render users table rows.
- `Frontend/js/sections/users.js:41` - add user modal.
- `Frontend/js/sections/users.js:66` - frontend validation.
- `Frontend/js/sections/users.js:94` - POST `/users`.
- `Frontend/js/sections/users.js:111` - edit user function.
- `Frontend/js/sections/users.js:113` - GET `/users/{id}`.
- `Frontend/js/sections/users.js:173` - update user request.
- `Frontend/js/shared/delete.js:2` - shared delete function.
- `Frontend/js/shared/delete.js:15` - DELETE request.

Backend code reference:

- `Backend/app/Http/Controllers/Api/UserController.php:13` - list users.
- `Backend/app/Http/Controllers/Api/UserController.php:18` - list borrowers only.
- `Backend/app/Http/Controllers/Api/UserController.php:25` - create user.
- `Backend/app/Http/Controllers/Api/UserController.php:27` - user validation.
- `Backend/app/Http/Controllers/Api/UserController.php:38` - profile image upload.
- `Backend/app/Http/Controllers/Api/UserController.php:42` - create user record.
- `Backend/app/Http/Controllers/Api/UserController.php:57` - show one user.
- `Backend/app/Http/Controllers/Api/UserController.php:62` - update user.
- `Backend/app/Http/Controllers/Api/UserController.php:75` - replace profile image.
- `Backend/app/Http/Controllers/Api/UserController.php:83` - update fields.
- `Backend/app/Http/Controllers/Api/UserController.php:100` - delete user.
- `Backend/app/Http/Controllers/Api/UserController.php:104` - delete profile image.

Database/model reference:

- `Backend/database/migrations/0001_01_01_000000_create_users_table.php:14` - create users table.
- `Backend/database/migrations/0001_01_01_000000_create_users_table.php:16` - name column.
- `Backend/database/migrations/0001_01_01_000000_create_users_table.php:17` - unique email.
- `Backend/database/migrations/0001_01_01_000000_create_users_table.php:19` - role default borrower.
- `Backend/database/migrations/2026_04_29_000004_add_notifications_fields.php:11` - add phone column.
- `Backend/app/Models/User.php:14` - fillable user fields.
- `Backend/app/Models/User.php:23` - hidden password fields.
- `Backend/app/Models/User.php:30` - profile image URL accessor.

## Catalog / Book Management

### Kinsa ang maka-access

- Admin ug librarian: full management sa catalog.
- Borrower: view/search catalog ra.

Code reference:

- `Backend/routes/api.php:21` - list books para authenticated users.
- `Backend/routes/api.php:22` - view one book.
- `Backend/routes/api.php:40` - list categories.
- `Backend/routes/api.php:41` - create category.
- `Backend/routes/api.php:42` - create book.
- `Backend/routes/api.php:43` - update book.
- `Backend/routes/api.php:44` - delete book.

### Unsay buhaton sa admin/librarian

1. Adto sa "Catalog".
2. Pindota ang "Add Catalog Record".
3. Ibutang ang title, author, category, library reference number, optional ISBN, quantity, ug cover image.
4. Pwede i-edit, delete, tan-awon ang history, ug tan-awon ang QR code.
5. Pwede mag-manage categories.
6. Pwede mag-import/export/print inventory report.

Frontend code reference:

- `Frontend/dashboard.html:54` - books section.
- `Frontend/dashboard.html:57` - Add Catalog Record button.
- `Frontend/dashboard.html:58` - Manage Categories button.
- `Frontend/dashboard.html:59` - Import Catalog button.
- `Frontend/dashboard.html:60` - Export Catalog button.
- `Frontend/dashboard.html:61` - Print Inventory Report button.
- `Frontend/dashboard.html:64` - search input.
- `Frontend/dashboard.html:65` - sort dropdown.
- `Frontend/js/sections/books.js:4` - load books.
- `Frontend/js/sections/books.js:13` - render books.
- `Frontend/js/sections/books.js:23` - search/filter logic.
- `Frontend/js/sections/books.js:34` - sort logic.
- `Frontend/js/sections/books.js:61` - admin/librarian table.
- `Frontend/js/sections/books.js:95` - History button.
- `Frontend/js/sections/books.js:96` - QR button.
- `Frontend/js/sections/books.js:97` - Edit button.
- `Frontend/js/sections/books.js:98` - Delete button.
- `Frontend/js/sections/books.js:158` - add book modal.
- `Frontend/js/sections/books.js:222` - POST `/books`.
- `Frontend/js/sections/books.js:237` - edit book.
- `Frontend/js/sections/books.js:311` - update book request.
- `Frontend/js/sections/books.js:327` - view book borrowing history.
- `Frontend/js/sections/books.js:375` - view QR code.
- `Frontend/js/sections/books.js:401` - manage categories.
- `Frontend/js/sections/books.js:430` - POST `/categories`.

Backend code reference:

- `Backend/app/Http/Controllers/Api/BookController.php:15` - list books.
- `Backend/app/Http/Controllers/Api/BookController.php:17` - borrower response.
- `Backend/app/Http/Controllers/Api/BookController.php:21` - admin/librarian response with transactions.
- `Backend/app/Http/Controllers/Api/BookController.php:24` - list categories.
- `Backend/app/Http/Controllers/Api/BookController.php:42` - store category.
- `Backend/app/Http/Controllers/Api/BookController.php:59` - create book.
- `Backend/app/Http/Controllers/Api/BookController.php:61` - book validation.
- `Backend/app/Http/Controllers/Api/BookController.php:73` - image upload.
- `Backend/app/Http/Controllers/Api/BookController.php:82` - create book record.
- `Backend/app/Http/Controllers/Api/BookController.php:92` - generate QR after create.
- `Backend/app/Http/Controllers/Api/BookController.php:100` - show one book.
- `Backend/app/Http/Controllers/Api/BookController.php:115` - update book.
- `Backend/app/Http/Controllers/Api/BookController.php:124` - update validation.
- `Backend/app/Http/Controllers/Api/BookController.php:136` - replace uploaded image.
- `Backend/app/Http/Controllers/Api/BookController.php:144` - update fields.
- `Backend/app/Http/Controllers/Api/BookController.php:154` - regenerate QR after update.
- `Backend/app/Http/Controllers/Api/BookController.php:166` - delete book.
- `Backend/app/Http/Controllers/Api/BookController.php:174` - delete book image.
- `Backend/app/Http/Controllers/Api/BookController.php:178` - delete QR file.
- `Backend/app/Http/Controllers/Api/BookController.php:187` - QR generation helper.
- `Backend/app/Http/Controllers/Api/BookController.php:199` - QR uses book library reference number.

Database/model reference:

- `Backend/database/migrations/2026_04_07_075317_create_books_table.php:11` - create books table.
- `Backend/database/migrations/2026_04_07_075317_create_books_table.php:13` - title column.
- `Backend/database/migrations/2026_04_07_075317_create_books_table.php:14` - author column.
- `Backend/database/migrations/2026_04_07_075317_create_books_table.php:16` - unique library reference number.
- `Backend/database/migrations/2026_04_07_075317_create_books_table.php:17` - ISBN column.
- `Backend/database/migrations/2026_04_07_075317_create_books_table.php:18` - quantity column.
- `Backend/database/migrations/2026_04_07_075317_create_books_table.php:20` - QR code column.
- `Backend/database/migrations/2026_04_29_000002_create_categories_table.php:11` - create categories table.
- `Backend/app/Models/Book.php:14` - fillable book fields.
- `Backend/app/Models/Book.php:25` - appended computed fields.
- `Backend/app/Models/Book.php:27` - image URL accessor.
- `Backend/app/Models/Book.php:34` - QR URL accessor.
- `Backend/app/Models/Book.php:41` - book has many transactions.
- `Backend/app/Models/Book.php:46` - status accessor.
- `Backend/app/Models/Book.php:51` - available quantity accessor.

### Unsay makita sa borrower

Borrower makakita ug card view sa catalog, search, sort, status, available copies, category, library reference number, ug ISBN.

Code reference:

- `Frontend/js/sections/books.js:106` - borrower card renderer.
- `Frontend/js/sections/books.js:122` - card markup.
- `Frontend/js/sections/books.js:137` - library reference number display.
- `Frontend/js/sections/books.js:141` - ISBN display.
- `Frontend/js/sections/books.js:145` - available copies display.

## Borrowing Transactions

### Kinsa ang maka-access

Admin ug librarian ra ang maka-record, return, view, import/export, ug delete transactions.

Code reference:

- `Backend/routes/api.php:47` - borrow route.
- `Backend/routes/api.php:48` - return route.
- `Backend/routes/api.php:49` - list transactions.
- `Backend/routes/api.php:50` - create transaction alias.
- `Backend/routes/api.php:51` - delete transaction.

### Unsay buhaton sa user

1. Login as admin or librarian.
2. Adto sa "Borrowing".
3. Pindota ang "Record Borrowing".
4. Pilia ang borrower ug available catalog record.
5. System mo-create ug transaction with due date after 7 days.
6. Kung ibalik ang libro, pindota ang "Return".
7. Pwede mo-open ug receipt, export, import, print report, or delete transaction.

Frontend code reference:

- `Frontend/dashboard.html:78` - transactions section.
- `Frontend/dashboard.html:81` - Record Borrowing button.
- `Frontend/dashboard.html:82` - Import Transactions button.
- `Frontend/dashboard.html:83` - Export Transactions button.
- `Frontend/dashboard.html:84` - Print Transaction Report button.
- `Frontend/dashboard.html:87` - search input.
- `Frontend/dashboard.html:88` - sort dropdown.
- `Frontend/js/sections/transactions.js:4` - load transactions.
- `Frontend/js/sections/transactions.js:13` - render transactions.
- `Frontend/js/sections/transactions.js:19` - search/filter logic.
- `Frontend/js/sections/transactions.js:34` - sort logic.
- `Frontend/js/sections/transactions.js:64` - show Return button only when status is borrowed.
- `Frontend/js/sections/transactions.js:80` - receipt button.
- `Frontend/js/sections/transactions.js:93` - add transaction modal.
- `Frontend/js/sections/transactions.js:94` - load borrowers and books.
- `Frontend/js/sections/transactions.js:100` - only available books.
- `Frontend/js/sections/transactions.js:120` - borrowing modal.
- `Frontend/js/sections/transactions.js:209` - POST `/borrow`.
- `Frontend/js/sections/transactions.js:229` - return transaction.
- `Frontend/js/sections/transactions.js:242` - POST `/return/{id}`.

Backend code reference:

- `Backend/app/Http/Controllers/Api/TransactionController.php:12` - borrow method.
- `Backend/app/Http/Controllers/Api/TransactionController.php:14` - validate user and book.
- `Backend/app/Http/Controllers/Api/TransactionController.php:21` - block if no available copies.
- `Backend/app/Http/Controllers/Api/TransactionController.php:27` - check duplicate active borrowing.
- `Backend/app/Http/Controllers/Api/TransactionController.php:38` - create transaction.
- `Backend/app/Http/Controllers/Api/TransactionController.php:41` - borrow date.
- `Backend/app/Http/Controllers/Api/TransactionController.php:42` - due date after 7 days.
- `Backend/app/Http/Controllers/Api/TransactionController.php:47` - send borrow email.
- `Backend/app/Http/Controllers/Api/TransactionController.php:52` - store alias uses borrow.
- `Backend/app/Http/Controllers/Api/TransactionController.php:57` - return book method.
- `Backend/app/Http/Controllers/Api/TransactionController.php:61` - block double return.
- `Backend/app/Http/Controllers/Api/TransactionController.php:67` - mark returned.
- `Backend/app/Http/Controllers/Api/TransactionController.php:72` - send return email.
- `Backend/app/Http/Controllers/Api/TransactionController.php:77` - list transactions.
- `Backend/app/Http/Controllers/Api/TransactionController.php:82` - delete transaction.

Database/model reference:

- `Backend/database/migrations/2026_04_07_075631_create_transactions_table.php:11` - create transactions table.
- `Backend/database/migrations/2026_04_07_075631_create_transactions_table.php:13` - user foreign key.
- `Backend/database/migrations/2026_04_07_075631_create_transactions_table.php:14` - book foreign key.
- `Backend/database/migrations/2026_04_07_075631_create_transactions_table.php:15` - borrow date.
- `Backend/database/migrations/2026_04_07_075631_create_transactions_table.php:16` - return date.
- `Backend/database/migrations/2026_04_07_075631_create_transactions_table.php:17` - status.
- `Backend/database/migrations/2026_04_29_000004_add_notifications_fields.php:17` - add due date and notification columns.
- `Backend/app/Models/Transaction.php:14` - fillable transaction fields.
- `Backend/app/Models/Transaction.php:26` - transaction belongs to user.
- `Backend/app/Models/Transaction.php:30` - transaction belongs to book.

## Import, Export, Reports, Ug Receipts

### Import

Pwede mag-import ug Excel/CSV records para users, books, ug transactions.

Code reference:

- `Frontend/js/shared/config.js:159` - import records function.
- `Frontend/js/shared/config.js:176` - FormData file upload.
- `Frontend/js/shared/config.js:180` - POST `/import/{type}`.
- `Backend/routes/api.php:35` - import route.
- `Backend/app/Http/Controllers/Api/RecordController.php:37` - import method.
- `Backend/app/Http/Controllers/Api/RecordController.php:39` - file validation.
- `Backend/app/Http/Controllers/Api/RecordController.php:56` - Excel import.
- `Backend/app/Http/Controllers/Api/RecordController.php:64` - import books.
- `Backend/app/Http/Controllers/Api/RecordController.php:66` - import users.
- `Backend/app/Http/Controllers/Api/RecordController.php:68` - import transactions.
- `Backend/app/Http/Controllers/Api/RecordController.php:141` - import book helper.
- `Backend/app/Http/Controllers/Api/RecordController.php:159` - import user helper.
- `Backend/app/Http/Controllers/Api/RecordController.php:176` - import transaction helper.

### Export

Pwede mag-export ug Excel files.

Code reference:

- `Frontend/js/shared/config.js:127` - download blob helper.
- `Frontend/js/shared/config.js:151` - download file helper.
- `Backend/routes/api.php:34` - export route.
- `Backend/app/Http/Controllers/Api/RecordController.php:18` - export method.
- `Backend/app/Http/Controllers/Api/RecordController.php:20` - choose rows by type.
- `Backend/app/Http/Controllers/Api/RecordController.php:27` - Excel download.
- `Backend/app/Http/Controllers/Api/RecordController.php:99` - user rows.
- `Backend/app/Http/Controllers/Api/RecordController.php:110` - book rows.
- `Backend/app/Http/Controllers/Api/RecordController.php:121` - transaction rows.

### PDF reports

Pwede mag-print report para users, books, ug transactions.

Code reference:

- `Frontend/js/shared/config.js:98` - open blob helper.
- `Frontend/js/shared/config.js:145` - open report helper.
- `Backend/routes/api.php:36` - reports route.
- `Backend/app/Http/Controllers/Api/RecordController.php:78` - report method.
- `Backend/app/Http/Controllers/Api/RecordController.php:80` - choose report data by type.
- `Backend/app/Http/Controllers/Api/RecordController.php:87` - render PDF table.
- `Backend/resources/views/reports/table.blade.php:14` - report title.
- `Backend/resources/views/reports/table.blade.php:15` - report table.
- `Backend/resources/views/reports/table.blade.php:21` - report rows.

### Transaction receipt

Pwede mo-open ug PDF receipt per transaction.

Code reference:

- `Frontend/js/sections/transactions.js:80` - receipt button.
- `Backend/routes/api.php:37` - receipt route.
- `Backend/app/Http/Controllers/Api/RecordController.php:90` - receipt method.
- `Backend/app/Http/Controllers/Api/RecordController.php:92` - load transaction with user and book.
- `Backend/app/Http/Controllers/Api/RecordController.php:94` - render receipt PDF.
- `Backend/resources/views/reports/receipt.blade.php:13` - receipt title.
- `Backend/resources/views/reports/receipt.blade.php:14` - transaction ID.
- `Backend/resources/views/reports/receipt.blade.php:15` - member.
- `Backend/resources/views/reports/receipt.blade.php:16` - book title.
- `Backend/resources/views/reports/receipt.blade.php:18` - borrow date.
- `Backend/resources/views/reports/receipt.blade.php:19` - due date.
- `Backend/resources/views/reports/receipt.blade.php:20` - return date.
- `Backend/resources/views/reports/receipt.blade.php:21` - status.

## QR Codes

Ang QR code automatic ma-generate kada create or update sa catalog record. Ang QR value kay ang library reference number sa book.

Code reference:

- `Frontend/js/sections/books.js:96` - QR button.
- `Frontend/js/sections/books.js:375` - view QR code function.
- `Frontend/js/sections/books.js:383` - check kung naa ba QR URL.
- `Frontend/js/sections/books.js:388` - display QR modal.
- `Backend/app/Http/Controllers/Api/BookController.php:92` - generate QR after create.
- `Backend/app/Http/Controllers/Api/BookController.php:154` - regenerate QR after update.
- `Backend/app/Http/Controllers/Api/BookController.php:187` - QR helper.
- `Backend/app/Http/Controllers/Api/BookController.php:190` - QR filename.
- `Backend/app/Http/Controllers/Api/BookController.php:199` - QR generator.
- `Backend/app/Http/Controllers/Api/BookController.php:201` - QR content uses `$book->isbn`.
- `Backend/app/Models/Book.php:34` - QR URL accessor.

## Email, Due, Ug Overdue Notifications

### Borrow/return email

Kung naay email ang borrower, ang system mosend ug email kung:

- Na-record ang borrowing.
- Na-return ang book.

Code reference:

- `Backend/app/Http/Controllers/Api/TransactionController.php:47` - send borrowed email.
- `Backend/app/Http/Controllers/Api/TransactionController.php:72` - send returned email.
- `Backend/app/Http/Controllers/Api/TransactionController.php:92` - send mail helper.
- `Backend/app/Http/Controllers/Api/TransactionController.php:96` - email view.
- `Backend/app/Http/Controllers/Api/TransactionController.php:110` - mail subject helper.
- `Backend/resources/views/emails/transaction.blade.php:8` - borrowed message.
- `Backend/resources/views/emails/transaction.blade.php:11` - returned message.

### Due/overdue checker

Naay console command nga mo-check sa due ug overdue borrowed books. Daily siya gi-schedule.

Code reference:

- `Backend/app/Console/Commands/CheckOverdue.php:13` - command signature `app:check-overdue`.
- `Backend/app/Console/Commands/CheckOverdue.php:22` - fill missing due dates.
- `Backend/app/Console/Commands/CheckOverdue.php:28` - find due today transactions.
- `Backend/app/Console/Commands/CheckOverdue.php:34` - notify due transactions.
- `Backend/app/Console/Commands/CheckOverdue.php:39` - find overdue transactions.
- `Backend/app/Console/Commands/CheckOverdue.php:45` - mark overdue and notify.
- `Backend/app/Console/Commands/CheckOverdue.php:54` - notification helper.
- `Backend/app/Console/Commands/CheckOverdue.php:78` - SMS logging helper.
- `Backend/routes/console.php:11` - daily schedule.
- `Backend/resources/views/emails/transaction.blade.php:13` - due email message.
- `Backend/resources/views/emails/transaction.blade.php:15` - overdue email message.

## Shared Frontend Helpers

Kini nga file importante kay halos tanan frontend requests moagi sa shared helpers.

Code reference:

- `Frontend/js/shared/config.js:1` - API base URL.
- `Frontend/js/shared/config.js:7` - auth headers with Bearer token.
- `Frontend/js/shared/config.js:30` - safe JSON reader.
- `Frontend/js/shared/config.js:45` - SweetAlert validation message.
- `Frontend/js/shared/config.js:50` - email validation.
- `Frontend/js/shared/config.js:54` - image validation.
- `Frontend/js/shared/config.js:60` - optional ISBN validation.
- `Frontend/js/shared/config.js:64` - API error formatter.
- `Frontend/js/shared/config.js:72` - generate library reference number.
- `Frontend/js/shared/config.js:79` - get categories.
- `Frontend/js/shared/config.js:98` - open blob/PDF.
- `Frontend/js/shared/config.js:127` - download blob/Excel.
- `Frontend/js/shared/delete.js:2` - reusable delete flow.

## Database Tables

### `users`

Fields:

- `id`
- `name`
- `email`
- `phone`
- `password`
- `role`
- `profile_image`

Code reference:

- `Backend/database/migrations/0001_01_01_000000_create_users_table.php:14`
- `Backend/database/migrations/2026_04_29_000004_add_notifications_fields.php:11`
- `Backend/app/Models/User.php:14`

### `books`

Fields:

- `id`
- `title`
- `author`
- `category`
- `isbn` as library reference number
- `book_isbn` as optional ISBN
- `quantity`
- `image`
- `qr_code`

Code reference:

- `Backend/database/migrations/2026_04_07_075317_create_books_table.php:11`
- `Backend/database/migrations/2026_04_29_000001_add_category_to_books_table.php:15`
- `Backend/database/migrations/2026_04_29_000003_add_book_isbn_to_books_table.php:15`
- `Backend/app/Models/Book.php:14`

### `categories`

Fields:

- `id`
- `name`
- timestamps

Code reference:

- `Backend/database/migrations/2026_04_29_000002_create_categories_table.php:11`

### `transactions`

Fields:

- `id`
- `user_id`
- `book_id`
- `borrow_date`
- `due_date`
- `return_date`
- `status`
- `due_notified_at`
- `overdue_notified_at`

Code reference:

- `Backend/database/migrations/2026_04_07_075631_create_transactions_table.php:11`
- `Backend/database/migrations/2026_04_29_000004_add_notifications_fields.php:17`
- `Backend/app/Models/Transaction.php:14`

## API Routes Cheat Sheet

| Feature | Method/Endpoint | Controller |
| --- | --- | --- |
| Login | `POST /api/login` | `AuthController@login` |
| Register borrower | `POST /api/register` | `AuthController@register` |
| Logout | `POST /api/logout` | `AuthController@logout` |
| Dashboard access | `GET /api/dashboard` | `DashboardController@index` |
| Dashboard summary | `GET /api/dashboard/summary` | `DashboardController@summary` |
| List books | `GET /api/books` | `BookController@index` |
| View book | `GET /api/books/{id}` | `BookController@show` |
| Users CRUD | `/api/users` | `UserController` |
| Categories | `/api/categories` | `BookController` |
| Books CRUD | `/api/books` | `BookController` |
| Borrow | `POST /api/borrow` | `TransactionController@borrow` |
| Return | `POST /api/return/{id}` | `TransactionController@returnBook` |
| Transactions | `/api/transactions` | `TransactionController` |
| Export | `GET /api/export/{type}` | `RecordController@export` |
| Import | `POST /api/import/{type}` | `RecordController@import` |
| Report | `GET /api/reports/{type}` | `RecordController@report` |
| Receipt | `GET /api/transactions/{id}/receipt` | `RecordController@receipt` |

Main route file:

- `Backend/routes/api.php:12` - public auth routes start.
- `Backend/routes/api.php:17` - protected routes start.
- `Backend/routes/api.php:24` - admin-only routes start.
- `Backend/routes/api.php:33` - admin/librarian routes start.

## Common Flow Examples

### Example: Login to dashboard

1. User submits form.
2. Frontend sends `POST /api/login`.
3. Backend validates credentials.
4. Backend returns user, token, and expiration.
5. Frontend saves session.
6. Dashboard asks backend for allowed pages.
7. Frontend renders navigation based sa role.

Code path:

- `Frontend/js/auth/login.js:28`
- `Frontend/js/auth/login.js:44`
- `Backend/app/Http/Controllers/Api/AuthController.php:32`
- `Backend/app/Http/Controllers/Api/AuthController.php:41`
- `Frontend/js/shared/config.js:14`
- `Frontend/js/shared/auth.js:24`
- `Backend/app/Http/Controllers/Api/DashboardController.php:12`
- `Frontend/js/shared/auth.js:41`

### Example: Add catalog record

1. Admin/librarian clicks "Add Catalog Record".
2. Frontend opens modal.
3. Frontend validates fields.
4. Frontend sends `POST /api/books`.
5. Backend validates fields and image.
6. Backend saves book.
7. Backend generates QR.
8. Frontend reloads books list.

Code path:

- `Frontend/dashboard.html:57`
- `Frontend/js/sections/books.js:158`
- `Frontend/js/sections/books.js:187`
- `Frontend/js/sections/books.js:222`
- `Backend/routes/api.php:42`
- `Backend/app/Http/Controllers/Api/BookController.php:59`
- `Backend/app/Http/Controllers/Api/BookController.php:82`
- `Backend/app/Http/Controllers/Api/BookController.php:92`
- `Frontend/js/sections/books.js:231`

### Example: Record borrowing

1. Admin/librarian clicks "Record Borrowing".
2. Frontend loads borrowers and books.
3. Frontend filters only available books.
4. User selects borrower and book.
5. Frontend sends `POST /api/borrow`.
6. Backend checks availability.
7. Backend blocks duplicate active borrowing.
8. Backend creates transaction with 7-day due date.
9. Backend sends email.
10. Frontend reloads transactions and books.

Code path:

- `Frontend/dashboard.html:81`
- `Frontend/js/sections/transactions.js:93`
- `Frontend/js/sections/transactions.js:94`
- `Frontend/js/sections/transactions.js:100`
- `Frontend/js/sections/transactions.js:209`
- `Backend/routes/api.php:47`
- `Backend/app/Http/Controllers/Api/TransactionController.php:12`
- `Backend/app/Http/Controllers/Api/TransactionController.php:21`
- `Backend/app/Http/Controllers/Api/TransactionController.php:27`
- `Backend/app/Http/Controllers/Api/TransactionController.php:38`
- `Backend/app/Http/Controllers/Api/TransactionController.php:47`
- `Frontend/js/sections/transactions.js:221`

### Example: Return book

1. Admin/librarian clicks "Return".
2. Frontend confirms action.
3. Frontend sends `POST /api/return/{id}`.
4. Backend checks if already returned.
5. Backend sets return date and status returned.
6. Backend sends return email.
7. Frontend reloads transactions and books.

Code path:

- `Frontend/js/sections/transactions.js:64`
- `Frontend/js/sections/transactions.js:229`
- `Frontend/js/sections/transactions.js:242`
- `Backend/routes/api.php:48`
- `Backend/app/Http/Controllers/Api/TransactionController.php:57`
- `Backend/app/Http/Controllers/Api/TransactionController.php:61`
- `Backend/app/Http/Controllers/Api/TransactionController.php:67`
- `Backend/app/Http/Controllers/Api/TransactionController.php:72`
- `Frontend/js/sections/transactions.js:250`

## Tips Para Sa Pag-study Sa Code

- Sugdi sa `Backend/routes/api.php` para makita nimo unsa nga URL ang gigamit.
- Human ana, adto sa controller nga gi-link sa route.
- Tan-awa ang model kung gusto nimo mahibaw-an unsa nga fields ang allowed ug unsa nga relationships ang gigamit.
- Tan-awa ang migration kung gusto nimo makita ang database columns.
- Sa frontend, sugdi sa `dashboard.html` para makita ang UI sections, dayon adto sa corresponding file sa `Frontend/js/sections`.

Pinaka-importante nga files:

- `Backend/routes/api.php`
- `Backend/app/Http/Controllers/Api/AuthController.php`
- `Backend/app/Http/Controllers/Api/DashboardController.php`
- `Backend/app/Http/Controllers/Api/UserController.php`
- `Backend/app/Http/Controllers/Api/BookController.php`
- `Backend/app/Http/Controllers/Api/TransactionController.php`
- `Backend/app/Http/Controllers/Api/RecordController.php`
- `Frontend/js/shared/config.js`
- `Frontend/js/shared/auth.js`
- `Frontend/js/auth/login.js`
- `Frontend/js/app.js`
- `Frontend/js/sections/users.js`
- `Frontend/js/sections/books.js`
- `Frontend/js/sections/transactions.js`
