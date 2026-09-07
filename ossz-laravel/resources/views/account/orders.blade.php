@extends('layouts.account')

@section('account')
    <div class="card" style="padding:1.5rem">
        <h2 class="display" style="font-size:1.2rem">{{ is_fr() ? 'Toutes mes commandes' : 'All my orders' }}</h2>
        @forelse ($orders as $order)
            <div style="padding:1rem 0;border-bottom:1px solid var(--line)">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
                    <div>
                        <strong style="font-size:.9rem">{{ $order->order_number }}</strong>
                        <span class="pill pill-gray" style="margin-left:.5rem">{{ status_label($order->status) }}</span>
                        <p style="font-size:.72rem;color:var(--muted);margin-top:.2rem">{{ format_date_time($order->created_at) }} · {{ payment_label($order->payment_method) }}</p>
                    </div>
                    <div style="text-align:right">
                        <p style="font-size:.95rem">{{ format_xaf($order->total) }}</p>
                        <a class="link-underline" style="font-size:.75rem" href="{{ route('order.track', ['number' => $order->order_number, 'contact' => $order->guest_email ?: $order->guest_phone]) }}">
                            {{ t('footer.trackLink') }}
                        </a>
                    </div>
                </div>
                <ul style="list-style:none;margin-top:.5rem;font-size:.8rem;color:var(--ink-soft)">
                    @foreach ($order->items as $item)
                        <li>{{ $item->product_name }} ({{ $item->variant_label }}) × {{ $item->quantity }}</li>
                    @endforeach
                </ul>
            </div>
        @empty
            <p style="margin-top:1rem;font-size:.85rem;color:var(--muted)">{{ is_fr() ? 'Aucune commande pour le moment.' : 'No orders yet.' }}</p>
        @endforelse
    </div>
@endsection
