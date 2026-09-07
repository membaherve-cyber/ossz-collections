<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $collection->name ?? 'Collection' }} - OSSZ Collections</title>
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

        .collection-hero {
            position: relative;
            height: 60vh;
            overflow: hidden;
        }
        .collection-hero img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .collection-hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(transparent 50%, rgba(0,0,0,0.7));
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 4rem;
            color: white;
        }
        .collection-hero-overlay .season {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            opacity: 0.8;
            margin-bottom: 0.5rem;
        }
        .collection-hero-overlay h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 3rem;
            font-weight: 300;
            margin-bottom: 1rem;
        }
        .collection-hero-overlay p {
            font-size: 1rem;
            max-width: 600px;
            line-height: 1.8;
            opacity: 0.9;
        }

        .products-section {
            padding: 4rem 3rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        .products-section h2 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.8rem;
            font-weight: 300;
            text-align: center;
            margin-bottom: 3rem;
        }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
        }
        .product-card {
            background: white;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        }
        .product-card .image {
            aspect-ratio: 3/4;
            overflow: hidden;
        }
        .product-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .product-card .info {
            padding: 1.25rem;
        }
        .product-card .info h3 {
            font-size: 0.95rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
        }
        .product-card .info .price {
            font-size: 1rem;
            font-weight: 500;
        }

        .footer {
            background: var(--ink);
            color: white;
            padding: 3rem;
            text-align: center;
        }
        .footer p { font-size: 0.75rem; opacity: 0.6; }

        @media (max-width: 768px) {
            .collection-hero-overlay { padding: 2rem; }
            .collection-hero-overlay h1 { font-size: 2rem; }
            .products-section { padding: 2rem 1rem; }
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

    <div class="collection-hero">
        <img src="{{ $collection->cover_image ?? '/collections/default.webp' }}" alt="{{ $collection->name ?? 'Collection' }}">
        <div class="collection-hero-overlay">
            <p class="season">{{ $collection->season ?? '' }}</p>
            <h1>{{ $collection->name ?? 'Collection' }}</h1>
            <p>{{ $collection->description ?? '' }}</p>
        </div>
    </div>

    <div class="products-section">
        <h2>From this Collection</h2>
        <div class="products-grid">
            @forelse ($products ?? [] as $product)
                <a href="/product/{{ $product->slug }}" class="product-card">
                    <div class="image">
                        <img src="{{ $product->images[0] ?? '/placeholder.webp' }}" alt="{{ $product->name }}">
                    </div>
                    <div class="info">
                        <h3>{{ $product->name }}</h3>
                        <p class="price">{{ number_format($product->price, 0, '.', ' ') }} XAF</p>
                    </div>
                </a>
            @empty
                <p style="grid-column: 1/-1; text-align: center; color: #666; padding: 3rem;">
                    Products from this collection will appear here.
                </p>
            @endforelse
        </div>
    </div>

    <footer class="footer">
        <p>© {{ date('Y') }} OSSZ Collections. All rights reserved.</p>
    </footer>
</body>
</html>
