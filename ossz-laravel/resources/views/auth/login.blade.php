<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - OSSZ Backoffice</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/poppins|300;400;500" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Poppins', sans-serif; 
            background: #1a1a1a; 
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            background: white;
            color: #1a1a1a;
            padding: 3rem;
            border-radius: 4px;
            width: 100%;
            max-width: 400px;
        }
        .logo {
            text-align: center;
            margin-bottom: 2rem;
        }
        .logo h1 {
            font-weight: 300;
            font-size: 1.5rem;
            letter-spacing: -0.02em;
        }
        .logo p {
            font-size: 0.75rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        .form-group label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #666;
            margin-bottom: 0.5rem;
        }
        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            font-family: inherit;
            font-size: 0.9rem;
        }
        .form-group input:focus {
            outline: none;
            border-color: #9b5f2f;
        }
        .btn {
            width: 100%;
            padding: 0.75rem;
            background: #1a1a1a;
            color: white;
            border: none;
            border-radius: 4px;
            font-family: inherit;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn:hover {
            background: #333;
        }
        .error {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            color: #c53030;
            padding: 0.75rem;
            border-radius: 4px;
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
        }
        .back {
            display: block;
            text-align: center;
            margin-top: 1.5rem;
            color: #666;
            text-decoration: none;
            font-size: 0.8rem;
        }
        .back:hover { color: #1a1a1a; }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="logo">
            <h1>OSSZ Collections</h1>
            <p>Backoffice</p>
        </div>

        @if ($errors->any())
            <div class="error">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('login') }}">
            @csrf
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" required>
            </div>

            <button type="submit" class="btn">Sign In</button>
        </form>

        <a href="/" class="back">← Back to Shop</a>
    </div>
</body>
</html>
