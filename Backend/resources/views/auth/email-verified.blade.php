<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Email Verified</title>
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f8fafc;
            color: #0f172a;
            font-family: Arial, sans-serif;
        }

        main {
            width: min(92vw, 420px);
            padding: 28px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }

        h1 {
            margin: 0 0 10px;
            font-size: 24px;
            line-height: 1.2;
        }

        p {
            margin: 0;
            color: #475569;
            line-height: 1.55;
        }
    </style>
</head>
<body>
    <main>
        <h1>{{ $alreadyVerified ? 'Email already verified' : 'Email verified' }}</h1>
        <p>You can now sign in to the Library Management System.</p>
    </main>
</body>
</html>
