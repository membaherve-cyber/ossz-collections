@extends('layouts.app')

@section('title', t('checkout.title'))

@section('content')
    @php $user = \App\Models\User::find(session('user_id')); @endphp

    <div class="wrap cart-layout">
        <div>
            <h1 class="display" style="font-size:1.7rem">{{ t('checkout.title') }}</h1>
            @if (! $user)
                <p style="font-size:.78rem;color:var(--muted);margin-top:.4rem">{{ t('checkout.guestBanner') }}</p>
            @endif

            <form method="POST" action="{{ route('checkout.place') }}" class="form-grid" style="margin-top:1.5rem">
                @csrf

                <fieldset class="card" style="padding:1.5rem;border:1px solid var(--line)">
                    <legend class="eyebrow">{{ t('checkout.confirmAddress') }}</legend>
                    <p style="font-size:.75rem;color:var(--muted);margin-bottom:1rem">{{ t('checkout.confirmAddressBody') }}</p>

                    <div class="form-grid cols-2">
                        <div>
                            <label class="label" for="customerName">{{ is_fr() ? 'Nom complet' : 'Full name' }} *</label>
                            <input class="field" id="customerName" name="customerName" required
                                   value="{{ old('customerName', $user->full_name ?? '') }}">
                        </div>
                        <div>
                            <label class="label" for="phone">{{ t('contact.wa') }} / {{ is_fr() ? 'Téléphone' : 'Phone' }}</label>
                            <input class="field" id="phone" name="phone" value="{{ old('phone', $user->phone ?? '') }}">
                        </div>
                        <div>
                            <label class="label" for="email">Email</label>
                            <input class="field" id="email" type="email" name="email" value="{{ old('email', $user->email ?? '') }}">
                        </div>
                        <div>
                            <label class="label" for="city">{{ is_fr() ? 'Ville' : 'City' }}</label>
                            <input class="field" id="city" name="city" value="{{ old('city', 'Douala') }}">
                        </div>
                        <div>
                            <label class="label" for="area">{{ is_fr() ? 'Quartier' : 'Area' }}</label>
                            <input class="field" id="area" name="area" value="{{ old('area') }}">
                        </div>
                        <div>
                            <label class="label" for="street">{{ is_fr() ? 'Rue' : 'Street' }}</label>
                            <input class="field" id="street" name="street" value="{{ old('street') }}">
                        </div>
                    </div>
                    <div style="margin-top:1rem">
                        <label class="label" for="notes">{{ is_fr() ? 'Instructions de livraison' : 'Delivery notes' }}</label>
                        <textarea class="field" id="notes" name="notes" rows="2">{{ old('notes') }}</textarea>
                    </div>
                </fieldset>

                <fieldset class="card" style="padding:1.5rem;border:1px solid var(--line)">
                    <legend class="eyebrow">{{ t('cart.deliveryEstimate') }}</legend>
                    <div class="form-grid">
                        @foreach ($zones as $zone)
                            <label style="display:flex;gap:.6rem;align-items:center;font-size:.85rem">
                                <input type="radio" name="zoneId" value="{{ $zone->id }}"
                                       data-method="{{ $zone->method }}"
                                       @checked($loop->first)>
                                <span>
                                    <strong>{{ \App\Support\I18n::pick($zone->name, $zone->name_fr) }}</strong><br>
                                    <span style="color:var(--muted);font-size:.72rem">
                                        {{ \App\Support\I18n::pick($zone->eta_label, $zone->eta_label_fr) }} —
                                        {{ $zone->fee == 0 ? t('cart.complimentary') : format_xaf($zone->fee) }}
                                    </span>
                                </span>
                            </label>
                        @endforeach
                    </div>
                </fieldset>

                <fieldset class="card" style="padding:1.5rem;border:1px solid var(--line)">
                    <legend class="eyebrow">{{ t('buy.payTitle') }}</legend>
                    <p style="font-size:.75rem;color:var(--muted);margin-bottom:1rem">{{ t('buy.payTerms') }}</p>
                    <div class="form-grid">
                        <label style="display:flex;gap:.6rem;align-items:center;font-size:.85rem">
                            <input type="radio" name="paymentMethod" value="mobile_money_mtn" @checked(old('paymentMethod', 'mobile_money_mtn') === 'mobile_money_mtn')>
                            {{ t('buy.momoMtn') }} — {{ t('buy.momoHint') ?? '' }}
                        </label>
                        <label style="display:flex;gap:.6rem;align-items:center;font-size:.85rem">
                            <input type="radio" name="paymentMethod" value="mobile_money_orange" @checked(old('paymentMethod') === 'mobile_money_orange')>
                            {{ t('buy.momoOrange') }}
                        </label>
                        <label style="display:flex;gap:.6rem;align-items:center;font-size:.85rem">
                            <input type="radio" name="paymentMethod" value="card" @checked(old('paymentMethod') === 'card')>
                            {{ t('buy.card') }}
                        </label>
                        <label style="display:flex;gap:.6rem;align-items:center;font-size:.85rem">
                            <input type="radio" name="paymentMethod" value="cash_on_delivery" @checked(old('paymentMethod') === 'cash_on_delivery')>
                            {{ t('buy.cod') }}
                        </label>
                    </div>
                </fieldset>

                @if (! $user)
                    <details class="card" style="padding:1.2rem">
                        <summary class="eyebrow" style="cursor:pointer">{{ t('choose.account') }}</summary>
                        <p style="font-size:.75rem;color:var(--muted);margin:.6rem 0">{{ t('choose.accountHint') }}</p>
                        <input class="field" type="password" name="password" minlength="6" placeholder="{{ t('buy.password') }}">
                    </details>
                @endif

                <label style="display:flex;gap:.6rem;align-items:center;font-size:.85rem">
                    <input type="checkbox" name="confirm_address" required>
                    {{ t('checkout.confirmTick') }}
                </label>

                <button class="btn btn-primary" type="submit" style="width:100%">{{ t('checkout.place') }}</button>
            </form>
        </div>

        <aside class="card summary" style="height:fit-content">
            <h2 class="display" style="font-size:1.2rem">{{ t('cart.summary') }}</h2>
            @foreach ($cart['lines'] as $line)
                <div class="summary-row">
                    <span>{{ $line['name'] }} × {{ $line['quantity'] }}</span>
                    <span>{{ format_xaf($line['unitPrice'] * $line['quantity']) }}</span>
                </div>
            @endforeach
            <div class="summary-row"><span>{{ t('cart.subtotal') }}</span><span>{{ format_xaf($cart['subtotal']) }}</span></div>
            @if ($cart['discount'] > 0)
                <div class="summary-row" style="color:#3f9d63"><span>{{ t('cart.discount') }} ({{ $cart['couponCode'] }})</span><span>−{{ format_xaf($cart['discount']) }}</span></div>
            @endif
            <div class="summary-row total"><span>{{ t('cart.total') }}</span><span>{{ format_xaf($cart['subtotal'] - $cart['discount']) }}</span></div>
            <p style="font-size:.7rem;color:var(--muted);margin-top:.8rem">{{ t('cart.deliveryEstimate') }}: {{ t('cart.complimentary') }} / {{ format_xaf(6500) }}</p>
        </aside>
    </div>
@endsection
