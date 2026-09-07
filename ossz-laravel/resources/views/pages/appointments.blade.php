@extends('layouts.app')

@section('title', t('appt.title'))

@section('content')
    <div class="wrap cart-layout">
        <div>
            <p class="eyebrow">{{ t('appt.eyebrow') }}</p>
            <h1 class="display" style="font-size:1.8rem">{{ t('appt.title') }}</h1>
            <p style="margin-top:.8rem;font-size:.9rem;color:var(--ink-soft);max-width:36rem">{{ t('appt.intro') }}</p>

            <form method="POST" action="{{ route('appointments.book') }}" class="form-grid" style="margin-top:1.8rem;max-width:520px">
                @csrf
                <div>
                    <label class="label" for="name">{{ is_fr() ? 'Nom' : 'Name' }} *</label>
                    <input class="field" id="name" name="name" required value="{{ old('name', \App\Models\User::find(session('user_id'))?->full_name) }}">
                </div>
                <div>
                    <label class="label" for="contact">Email / WhatsApp *</label>
                    <input class="field" id="contact" name="contact" required value="{{ old('contact') }}">
                </div>
                <div>
                    <label class="label" for="service">{{ is_fr() ? 'Prestation' : 'Service' }}</label>
                    <select class="field" id="service" name="service">
                        <option>{{ is_fr() ? 'Séance de style' : 'Styling session' }}</option>
                        <option>{{ is_fr() ? 'Essayage' : 'Fitting' }}</option>
                        <option>{{ is_fr() ? 'Sur-mesure' : 'Made-to-measure' }}</option>
                    </select>
                </div>
                <div class="form-grid cols-2">
                    <div>
                        <label class="label" for="date">{{ is_fr() ? 'Date' : 'Date' }} *</label>
                        <input class="field" id="date" type="date" name="date" required min="{{ now()->toDateString() }}" value="{{ old('date') }}">
                    </div>
                    <div>
                        <label class="label" for="time">{{ is_fr() ? 'Heure' : 'Time' }} *</label>
                        <input class="field" id="time" type="time" name="time" required value="{{ old('time', '10:00') }}">
                    </div>
                </div>
                <div>
                    <label class="label" for="notes">{{ is_fr() ? 'Notes' : 'Notes' }}</label>
                    <textarea class="field" id="notes" name="notes" rows="2">{{ old('notes') }}</textarea>
                </div>
                <button class="btn btn-primary" type="submit">{{ t('home.bookCta') }}</button>
            </form>
        </div>

        <aside style="height:fit-content">
            <div class="card" style="padding:1.5rem;display:grid;gap:.8rem">
                <p style="font-size:.85rem;color:var(--ink-soft)">{{ t('appt.p1') }}</p>
                <p style="font-size:.85rem;color:var(--ink-soft)">{{ t('appt.p2') }}</p>
                <p style="font-size:.85rem;color:var(--ink-soft)">{{ t('appt.p3') }}</p>
            </div>
        </aside>
    </div>
@endsection
