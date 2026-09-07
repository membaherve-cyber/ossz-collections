<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collections - OSSZ Collections</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/cormorant+garamond|300;400;500;600" rel="stylesheet">
    <link href="https://fonts.bunny.net/poppins|300;400;500;600" rel="stylesheet">
    <style>
        :root { --ink: #1a1a1a; --cream: #faf9f6; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; color: var(--ink); background: var(--cream); }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 3rem;
            border-bottom: 1px solid #e5e5e5;
        }
        .nav a {
            color: var(--ink);
            text-decoration: none;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.1em;
        }

        .hero {
            text-align: center;
            padding: 6rem 2rem 4rem;
        }
        .hero p {
            font-size: 0.75rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 1rem;
        }
        .hero h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 3rem;
            font-weight: 300;
        }

        .collections-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 2rem;
            padding: 0 3rem 5rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        .collection-card {
            position: relative;
            aspect-ratio: 3/4;
            overflow: hidden;
        }
        .collection-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s;
        }
        .collection-card:hover img {
            transform: scale(1.05);
        }
        .collection-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(transparent 40%, rgba(0,0,0,0.8));
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 2.5rem;
            color: white;
        }
        .collection-overlay .season {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            opacity: 0.8;
            margin-bottom: 0.5rem;
        }
        .collection-overlay h2 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 300;
            margin-bottom: 0.75rem;
        }
        .collection-overlay p {
            font-size: 0.85rem;
            line-height: 1.6;
            opacity: 0.9;
            margin-bottom: 1.5rem;
        }
        .collection-overlay a {
            display: inline-block;
            color: white;
            text-decoration: none;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-bottom: 1px solid white;
            padding-bottom: 0.25rem;
        }

        .footer {
            background: var(--ink);
            color: white;
            padding: 3rem;
            text-align: center;
        }
        .footer p { font-size: 0.75rem; opacity: 0.6; }

        @media (max-width: 768px) {
            .collections-grid { grid-template-columns: 1fr; padding: 0 1rem 3rem; }
        }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="/shop">Shop</a>
        <a href="/collections">Collections</a>
        <a href="/lookbook">Lookbook</a>
        <a href="/" style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;">OSSZ</a>
        <a href="/journal">Journal</a>
        <a href="/appointments">Appointments</a>
        <a href="/about">About</a>
    </nav>

    <div class="hero">
        <p>Our curated collections</p>
        <h1>Collections</h1>
    </div>

    <div class="collections-grid">
        @forelse ($collections ?? [] as $collection)
            <a href="/collections/{{ $collection->slug }}" class="collection-card">
                <img src="{{ $collection->cover_image }}" alt="{{ $collection->name }}">
                <div class="collection-overlay">
                    <p class="season">{{ $collection->season }}</p>
                    <h2>{{ $collection->name }}</h2>
                    <p>{{ Str::limit($collection->description, 120) }}</p>
                    <span>View the Collection →</span>
                </div>
            </a>
        @empty
            <div style="grid-column: 1/-1; text-align: center; padding: 5rem 2rem;">
                <p style="color: #666;">Collections coming soon.</p>
            </div>
        @endforelse
    </div>

    <footer class="footer">
        <p>© {{ date('Y') }} OSSZ Collections. All rights reserved.</p>
    </footer>
</body>
</html>
