<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSSZ Collections | Bring Out The Class in You</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/cormorant+garamond|300;400;500;600" rel="stylesheet">
    <link href="https://fonts.bunny.net/poppins|300;400;500;600" rel="stylesheet">
    <style>
        :root {
            --ink: #1a1a1a;
            --cream: #faf9f6;
            --gold: #b8860b;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; color: var(--ink); background: var(--cream); }
        
        .hero {
            position: relative;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .hero-bg {
            position: absolute;
            inset: 0;
            background: url('/hero-bg.jpg') center/cover no-repeat;
            animation: heroZoom 28s ease-in-out infinite;
        }
        @keyframes heroZoom {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
        }
        .hero-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.4);
        }
        .hero-content {
            position: relative;
            text-align: center;
            color: white;
            z-index: 1;
        }
        .hero h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: clamp(2rem, 5vw, 4rem);
            font-weight: 300;
            letter-spacing: 0.1em;
            margin-bottom: 1rem;
        }
        .hero p {
            font-size: 1rem;
            font-weight: 300;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            opacity: 0.9;
        }
        .hero-cta {
            margin-top: 2rem;
        }
        .hero-cta a {
            display: inline-block;
            padding: 1rem 2rem;
            border: 1px solid white;
            color: white;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 0.85rem;
            transition: all 0.3s;
        }
        .hero-cta a:hover {
            background: white;
            color: var(--ink);
        }

        .nav {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 3rem;
        }
        .nav a {
            color: white;
            text-decoration: none;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.1em;
            font-weight: 400;
        }
        .nav-center {
            display: flex;
            gap: 2rem;
            align-items: center;
        }

        .services {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
            padding: 3rem 0;
            border-bottom: 1px solid #e5e5e5;
        }
        .service {
            text-align: center;
            padding: 1.5rem;
            border-right: 1px solid #e5e5e5;
        }
        .service:last-child { border-right: none; }
        .service h4 {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        .service p {
            font-size: 0.75rem;
            color: #666;
        }

        section {
            padding: 5rem 3rem;
        }
        .section-title {
            text-align: center;
            margin-bottom: 3rem;
        }
        .section-title h2 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 300;
        }

        .collections-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
        }
        .collection-card {
            aspect-ratio: 3/4;
            overflow: hidden;
            position: relative;
        }
        .collection-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s;
        }
        .collection-card:hover img {
            transform: scale(1.05);
        }
        .collection-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 2rem;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
            color: white;
        }
        .collection-info h3 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.5rem;
            font-weight: 300;
        }
        .collection-info p {
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            opacity: 0.8;
        }

        .footer {
            background: var(--ink);
            color: white;
            padding: 4rem 3rem 2rem;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
        }
        .footer h4 {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 1.5rem;
            opacity: 0.6;
        }
        .footer a {
            display: block;
            color: white;
            text-decoration: none;
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
            opacity: 0.8;
        }
        .footer a:hover { opacity: 1; }
        .footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 2rem;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            opacity: 0.6;
        }

        @media (max-width: 768px) {
            .services { grid-template-columns: 1fr 1fr; }
            .collections-grid { grid-template-columns: 1fr; }
            .footer-grid { grid-template-columns: 1fr 1fr; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <a href="/shop">Shop</a>
        <a href="/collections">Collections</a>
        <a href="/lookbook">Lookbook</a>
        <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: white;">
            OSSZ
        </div>
        <a href="/journal">Journal</a>
        <a href="/appointments">Appointments</a>
        <a href="/about">About</a>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <h1>Bring Out The Class in You</h1>
            <p>Révélez la classe en vous</p>
            <div class="hero-cta">
                <a href="/collections">Discover Our Collections</a>
            </div>
        </div>
    </section>

    <!-- Services Strip -->
    <div class="services">
        <div class="service">
            <h4>National Delivery</h4>
            <p>Shipped in 2–4 days across Cameroon</p>
        </div>
        <div class="service">
            <h4>Payment Options</h4>
            <p>MTN MoMo & Orange Money · Visa & Mastercard</p>
        </div>
        <div class="service">
            <h4>Complimentary Alterations</h4>
            <p>Within 30 days of purchase</p>
        </div>
        <div class="service">
            <h4>OSSZ Concierge</h4>
            <p>Chat with us, any time</p>
        </div>
    </div>

    <!-- Collections -->
    <section>
        <div class="section-title">
            <p style="font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.5rem;">Curated for the modern connoisseur</p>
            <h2>Our Collections</h2>
        </div>
        <div class="collections-grid">
            <a href="/collections/check-moves" class="collection-card">
                <img src="/collections/check-moves.webp" alt="Check Moves">
                <div class="collection-info">
                    <p>2023</p>
                    <h3>Check Moves</h3>
                </div>
            </a>
            <a href="/collections/freeme" class="collection-card">
                <img src="/collections/freeme.webp" alt="Freeme">
                <div class="collection-info">
                    <p>2021</p>
                    <h3>Freeme</h3>
                </div>
            </a>
            <a href="/collections/cultural-heritage" class="collection-card">
                <img src="/collections/cultural-heritage.webp" alt="Cultural Heritage">
                <div class="collection-info">
                    <p>2024</p>
                    <h3>Cultural Heritage</h3>
                </div>
            </a>
        </div>
        <div style="text-align: center; margin-top: 3rem;">
            <a href="/collections" style="color: var(--ink); text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.85rem; border-bottom: 1px solid var(--ink); padding-bottom: 0.25rem;">
                Discover Our Collections
            </a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-grid">
            <div>
                <h4>OSSZ</h4>
                <p style="font-size: 0.85rem; opacity: 0.8; line-height: 1.6;">
                    Limited-edition garments, masterfully tailored by people we know. Designed, cut, and finished entirely within our local Douala atelier.
                </p>
            </div>
            <div>
                <h4>Shop</h4>
                <a href="/shop">All Products</a>
                <a href="/collections">Collections</a>
                <a href="/lookbook">Lookbook</a>
            </div>
            <div>
                <h4>Information</h4>
                <a href="/about">About Us</a>
                <a href="/journal">Journal</a>
                <a href="/appointments">Book Appointment</a>
            </div>
            <div>
                <h4>Contact</h4>
                <a href="https://wa.me/237694068219">WhatsApp</a>
                <a href="mailto:info@osszcollection.com">Email Us</a>
                <a href="https://instagram.com/theossz__">Instagram</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>Ange Raphael, Douala, Cameroon</p>
            <p>© {{ date('Y') }} OSSZ Collections. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
