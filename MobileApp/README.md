# Library Scanner Mobile App

React Native Expo Go app for scanning library book QR codes and showing book details from the Laravel backend.

## Requirements

- Node.js and npm
- Expo Go app on a physical phone
- The Laravel backend running on a LAN-accessible IP or ngrok URL

## Setup

```bash
cd MobileApp
npm install
 npx expo install expo-router expo-camera expo-secure-store expo-linking expo-constants react-native-gesture-handler react-native-safe-area-context react-native-screens react-native-reanimated @expo/metro-runtime
```

## Environment Variables

Create a local `.env` file in `MobileApp/` based on `.env.example`.

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000/api
EXPO_PUBLIC_LIBRARY_API_KEY=change-me-local-mobile-key
```

The API key must match the Laravel backend `MOBILE_API_KEY`.

## Run With Expo Go

```bash
cd MobileApp
npx expo start
```

Then open the QR code in Expo Go on your phone.

## Backend URL

- If the backend is running locally, use your computer's LAN IP instead of `127.0.0.1`.
- Example: `http://192.168.1.50:8000/api`
- If needed, use ngrok and point `EXPO_PUBLIC_API_URL` to the tunnel URL.

## Seeded Accounts

- Admin: `admin@library.com` / `password123`
- Librarian: `librarian@library.com` / `password123`
- User: `borrower@library.com` / `password123`

## QR Scanning Notes

- The QR value is the library reference number stored in `books.isbn`.
- Scanning a valid QR code opens the book details screen.
- Admin and librarian accounts can see recent borrowing metadata.
- User accounts only see the basic book details.

## Troubleshooting

- If login fails, confirm the backend is reachable from your phone.
- If every request says the API key is invalid, check `MOBILE_API_KEY` on both sides.
- If the camera does not open, approve camera permissions in Expo Go.
- If book lookup fails, confirm the QR code content matches a `books.isbn` value.
