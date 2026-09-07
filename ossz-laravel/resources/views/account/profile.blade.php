@extends('layouts.account')

@section('account')
    <div class="card" style="padding:1.5rem;max-width:520px">
        <h2 class="display" style="font-size:1.2rem">{{ is_fr() ? 'Mes informations' : 'My details' }}</h2>
        <form method="POST" action="{{ route('account.profile.update') }}" class="form-grid" style="margin-top:1rem">
            @csrf
            <div>
                <label class="label" for="fullName">{{ is_fr() ? 'Nom complet' : 'Full name' }}</label>
                <input class="field" id="fullName" name="fullName" value="{{ old('fullName', $user->full_name) }}">
            </div>
            <div>
                <label class="label" for="phone">{{ t('contact.wa') }}</label>
                <input class="field" id="phone" name="phone" value="{{ old('phone', $user->phone) }}">
            </div>
            <div>
                <label class="label" for="password">{{ is_fr() ? 'Nouveau mot de passe (optionnel)' : 'New password (optional)' }}</label>
                <input class="field" id="password" type="password" name="password" minlength="6" autocomplete="new-password">
            </div>
            <button class="btn btn-primary" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save' }}</button>
        </form>
    </div>
@endsection
