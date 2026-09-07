@extends('layouts.app')

@section('title', t('nav.signin'))

@section('content')
    <div class="wrap">
        <div class="card auth-card">
            <h1 class="display">{{ t('nav.signin') }}</h1>
            <form method="POST" action="{{ route('login.attempt') }}" class="form-grid">
                @csrf
                <input type="hidden" name="next" value="{{ $next }}">
                <div>
                    <label class="label" for="email">{{ is_fr() ? 'Email ou identifiant' : 'Email or username' }}</label>
                    <input class="field" id="email" name="email" required autocomplete="username" value="{{ old('email') }}">
                </div>
                <div>
                    <label class="label" for="password">{{ t('buy.password') }}</label>
                    <input class="field" id="password" type="password" name="password" required autocomplete="current-password">
                </div>
                <button class="btn btn-primary" type="submit">{{ t('nav.signin') }}</button>
            </form>
            <div style="display:flex;justify-content:space-between;margin-top:1.2rem;font-size:.8rem">
                <a class="link-underline" href="{{ route('register', ['next' => $next]) }}">{{ is_fr() ? 'Créer un compte' : 'Create an account' }}</a>
                <a class="link-underline" href="{{ route('password.request') }}">{{ is_fr() ? 'Mot de passe oublié ?' : 'Forgot password?' }}</a>
            </div>
        </div>
    </div>
@endsection
