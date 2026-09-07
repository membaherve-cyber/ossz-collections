@extends('layouts.app')

@section('title', t('contact.title'))

@section('content')
    @php $settings = \App\Support\Settings::all(); @endphp

    <div class="wrap cart-layout">
        <div>
            <p class="eyebrow">{{ t('contact.eyebrow') }}</p>
            <h1 class="display" style="font-size:1.8rem">{{ t('contact.title') }}</h1>
            <p style="margin-top:.8rem;font-size:.9rem;color:var(--ink-soft)">{{ t('contact.intro') }}</p>

            <form method="POST" action="{{ route('contact.submit') }}" class="form-grid" style="margin-top:1.8rem;max-width:520px">
                @csrf
                <div>
                    <label class="label" for="name">{{ is_fr() ? 'Nom' : 'Name' }} *</label>
                    <input class="field" id="name" name="name" required value="{{ old('name') }}">
                </div>
                <div>
                    <label class="label" for="contact">Email / {{ t('contact.wa') }} *</label>
                    <input class="field" id="contact" name="contact" required value="{{ old('contact') }}">
                </div>
                <div>
                    <label class="label" for="message">{{ is_fr() ? 'Message' : 'Message' }} *</label>
                    <textarea class="field" id="message" name="message" rows="5" required>{{ old('message') }}</textarea>
                </div>
                <button class="btn btn-primary" type="submit">{{ t('contact.waCta') }}</button>
            </form>
        </div>

        <aside style="display:grid;gap:1.2rem;height:fit-content">
            <div class="card" style="padding:1.5rem">
                <p class="eyebrow">{{ t('contact.boutique') }}</p>
                <p style="margin-top:.6rem;font-size:.9rem">{{ $settings['store_address'] }}</p>
            </div>
            <div class="card" style="padding:1.5rem">
                <p class="eyebrow">{{ t('contact.hours') }}</p>
                <p style="margin-top:.6rem;font-size:.9rem">{{ $settings['business_hours'] }}</p>
            </div>
            <div class="card" style="padding:1.5rem">
                <p class="eyebrow">{{ t('contact.email') }}</p>
                <p style="margin-top:.6rem"><a class="link-underline" href="mailto:{{ $settings['contact_email'] }}">{{ $settings['contact_email'] }}</a></p>
            </div>
            <div class="card" style="padding:1.5rem">
                <p class="eyebrow">{{ t('contact.wa') }}</p>
                <p style="margin-top:.6rem">
                    <a class="link-underline" target="_blank" rel="noreferrer" href="{{ \App\Support\wa_link($settings['whatsapp_number']) }}">{{ $settings['whatsapp_number'] }}</a>
                </p>
            </div>
        </aside>
    </div>
@endsection
