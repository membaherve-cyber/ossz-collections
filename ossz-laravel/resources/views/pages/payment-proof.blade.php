@extends('layouts.app')

@section('title', is_fr() ? 'Preuve de paiement' : 'Payment proof')

@section('content')
    <div class="wrap" style="padding:3rem 0;max-width:560px">
        <h1 class="display" style="font-size:1.6rem">{{ is_fr() ? 'Envoyer une preuve de paiement' : 'Send payment proof' }}</h1>
        <p style="margin-top:.7rem;font-size:.85rem;color:var(--ink-soft)">
            {{ is_fr()
                ? 'Après votre paiement mobile money ou par carte, envoyez-nous une capture d\'écran : notre équipe confirmera votre commande.'
                : 'After your mobile money or card payment, send us a screenshot — our team will confirm your order.' }}
        </p>

        <form method="POST" action="{{ route('checkout.proof') }}" class="form-grid" style="margin-top:1.5rem" enctype="multipart/form-data">
            @csrf
            <div>
                <label class="label" for="order_number">{{ is_fr() ? 'Numéro de commande' : 'Order number' }} *</label>
                <input class="field" id="order_number" name="order_number" required placeholder="OSZ-XXXXXXX" value="{{ old('order_number', $orderNumber) }}">
            </div>
            <div>
                <label class="label" for="proof">{{ is_fr() ? 'Capture d\'écran' : 'Screenshot' }} *</label>
                <input class="field" id="proof" type="file" name="proof" accept="image/*" required>
            </div>
            <button class="btn btn-primary" type="submit">{{ is_fr() ? 'Envoyer' : 'Submit' }}</button>
        </form>

        <p style="margin-top:1.5rem;font-size:.8rem;color:var(--muted)">
            {{ is_fr() ? 'Une question ? Écrivez-nous sur WhatsApp.' : 'A question? Message us on WhatsApp.' }}
            <a class="link-underline" target="_blank" rel="noreferrer" href="{{ \App\Support\wa_link(\App\Support\Settings::get('whatsapp_number')) }}">
                {{ \App\Support\Settings::get('whatsapp_number') }}
            </a>
        </p>
    </div>
@endsection
