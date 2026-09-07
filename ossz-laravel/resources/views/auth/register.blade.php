@extends('layouts.app')

@section('title', is_fr() ? 'Créer un compte' : 'Create an account')

@section('content')
    <div class="wrap">
        <div class="card auth-card">
            <h1 class="display">{{ is_fr() ? 'Créer un compte' : 'Create an account' }}</h1>
            <form method="POST" action="{{ route('register.store') }}" class="form-grid">
                @csrf
                <input type="hidden" name="next" value="{{ $next }}">
                <div>
                    <label class="label" for="fullName">{{ is_fr() ? 'Nom complet' : 'Full name' }}</label>
                    <input class="field" id="fullName" name="fullName" value="{{ old('fullName') }}">
                </div>
                <div>
                    <label class="label" for="email">Email *</label>
                    <input class="field" id="email" type="email" name="email" required value="{{ old('email') }}">
                </div>
                <div>
                    <label class="label" for="phone">{{ t('contact.wa') }}</label>
                    <input class="field" id="phone" name="phone" value="{{ old('phone') }}">
                </div>
                <div>
                    <label class="label" for="password">{{ t('buy.password') }} *</label>
                    <input class="field" id="password" type="password" name="password" required minlength="6">
                </div>
                <button class="btn btn-primary" type="submit">{{ is_fr() ? 'Créer mon compte' : 'Create my account' }}</button>
            </form>
            <p style="margin-top:1.2rem;font-size:.8rem">
                {{ is_fr() ? 'Déjà un compte ?' : 'Already have an account?' }}
                <a class="link-underline" href="{{ route('login', ['next' => $next]) }}">{{ t('nav.signin') }}</a>
            </p>
        </div>
    </div>
@endsection
