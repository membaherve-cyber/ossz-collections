@extends('layouts.app')

@section('title', t('footer.trackLink'))

@section('content')
    <section class="wrap" style="padding:3rem 0;max-width:520px">
        <h1 class="display" style="font-size:1.6rem">{{ t('footer.trackLink') }}</h1>
        <p style="margin-top:.7rem;font-size:.85rem;color:var(--ink-soft)">
            {{ is_fr()
                ? 'Saisissez votre numéro de commande (OSZ-…) et l\'email ou le téléphone utilisé lors de la commande.'
                : 'Enter your order number (OSZ-…) and the email or phone used when ordering.' }}
        </p>

        <form method="POST" action="{{ route('order.lookup') }}" class="form-grid" style="margin-top:1.5rem">
            @csrf
            <div>
                <label class="label" for="order_number">{{ is_fr() ? 'Numéro de commande' : 'Order number' }}</label>
                <input class="field" id="order_number" name="order_number" required placeholder="OSZ-XXXXXXX" value="{{ old('order_number') }}">
            </div>
            <div>
                <label class="label" for="contact">Email / {{ t('contact.wa') }}</label>
                <input class="field" id="contact" name="contact" required value="{{ old('contact') }}">
            </div>
            <button class="btn btn-primary" type="submit">{{ is_fr() ? 'Suivre' : 'Track' }}</button>
        </form>
    </section>
@endsection
