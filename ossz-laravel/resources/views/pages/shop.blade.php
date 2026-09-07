<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop - OSSZ Collections</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/cormorant+garamond|300;400;500;600" rel="stylesheet">
    <link href="https://fonts.bunny.net/poppins|300;400;500;600" rel="stylesheet">
    <style>
        :root { --ink: #1a1a1a; --cream: #faf9f6; --gold: #b8860b; }
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
        .nav-center {
            display: flex;
            gap: 2rem;
            align-items: center;
        }

        .shop-header {
            text-align: center;
            padding: 4rem 2rem;
        }
        .shop-header p {
            font-size: 0.75rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 1rem;
        }
        .shop-header h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2.5rem;
            font-weight: 300;
        }

        .search-bar {
            max-width: 600px;
            margin: 0 auto 3rem;
            padding: 0 2rem;
        }
        .search-bar form {
            display: flex;
            background: white;
            border-radius: 100px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        .search-bar input {
            flex: 1;
            border: none;
            padding: 1rem 1.5rem;
            font-size: 0.9rem;
            background: transparent;
        }
        .search-bar input:focus { outline: none; }
        .search-bar button {
            background: var(--ink);
            color: white;
            border: none;
            padding: 1rem 2rem;
            cursor: pointer;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.1em;
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
            padding: 0 3rem 5rem;
            max-width: 1400px;
            margin: 0 auto;
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
            transition: transform 0.5s;
        }
        .product-card:hover img {
            transform: scale(1.05);
        }
        .product-card .info {
            padding: 1.5rem;
        }
        .product-card .info h3 {
            font-size: 0.95rem;
            font-weight: 500;
            margin-bottom: 0.25rem;
        }
        .product-card .info .category {
            font-size: 0.7rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.75rem;
        }
        .product-card .info .price {
            font-size: 1.1rem;
            font-weight: 500;
        }
        .product-card .quick-view {
            display: block;
            width: 100%;
            padding: 0.75rem;
            background: var(--ink);
            color: white;
            text-align: center;
            text-decoration: none;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .product-card:hover .quick-view { opacity: 1; }

        .footer {
            background: var(--ink);
            color: white;
            padding: 3rem;
            text-align: center;
        }
        .footer p {
            font-size: 0.75rem;
            opacity: 0.6;
        }

        @media (max-width: 768px) {
            .nav { padding: 1rem; }
            .products-grid { padding: 0 1rem 3rem; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <a href="/shop">Shop</a>
        <a href="/collections">Collections</a>
        <a href="/lookbook">Lookbook</a>
        <a href="/" style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;">OSSZ</a>
        <a href="/journal">Journal</a>
        <a href="/appointments">Appointments</a>
        <a href="/about">About</a>
    </nav>

    <!-- Header -->
    <div class="shop-header">
        <p>Curated for the modern connoisseur</p>
        <h1>Every piece, in one place</h1>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
        <form action="/shop" method="GET">
            <input type="text" name="q" placeholder="Search products..." value="{{ request('q') }}">
            <button type="submit">Search</button>
        </form>
    </div>

    <!-- Products -->
    <div class="products-grid">
        @forelse ($products ?? [] as $product)
            <div class="product-card">
                <div class="image">
                    <img src="{{ $product->images[0] ?? '/placeholder.webp' }}" alt="{{ $product->name }}">
                </div>
                <div class="info">
                    <p class="category">{{ $product->category->name ?? 'Uncategorized' }}</p>
                    <h3>{{ $product->name }}</h3>
                    <p class="price">{{ number_format($product->price, 0, '.', ' ') }} XAF</p>
                </div>
                <a href="#" class="quick-view">Quick View</a>
            </div>
        @empty
            <div style="grid-column: 1/-1; text-align: center; padding: 5rem 2rem;">
                <p style="color: #666;">No products found. Our collection is being curated.</p>
            </div>
        @endforelse
    </div>

    <!-- Footer -->
    <footer class="footer">
        <p>© {{ date('Y') }} OSSZ Collections. All rights reserved.</p>
    </footer>
</body>
</html>
