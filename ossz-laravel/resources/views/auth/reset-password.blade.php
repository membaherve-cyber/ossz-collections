@extends('layouts.app')

@section('title', is_fr() ? 'Nouveau mot de passe' : 'New password')

@section('content')
    <div class="wrap">
        <div class="card auth-card">
            <h1 class="display">{{ is_fr() ? 'Choisir un nouveau mot de passe' : 'Choose a new password' }}</h1>
            <form method="POST" action="{{ route('password.update') }}" class="form-grid">
                @csrf
                <input type="hidden" name="token" value="{{ $token }}">
                <div>
                    <label class="label" for="password">{{ t('buy.password') }} *</label>
                    <input class="field" id="password" type="password" name="password" required minlength="6">
                </div>
                <button class="btn btn-primary" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save' }}</button>
            </form>
        </div>
    </div>
@endsection
