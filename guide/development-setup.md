# Development Setup

Use this when another developer clones the project and wants to run the Laravel backend, web frontend, and Expo mobile app locally.

## Requirements

- PHP 8.3 or newer
- Composer
- Node.js and npm
- MySQL or MariaDB
- Expo Go installed on a physical phone, if testing the mobile scanner
- A shared Wi-Fi network for the computer and phone, if using Expo Go with the local backend

## 1. Clone And Install Dependencies

```bash
git clone <repo-url>
cd library-management
```

Install the backend dependencies:

```bash
cd Backend
composer install
npm install
```

Install the mobile app dependencies:

```bash
cd ../MobileApp
npm install
```

## 2. Copy Local Env Files

From the project root:

```bash
cp Backend/.env.example Backend/.env
cp Frontend/env.example.js Frontend/env.js
cp MobileApp/.env.example MobileApp/.env
```

On Windows PowerShell:

```powershell
Copy-Item Backend/.env.example Backend/.env
Copy-Item Frontend/env.example.js Frontend/env.js
Copy-Item MobileApp/.env.example MobileApp/.env
```

These copied files are local machine settings. Do not commit the copied env files.

## 3. Configure Laravel

Edit `Backend/.env`.

For web-only development on the same computer:

```env
APP_URL=http://127.0.0.1:8000
```

For Expo Go or another device on the same Wi-Fi, use the computer's LAN IP:

```env
APP_URL=http://YOUR_LOCAL_IP:8000
```

Example:

```env
APP_URL=http://192.168.1.50:8000
```

Set the mobile API key:

```env
MOBILE_API_KEY=change-me-local-mobile-key
```

For a real local setup, generate a unique key instead of reusing someone else's. Any long random string works.

PowerShell:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

macOS/Linux:

```bash
openssl rand -base64 32
```

Put the generated value in both places:

```env
Backend/.env: MOBILE_API_KEY=<generated-value>
MobileApp/.env: EXPO_PUBLIC_LIBRARY_API_KEY=<generated-value>
```

Set the database credentials for the local machine:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=Libray_Management
DB_USERNAME=root
DB_PASSWORD=root
```

Create the database manually in MySQL if it does not exist yet. The default database name in this repo is `Libray_Management`.

For email verification and notification testing with Mailtrap, set the Laravel mailer to SMTP:

```env
MAIL_MAILER=smtp
MAIL_HOST=<mailtrap-host>
MAIL_PORT=2525
MAIL_USERNAME=<mailtrap-username>
MAIL_PASSWORD=<mailtrap-password>
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME="Library Management"
```

For SMS testing with Twilio, add these values:

```env
TWILIO_ACCOUNT_SID=<twilio-account-sid>
TWILIO_AUTH_TOKEN=<twilio-auth-token>
TWILIO_FROM_NUMBER=<twilio-phone-number>
```

After changing mail or Twilio settings, clear cached Laravel config:

```bash
cd Backend
php artisan config:clear
```

Generate the app key and run migrations:

```bash
cd Backend
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

## 4. Configure The Web Frontend

Edit `Frontend/env.js`.

If the browser and backend are on the same computer:

```js
window.LIBRARY_CONFIG = {
    API_URL: "http://127.0.0.1:8000/api"
};
```

If the web frontend is opened from another device, use the backend computer's LAN IP:

```js
window.LIBRARY_CONFIG = {
    API_URL: "http://YOUR_LOCAL_IP:8000/api"
};
```

## 5. Configure The Mobile App

Edit `MobileApp/.env`.

Use the computer's LAN IP, not `127.0.0.1`, when running on a phone:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000/api
EXPO_PUBLIC_LIBRARY_API_KEY=change-me-local-mobile-key
```

`EXPO_PUBLIC_LIBRARY_API_KEY` must match `MOBILE_API_KEY` in `Backend/.env`.

After changing `MobileApp/.env`, restart Expo with a cleared cache:

```bash
cd MobileApp
npx expo start -c
```

## 6. Start The Backend

For web-only development on the same computer:

```bash
cd Backend
php artisan serve --host=127.0.0.1 --port=8000
```

For mobile development with Expo Go, the backend must listen on the LAN:

```bash
cd Backend
composer run serve:lan
```

That command runs the backend on:

```text
http://0.0.0.0:8000
```

Other devices should access it through the computer's LAN IP, for example:

```text
http://192.168.1.50:8000
```

To run due and overdue email/SMS notifications locally, keep the scheduler running in another terminal:

```bash
cd Backend
php artisan schedule:work
```

## 7. Open The Web Frontend

Open:

```text
Frontend/index.html
```

If using a local domain such as `frontend.test`, make sure it is included in `CORS_ALLOWED_ORIGINS` in `Backend/.env`.

## 8. Start The Mobile App

```bash
cd MobileApp
npx expo start
```

Scan the QR code using Expo Go.

## Seeded Accounts

After `php artisan migrate --seed`, these accounts are available:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@library.com` | `password123` |
| Librarian | `librarian@library.com` | `password123` |
| Borrower | `borrower@library.com` | `password123` |

## Common Problems

### Mobile Login Says Network Request Failed

Check these first:

- `Backend/.env` has `APP_URL=http://YOUR_LOCAL_IP:8000`.
- `MobileApp/.env` has `EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000/api`.
- Laravel was started with `composer run serve:lan`.
- The phone and computer are on the same Wi-Fi.
- Firewall allows port `8000`.
- The URL `http://YOUR_LOCAL_IP:8000/api/mobile/login` is reachable from the phone browser.

### Mobile Requests Say The API Key Is Invalid

Make sure these two values match exactly:

```env
Backend/.env: MOBILE_API_KEY
MobileApp/.env: EXPO_PUBLIC_LIBRARY_API_KEY
```

Restart Expo after changing the mobile env file:

```bash
npx expo start -c
```

### Images Or QR Codes Do Not Load On The Phone

Use the LAN IP in `Backend/.env`:

```env
APP_URL=http://YOUR_LOCAL_IP:8000
```

Then clear Laravel config if needed:

```bash
cd Backend
php artisan config:clear
```

### Web Frontend Cannot Reach The API

Check `Frontend/env.js`:

```js
window.LIBRARY_CONFIG = {
    API_URL: "http://127.0.0.1:8000/api"
};
```

If using a different host or port, update `CORS_ALLOWED_ORIGINS` in `Backend/.env`.

## Quick Checklist

Before asking why it does not work, confirm:

- `Backend/.env` exists.
- `Frontend/env.js` exists.
- `MobileApp/.env` exists.
- `php artisan key:generate` was run.
- The database exists and migrations were seeded.
- Backend is running on port `8000`.
- Mobile uses LAN IP, not `127.0.0.1`.
- Mobile API key matches backend API key.
- Expo was restarted after `.env` changes.
