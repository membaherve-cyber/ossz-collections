@extends('layouts.app')

@section('title', t('cart.title'))

@section('content')
    <div class="wrap cart-layout">
        <div>
            <h1 class="display" style="font-size:1.7rem">{{ t('cart.title') }}</h1>

            @if (count($cart['lines']) === 0)
                <div class="card" style="padding:3rem;text-align:center;margin-top:1.5rem">
                    <h2 class="display" style="font-size:1.2rem">{{ t('cart.empty') }}</h2>
                    <p style="margin-top:.6rem;font-size:.85rem;color:var(--ink-soft)">{{ t('cart.emptyBody') }}</p>
                    <a href="{{ route('shop') }}" class="btn btn-primary" style="margin-top:1.5rem">{{ t('cart.browse') }}</a>
                </div>
            @else
                <div style="margin-top:1rem">
                    @foreach ($cart['lines'] as $line)
                        <div class="cart-line">
                            @if ($line['image'])
                                <a href="{{ route('product.show', $line['slug']) }}"><img src="{{ $line['image'] }}" alt="{{ $line['name'] }}"></a>
                            @endif
                            <div style="flex:1">
                                <a class="link-underline" href="{{ route('product.show', $line['slug']) }}">{{ $line['name'] }}</a>
                                <p style="font-size:.75rem;color:var(--muted)">{{ $line['size'] }} · {{ $line['colour'] }}</p>
                                <form method="POST" action="{{ route('cart.update') }}" style="display:flex;gap:.5rem;align-items:center;margin-top:.5rem">
                                    @csrf
                                    <input type="hidden" name="item_id" value="{{ $line['itemId'] }}">
                                    <input class="field" style="width:70px;padding:.35rem .5rem" type="number" name="quantity"
                                           min="0" max="{{ max($line['stockQty'], $line['quantity']) }}" value="{{ $line['quantity'] }}">
                                    <button class="btn btn-ghost btn-sm" type="submit">{{ t('cart.apply') }}</button>
                                    <span style="font-size:.72rem;color:var(--muted)">{{ $line['stockQty'] > 0 ? t('buy.inStock') : t('buy.soldOut') }}</span>
                                </form>
                            </div>
                            <div style="text-align:right">
                                <p style="font-size:.9rem">{{ format_xaf($line['unitPrice'] * $line['quantity']) }}</p>
                                <form method="POST" action="{{ route('cart.remove') }}">
                                    @csrf
                                    <input type="hidden" name="item_id" value="{{ $line['itemId'] }}">
                                    <button class="btn btn-ghost btn-sm" type="submit">{{ t('cart.remove') }}</button>
                                </form>
                            </div>
                        </div>
                    @endforeach

                    <form method="POST" action="{{ route('cart.coupon') }}" style="display:flex;gap:.5rem;margin-top:1.2rem;max-width:380px">
                        @csrf
                        <input class="field" type="text" name="code" value="{{ $cart['couponCode'] }}" placeholder="{{ t('cart.coupon') }}">
                        <button class="btn btn-secondary btn-sm" type="submit">{{ t('cart.apply') }}</button>
                    </form>
                </div>
            @endif
        </div>

        @if (count($cart['lines']) > 0)
            <aside class="card summary" style="height:fit-content">
                <h2 class="display" style="font-size:1.2rem">{{ t('cart.summary') }}</h2>
                <div class="summary-row"><span>{{ t('cart.subtotal') }}</span><span>{{ format_xaf($cart['subtotal']) }}</span></div>
                @if ($cart['discount'] > 0)
                    <div class="summary-row" style="color:#3f9d63"><span>{{ t('cart.discount') }}</span><span>−{{ format_xaf($cart['discount']) }}</span></div>
                @endif
                <div class="summary-row"><span>{{ t('cart.deliveryEstimate') }}</span><span>{{ t('cart.complimentary') }}</span></div>
                <div class="summary-row"><span>{{ t('cart.vat') }}</span><span>{{ t('cart.vatIncluded') }}</span></div>
                <div class="summary-row total"><span>{{ t('cart.total') }}</span><span>{{ format_xaf($cart['subtotal'] - $cart['discount']) }}</span></div>

                <p style="font-size:.72rem;color:var(--muted);margin-top:1rem">{{ t('cart.freeAbove') }}</p>

                <div style="display:grid;gap:.6rem;margin-top:1.4rem">
                    <a href="{{ route('checkout.show') }}" class="btn btn-primary">{{ t('cart.checkoutAccount') }}</a>
                    <a href="{{ route('checkout.show') }}" class="btn btn-secondary">{{ t('cart.checkoutGuest') }}</a>
                    <p style="font-size:.7rem;color:var(--muted);text-align:center">{{ t('cart.guestNote') }}</p>
                </div>

                <a href="{{ route('shop') }}" class="btn btn-ghost btn-sm" style="margin-top:1rem">{{ t('cart.continue') }}</a>
            </aside>
        @endif
    </div>
@endsection
