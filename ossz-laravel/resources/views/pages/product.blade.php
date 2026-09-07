<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $product->name ?? 'Product' }} - OSSZ Collections</title>
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

        .product-detail {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: calc(100vh - 80px);
        }
        .product-gallery {
            position: sticky;
            top: 0;
            height: 100vh;
        }
        .product-gallery img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .product-info {
            padding: 4rem 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .product-info .category {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #666;
            margin-bottom: 1rem;
        }
        .product-info h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 1rem;
        }
        .product-info .price {
            font-size: 1.5rem;
            margin-bottom: 2rem;
        }
        .product-info .description {
            font-size: 0.9rem;
            line-height: 1.8;
            color: #444;
            margin-bottom: 2rem;
        }
        .product-info .details {
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 2rem;
        }
        
        .size-selector {
            margin-bottom: 2rem;
        }
        .size-selector label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.75rem;
        }
        .sizes {
            display: flex;
            gap: 0.5rem;
        }
        .sizes button {
            padding: 0.75rem 1.25rem;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }
        .sizes button:hover,
        .sizes button.active {
            background: var(--ink);
            color: white;
            border-color: var(--ink);
        }
        
        .add-to-cart {
            display: flex;
            gap: 1rem;
        }
        .add-to-cart button {
            flex: 1;
            padding: 1rem;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-primary {
            background: var(--ink);
            color: white;
            border: none;
        }
        .btn-primary:hover {
            background: #333;
        }
        .btn-secondary {
            background: white;
            color: var(--ink);
            border: 1px solid var(--ink);
        }
        .btn-secondary:hover {
            background: var(--ink);
            color: white;
        }

        .product-meta {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e5e5;
        }
        .product-meta p {
            font-size: 0.8rem;
            color: #666;
            margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
            .product-detail {
                grid-template-columns: 1fr;
            }
            .product-gallery {
                height: 70vh;
                position: relative;
            }
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

    <div class="product-detail">
        <div class="product-gallery">
            <img src="{{ $product->images[0] ?? '/placeholder.webp' }}" alt="{{ $product->name ?? 'Product' }}">
        </div>
        <div class="product-info">
            <p class="category">{{ $product->category->name ?? 'Collection' }}</p>
            <h1>{{ $product->name ?? 'Product Name' }}</h1>
            <p class="price">{{ number_format($product->price ?? 0, 0, '.', ' ') }} XAF</p>
            <p class="description">{{ $product->description ?? 'Handcrafted with care in our Douala atelier.' }}</p>
            
            <div class="size-selector">
                <label>Select Size</label>
                <div class="sizes">
                    @foreach ($product->variants ?? [] as $variant)
                        <button type="button" 
                            onclick="selectSize(this, {{ $variant->id }})"
                            {{ $variant->stock <= 0 ? 'disabled' : '' }}>
                            {{ $variant->size }}
                        </button>
                    @endforeach
                </div>
            </div>

            <div class="add-to-cart">
                <button type="button" class="btn-primary" onclick="addToCart()">Add to Cart</button>
                <button type="button" class="btn-secondary" onclick="buyNow()">Buy Now</button>
            </div>

            <div class="product-meta">
                <p><strong>Care:</strong> {{ $product->care_instructions ?? 'Dry clean recommended. Store in a cool, dry place.' }}</p>
                <p><strong>Shipping:</strong> In-store pickup or national delivery across Cameroon (2-4 days)</p>
                <p><strong>Returns:</strong> Free alterations within 30 days of purchase</p>
            </div>
        </div>
    </div>

    <script>
        function selectSize(btn, variantId) {
            document.querySelectorAll('.sizes button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        function addToCart() {
            alert('Cart functionality will be connected to the Laravel backend.');
        }

        function buyNow() {
            alert('Buy now functionality will be connected to the Laravel backend.');
        }
    </script>
</body>
</html>
