@extends('layouts.admin')

@section('title', is_fr() ? 'Réglages' : 'Settings')

@section('content')
    <form method="POST" action="{{ route('admin.settings.save') }}" class="card" style="padding:1.5rem;max-width:680px">
        @csrf
        <div class="form-grid">
            <div>
                <label class="label">WhatsApp ({{ is_fr() ? 'principal' : 'primary' }})</label>
                <input class="field" name="whatsapp_number" value="{{ $settings['whatsapp_number'] }}">
            </div>
            <div>
                <label class="label">WhatsApp ({{ is_fr() ? 'secondaire' : 'secondary' }})</label>
                <input class="field" name="whatsapp_number2" value="{{ $settings['whatsapp_number2'] }}">
            </div>
            <div>
                <label class="label">{{ is_fr() ? 'Adresse de la boutique' : 'Store address' }}</label>
                <input class="field" name="store_address" value="{{ $settings['store_address'] }}">
            </div>
            <div>
                <label class="label">{{ is_fr() ? 'Horaires' : 'Business hours' }}</label>
                <input class="field" name="business_hours" value="{{ $settings['business_hours'] }}">
            </div>
            <div>
                <label class="label">Contact email</label>
                <input class="field" type="email" name="contact_email" value="{{ $settings['contact_email'] }}">
            </div>
            <div>
                <label class="label">{{ is_fr() ? 'Message d\'accueil du concierge' : 'Concierge greeting' }}</label>
                <textarea class="field" name="concierge_greeting" rows="2">{{ $settings['concierge_greeting'] }}</textarea>
            </div>
            <div class="form-grid cols-2">
                <div>
                    <label class="label">{{ is_fr() ? 'Seuil livraison offerte (FCFA)' : 'Free delivery threshold (FCFA)' }}</label>
                    <input class="field" type="number" name="free_delivery_threshold" value="{{ $settings['free_delivery_threshold'] }}">
                </div>
                <div>
                    <label class="label">{{ is_fr() ? 'Paiement à la livraison' : 'Cash on delivery' }}</label>
                    <select class="field" name="cod_enabled">
                        <option value="true" @selected($settings['cod_enabled'] === 'true')>{{ is_fr() ? 'Activé' : 'Enabled' }}</option>
                        <option value="false" @selected($settings['cod_enabled'] !== 'true')>{{ is_fr() ? 'Désactivé' : 'Disabled' }}</option>
                    </select>
                </div>
            </div>
        </div>
        <button class="btn btn-primary" style="margin-top:1.2rem" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save settings' }}</button>
    </form>
@endsection
