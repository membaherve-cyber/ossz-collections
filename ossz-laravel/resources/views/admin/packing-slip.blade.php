<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Packing slip — {{ $order->order_number }}</title>
    <link href="https://fonts.bunny.net/poppins?family=300;400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; color: #1b1917; padding: 2rem; }
        h1 { font-weight: 300; font-size: 1.4rem; }
        .head { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
        th { text-align: left; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: #8a8279; border-bottom: 1px solid #e6e7ea; padding: .5rem; }
        td { padding: .6rem .5rem; border-bottom: 1px solid #f0f0f2; font-size: .85rem; }
        .totals { margin-top: 1.5rem; margin-left: auto; width: 240px; font-size: .85rem; }
        .totals div { display: flex; justify-content: space-between; padding: .2rem 0; }
        .totals .grand { border-top: 1px solid #1b1917; font-weight: 500; margin-top: .4rem; padding-top: .5rem; }
    </style>
</head>
<body>
    <div class="head">
        <div>
            <h1>OSSZ Collections</h1>
            <p style="font-size:.8rem;color:#8a8279">{{ \App\Support\Settings::get('store_address') }}</p>
        </div>
        <div style="text-align:right">
            <h1>{{ $order->order_number }}</h1>
            <p style="font-size:.8rem;color:#8a8279">{{ \App\Support\format_date_time($order->created_at) }}</p>
        </div>
    </div>

    <p style="font-size:.9rem"><strong>{{ $order->customer_name }}</strong><br>
        {{ $order->guest_email }} · {{ $order->guest_phone }}</p>

    <table>
        <thead><tr><th>Piece</th><th>Variant</th><th>Qty</th></tr></thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr><td>{{ $item->product_name }}</td><td>{{ $item->variant_label }}</td><td>{{ $item->quantity }}</td></tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div><span>Subtotal</span><span>{{ format_xaf($order->subtotal) }}</span></div>
        @if ($order->discount > 0)<div><span>Discount</span><span>−{{ format_xaf($order->discount) }}</span></div>@endif
        <div><span>Delivery</span><span>{{ format_xaf($order->delivery_fee) }}</span></div>
        <div class="grand"><span>TOTAL</span><span>{{ format_xaf($order->total) }}</span></div>
    </div>
</body>
</html>
