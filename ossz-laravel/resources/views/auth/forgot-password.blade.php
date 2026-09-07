@extends('layouts.app')

@section('title', is_fr() ? 'Mot de passe oublié' : 'Forgot password')

@section('content')
    <div class="wrap">
        <div class="card auth-card">
            <h1 class="display">{{ is_fr() ? 'Mot de passe oublié' : 'Forgot password' }}</h1>
            <form method="POST" action="{{ route('password.email') }}" class="form-grid">
                @csrf
                <div>
                    <label class="label" for="email">Email</label>
                    <input class="field" id="email" type="email" name="email" required value="{{ old('email') }}">
                </div>
                <button class="btn btn-primary" type="submit">{{ is_fr() ? 'Envoyer le lien' : 'Send reset link' }}</button>
            </form>
            <p style="margin-top:1.2rem;font-size:.8rem">
                <a class="link-underline" href="{{ route('login') }}">← {{ t('nav.signin') }}</a>
            </p>
        </div>
    </div>
@endsection
