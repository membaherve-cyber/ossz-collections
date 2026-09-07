@extends('layouts.admin')

@section('title', 'Order '.$order->order_number)

@section('content')
    @php $snapshot = $order->shipping_snapshot ?? []; @endphp

    <div class="grid" style="grid-template-columns:1.4fr 1fr;align-items:start">
        <div style="display:grid;gap:1rem">
            <div class="card" style="padding:1.5rem">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.8rem">
                    <div>
                        <h2 style="font-weight:400;font-size:1.1rem">{{ $order->order_number }}</h2>
                        <p style="font-size:.75rem;color:var(--muted)">{{ format_date_time($order->created_at) }}</p>
                    </div>
                    <span class="pill pill-blue">{{ status_label($order->status) }}</span>
                </div>

                <table class="table" style="margin-top:1rem">
                    <thead><tr><th>{{ is_fr() ? 'Pièce' : 'Piece' }}</th><th>{{ t('buy.size') }}</th><th>Qté</th><th>P.U.</th><th>{{ t('buy.total') }}</th></tr></thead>
                    <tbody>
                        @foreach ($order->items as $item)
                            <tr>
                                <td>
                                    @if ($item->product_slug)
                                        <a class="link-underline" href="{{ route('product.show', $item->product_slug) }}">{{ $item->product_name }}</a>
                                    @else
                                        {{ $item->product_name }}
                                    @endif
                                </td>
                                <td>{{ $item->variant_label }}</td>
                                <td>{{ $item->quantity }}</td>
                                <td>{{ format_xaf($item->unit_price) }}</td>
                                <td>{{ format_xaf($item->unit_price * $item->quantity) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <div style="max-width:280px;margin-left:auto;margin-top:1rem">
                    <div class="summary-row"><span>{{ t('cart.subtotal') }}</span><span>{{ format_xaf($order->subtotal) }}</span></div>
                    @if ($order->discount > 0)
                        <div class="summary-row" style="color:#3f9d63"><span>{{ t('cart.discount') }} {{ $order->coupon_code ? "({$order->coupon_code})" : '' }}</span><span>−{{ format_xaf($order->discount) }}</span></div>
                    @endif
                    <div class="summary-row"><span>{{ t('cart.deliveryEstimate') }}</span><span>{{ $order->delivery_fee == 0 ? t('cart.complimentary') : format_xaf($order->delivery_fee) }}</span></div>
                    <div class="summary-row total"><span>{{ t('cart.total') }}</span><span>{{ format_xaf($order->total) }}</span></div>
                </div>
            </div>

            <div class="card" style="padding:1.5rem">
                <h3 style="font-size:.9rem;font-weight:400">{{ is_fr() ? 'Historique des notifications' : 'Notification history' }}</h3>
                @forelse ($order->notifications as $n)
                    <div style="padding:.6rem 0;border-bottom:1px solid var(--line);font-size:.8rem">
                        <strong>{{ strtoupper($n->channel) }}</strong> → {{ $n->recipient }}
                        <span class="pill {{ $n->status === 'sent' ? 'pill-green' : ($n->status === 'failed' ? 'pill-red' : 'pill-yellow') }}">{{ $n->status }}</span>
                        <p style="color:var(--muted);font-size:.72rem;margin-top:.2rem">{{ format_date_time($n->created_at) }}</p>
                        <p style="white-space:pre-line;margin-top:.3rem;font-size:.75rem">{{ \Illuminate\Support\Str::limit($n->body, 200) }}</p>
                    </div>
                @empty
                    <p style="font-size:.8rem;color:var(--muted);margin-top:.6rem">{{ is_fr() ? 'Aucune notification.' : 'No notifications yet.' }}</p>
                @endforelse
            </div>
        </div>

        <div style="display:grid;gap:1rem">
            <div class="card" style="padding:1.5rem">
                <h3 style="font-size:.9rem;font-weight:400">{{ is_fr() ? 'Statut de la commande' : 'Order status' }}</h3>
                <form method="POST" action="{{ route('admin.orders.update-status', $order) }}" style="display:grid;gap:.6rem;margin-top:1rem">
                    @csrf
                    <select class="field" name="status">
                        @foreach (['placed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'returned', 'cancelled'] as $s)
                            <option value="{{ $s }}" @selected($order->status === $s)>{{ status_label($s) }}</option>
                        @endforeach
                    </select>
                    <button class="btn btn-primary btn-sm" type="submit">{{ is_fr() ? 'Mettre à jour et notifier' : 'Update & notify' }}</button>
                </form>

                <div style="margin-top:1.2rem;display:grid;gap:.5rem">
                    <a class="btn btn-secondary btn-sm" href="{{ route('admin.orders.packing-slip', $order) }}" target="_blank">{{ is_fr() ? 'Bordereau' : 'Packing slip' }} ↗</a>
                    @if ($order->guest_phone)
                        <a class="btn btn-secondary btn-sm" target="_blank" rel="noreferrer"
                           href="{{ \App\Support\wa_link($order->guest_phone, 'OSSZ Collections — order '.$order->order_number) }}">
                            WhatsApp {{ $order->guest_phone }} ↗
                        </a>
                    @endif
                </div>
            </div>

            <div class="card" style="padding:1.5rem">
                <h3 style="font-size:.9rem;font-weight:400">{{ is_fr() ? 'Client & livraison' : 'Customer & delivery' }}</h3>
                <p style="font-size:.85rem;margin-top:.8rem">
                    <strong>{{ $order->customer_name }}</strong><br>
                    {{ $order->guest_email }}<br>{{ $order->guest_phone }}
                </p>
                <p style="font-size:.8rem;color:var(--ink-soft);margin-top:.8rem;white-space:pre-line">
                    @if (is_array($snapshot))
                        {{ ($snapshot['street'] ?? '').' '.($snapshot['area'] ?? '') }}
                        {{ ($snapshot['city'] ?? '') }} — {{ $order->delivery_zone }}
                        @if (! empty($snapshot['notes']))
                            {{ "\n".$snapshot['notes'] }}
                        @endif
                    @endif
                </p>
                <p style="font-size:.75rem;color:var(--muted);margin-top:.6rem">
                    {{ delivery_label($order->delivery_method) }} · {{ payment_label($order->payment_method) }} · {{ status_label($order->payment_status) }}
                </p>
            </div>

            <div class="card" style="padding:1.5rem">
                <h3 style="font-size:.9rem;font-weight:400">{{ is_fr() ? 'Notes internes' : 'Internal notes' }}</h3>
                <form method="POST" action="{{ route('admin.orders.notes', $order) }}" style="margin-top:.8rem">
                    @csrf
                    <textarea class="field" name="notes" rows="3">{{ $order->notes }}</textarea>
                    <button class="btn btn-secondary btn-sm" style="margin-top:.6rem" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save' }}</button>
                </form>
            </div>
        </div>
    </div>
@endsection
