@extends('layouts.app')

@section('title', $order ? "Order {$order->order_number}" : t('footer.trackLink'))

@section('content')
    <section class="wrap" style="padding:3rem 0;max-width:760px">
        <h1 class="display" style="font-size:1.6rem">
            {{ $order ? (is_fr() ? 'Commande' : 'Order').' '.$order->order_number : t('footer.trackLink') }}
        </h1>

        @if (! $order)
            <div class="card" style="padding:2rem;margin-top:1.5rem">
                <p style="font-size:.9rem;color:var(--ink-soft)">
                    {{ is_fr() ? 'Nous n\'avons pas trouvé cette commande. Vérifiez le numéro et réessayez.' : 'We could not find that order. Check the number and try again.' }}
                </p>
                <a class="btn btn-secondary btn-sm" style="margin-top:1rem" href="{{ route('order.lookup.form') }}">← {{ t('footer.trackLink') }}</a>
            </div>
        @elseif (! $matched)
            <div class="card" style="padding:2rem;margin-top:1.5rem">
                <p style="font-size:.9rem;color:var(--ink-soft)">
                    {{ is_fr()
                        ? 'Pour des raisons de confidentialité, confirmez l\'email ou le téléphone utilisé lors de la commande.'
                        : 'For privacy, please confirm the email or phone used when ordering.' }}
                </p>
                <form method="GET" action="{{ url('order/'.$order->order_number) }}" style="display:flex;gap:.6rem;margin-top:1rem;max-width:420px">
                    <input class="field" name="contact" required placeholder="email / {{ t('contact.wa') }}" value="{{ $contact }}">
                    <button class="btn btn-primary btn-sm" type="submit">{{ is_fr() ? 'Confirmer' : 'Confirm' }}</button>
                </form>
            </div>
        @else
            <div class="card" style="padding:1.8rem;margin-top:1.5rem">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem">
                    <div>
                        <p class="eyebrow">{{ status_label($order->status) }}</p>
                        <p style="font-size:.9rem;margin-top:.3rem">{{ $order->customer_name }}</p>
                        <p style="font-size:.75rem;color:var(--muted)">{{ format_date_time($order->created_at) }}</p>
                    </div>
                    <div style="text-align:right">
                        <p class="eyebrow">{{ t('cart.total') }}</p>
                        <p style="font-size:1.2rem">{{ format_xaf($order->total) }}</p>
                        <p style="font-size:.72rem;color:var(--muted)">{{ payment_label($order->payment_method) }} · {{ status_label($order->payment_status) }}</p>
                    </div>
                </div>

                {{-- Status timeline --}}
                <div style="display:flex;gap:.3rem;margin-top:1.8rem">
                    @php
                        $steps = ['placed', 'processing', 'ready', 'out_for_delivery', 'delivered'];
                        $idx = array_search($order->status, $steps, true);
                        $cancelled = in_array($order->status, ['cancelled', 'returned']);
                    @endphp
                    @foreach ($steps as $i => $step)
                        <div style="flex:1;text-align:center">
                            <div style="height:4px;border-radius:2px;background:{{ (! $cancelled && $i <= $idx) ? 'var(--accent)' : 'var(--line)' }}"></div>
                            <p style="font-size:.6rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-top:.35rem">{{ status_label($step) }}</p>
                        </div>
                    @endforeach
                </div>
                @if ($cancelled)
                    <p class="pill pill-red" style="margin-top:1rem">{{ status_label($order->status) }}</p>
                @endif
            </div>

            <div class="card" style="padding:1.5rem;margin-top:1rem">
                <p class="eyebrow">{{ is_fr() ? 'Articles' : 'Items' }}</p>
                @foreach ($items as $item)
                    <div style="display:flex;justify-content:space-between;gap:1rem;padding:.7rem 0;border-bottom:1px solid var(--line);font-size:.88rem">
                        <span>{{ $item->product_name }} <span style="color:var(--muted);font-size:.75rem">{{ $item->variant_label }} × {{ $item->quantity }}</span></span>
                        <span>{{ format_xaf($item->unit_price * $item->quantity) }}</span>
                    </div>
                @endforeach
                <div class="summary-row" style="margin-top:.8rem"><span>{{ t('cart.subtotal') }}</span><span>{{ format_xaf($order->subtotal) }}</span></div>
                @if ($order->discount > 0)
                    <div class="summary-row" style="color:#3f9d63"><span>{{ t('cart.discount') }}</span><span>−{{ format_xaf($order->discount) }}</span></div>
                @endif
                <div class="summary-row"><span>{{ t('cart.deliveryEstimate') }} — {{ delivery_label($order->delivery_method) }}</span><span>{{ $order->delivery_fee == 0 ? t('cart.complimentary') : format_xaf($order->delivery_fee) }}</span></div>
                <div class="summary-row total"><span>{{ t('cart.total') }}</span><span>{{ format_xaf($order->total) }}</span></div>
            </div>
        @endif
    </section>
@endsection
