<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Order - OSSZ Collections</title>
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

        .track-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 4rem 2rem;
        }
        .track-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .track-header h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 0.5rem;
        }
        .track-header p {
            font-size: 0.9rem;
            color: #666;
        }

        .track-form {
            background: white;
            padding: 2rem;
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .track-form label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #666;
            margin-bottom: 0.5rem;
        }
        .track-form input {
            width: 100%;
            padding: 1rem;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            font-size: 1rem;
            margin-bottom: 1.5rem;
        }
        .track-form input:focus {
            outline: none;
            border-color: #b8860b;
        }
        .track-form button {
            width: 100%;
            padding: 1rem;
            background: var(--ink);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            cursor: pointer;
            transition: background 0.2s;
        }
        .track-form button:hover {
            background: #333;
        }

        .track-result {
            margin-top: 2rem;
            padding: 2rem;
            background: white;
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            display: none;
        }
        .track-result h3 {
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        .track-result .status {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 500;
            margin-bottom: 1rem;
        }
        .track-result .status.placed { background: #e3f2fd; color: #1565c0; }
        .track-result .status.processing { background: #fff3e0; color: #e65100; }
        .track-result .status.ready_for_pickup { background: #e8f5e9; color: #2e7d32; }
        .track-result .status.delivered { background: #e8f5e9; color: #1b5e20; }

        .track-result .timeline {
            margin-top: 1.5rem;
            border-left: 2px solid #e5e5e5;
            padding-left: 1.5rem;
        }
        .track-result .timeline .step {
            position: relative;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
        }
        .track-result .timeline .step::before {
            content: '';
            position: absolute;
            left: -1.75rem;
            top: 0.25rem;
            width: 10px;
            height: 10px;
            background: #e5e5e5;
            border-radius: 50%;
        }
        .track-result .timeline .step.active::before {
            background: var(--ink);
        }
        .track-result .timeline .step h4 {
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
        }
        .track-result .timeline .step p {
            font-size: 0.75rem;
            color: #666;
        }

        .footer {
            background: var(--ink);
            color: white;
            padding: 3rem;
            text-align: center;
            margin-top: 4rem;
        }
        .footer p { font-size: 0.75rem; opacity: 0.6; }
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

    <div class="track-container">
        <div class="track-header">
            <h1>Track Your Order</h1>
            <p>Enter your order number to see the current status</p>
        </div>

        <div class="track-form">
            <label for="orderNumber">Order Number</label>
            <input type="text" 
                id="orderNumber" 
                placeholder="e.g., OSZ-001"
                value="{{ $number ?? '' }}">
            <button type="button" onclick="trackOrder()">Track Order</button>
        </div>

        <div class="track-result" id="trackResult">
            <h3>Order {{ $number ?? '' }}</h3>
            <div class="status" id="orderStatus">Placed</div>
            
            <div class="timeline">
                <div class="step active">
                    <h4>Order Placed</h4>
                    <p>Your order has been received</p>
                </div>
                <div class="step active">
                    <h4>Processing</h4>
                    <p>We're preparing your order</p>
                </div>
                <div class="step">
                    <h4>Ready for Pickup</h4>
                    <p>Your order is ready at our boutique</p>
                </div>
                <div class="step">
                    <h4>Delivered</h4>
                    <p>Thank you for shopping with OSSZ!</p>
                </div>
            </div>
        </div>
    </div>

    <footer class="footer">
        <p>© {{ date('Y') }} OSSZ Collections. All rights reserved.</p>
    </footer>

    <script>
        function trackOrder() {
            const orderNumber = document.getElementById('orderNumber').value.trim();
            if (!orderNumber) {
                alert('Please enter your order number');
                return;
            }
            
            // Fetch order status from API
            fetch(`/api/orders/${orderNumber}/status`)
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        document.getElementById('trackResult').style.display = 'block';
                        document.getElementById('orderStatus').textContent = data.status;
                        document.getElementById('orderStatus').className = 'status ' + data.status;
                    } else {
                        alert('Order not found. Please check your order number.');
                    }
                })
                .catch(err => {
                    alert('Error tracking order. Please try again.');
                });
        }
    </script>
</body>
</html>
