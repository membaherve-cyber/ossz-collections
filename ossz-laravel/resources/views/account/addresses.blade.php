@extends('layouts.account')

@section('account')
    <div class="grid grid-2">
        <div class="card" style="padding:1.5rem">
            <h2 class="display" style="font-size:1.2rem">{{ is_fr() ? 'Mes adresses' : 'My addresses' }}</h2>
            @forelse ($addresses as $address)
                <div style="padding:1rem 0;border-bottom:1px solid var(--line);font-size:.85rem">
                    <strong>{{ $address->label }}</strong> — {{ $address->full_name }}
                    <p style="color:var(--muted);font-size:.78rem;margin-top:.2rem">
                        {{ $address->street }} {{ $address->area }}, {{ $address->city }} · {{ $address->phone }}
                    </p>
                    <form method="POST" action="{{ route('account.addresses.delete') }}" style="margin-top:.4rem">
                        @csrf
                        <input type="hidden" name="id" value="{{ $address->id }}">
                        <button class="btn btn-ghost btn-sm" type="submit">{{ is_fr() ? 'Supprimer' : 'Remove' }}</button>
                    </form>
                </div>
            @empty
                <p style="margin-top:1rem;font-size:.85rem;color:var(--muted)">{{ is_fr() ? 'Aucune adresse enregistrée.' : 'No saved addresses.' }}</p>
            @endforelse
        </div>

        <div class="card" style="padding:1.5rem">
            <h2 class="display" style="font-size:1.2rem">{{ is_fr() ? 'Ajouter une adresse' : 'Add an address' }}</h2>
            <form method="POST" action="{{ route('account.addresses.save') }}" class="form-grid" style="margin-top:1rem">
                @csrf
                <div>
                    <label class="label" for="label">{{ is_fr() ? 'Libellé' : 'Label' }}</label>
                    <input class="field" id="label" name="label" value="{{ old('label', 'Home') }}">
                </div>
                <div>
                    <label class="label" for="full_name">{{ is_fr() ? 'Nom complet' : 'Full name' }} *</label>
                    <input class="field" id="full_name" name="full_name" required value="{{ old('full_name', $osszUser->full_name) }}">
                </div>
                <div>
                    <label class="label" for="phone">{{ t('contact.wa') }} *</label>
                    <input class="field" id="phone" name="phone" required value="{{ old('phone', $osszUser->phone) }}">
                </div>
                <div class="form-grid cols-2">
                    <div>
                        <label class="label" for="city">{{ is_fr() ? 'Ville' : 'City' }}</label>
                        <input class="field" id="city" name="city" value="{{ old('city', 'Douala') }}">
                    </div>
                    <div>
                        <label class="label" for="area">{{ is_fr() ? 'Quartier' : 'Area' }}</label>
                        <input class="field" id="area" name="area" value="{{ old('area') }}">
                    </div>
                </div>
                <div>
                    <label class="label" for="street">{{ is_fr() ? 'Rue' : 'Street' }}</label>
                    <input class="field" id="street" name="street" value="{{ old('street') }}">
                </div>
                <button class="btn btn-primary" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save address' }}</button>
            </form>
        </div>
    </div>
@endsection
