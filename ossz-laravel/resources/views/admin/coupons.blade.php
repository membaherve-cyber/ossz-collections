@extends('layouts.admin')

@section('title', is_fr() ? 'Codes promo' : 'Coupons')

@section('content')
    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
        <div class="card" style="padding:1.2rem">
            <table class="table">
                <thead>
                    <tr><th>Code</th><th>{{ is_fr() ? 'Type' : 'Type' }}</th><th>{{ is_fr() ? 'Valeur' : 'Value' }}</th><th>{{ is_fr() ? 'Utilisations' : 'Used' }}</th><th>{{ is_fr() ? 'Statut' : 'Status' }}</th><th></th></tr>
                </thead>
                <tbody>
                    @forelse ($coupons as $coupon)
                        <tr>
                            <td><strong style="font-size:.85rem">{{ $coupon->code }}</strong>
                                @if ($coupon->expires_at)<br><span style="font-size:.7rem;color:var(--muted)">{{ is_fr() ? 'exp.' : 'exp.' }} {{ format_date($coupon->expires_at) }}</span>@endif
                            </td>
                            <td style="font-size:.8rem">{{ $coupon->type }}</td>
                            <td>{{ $coupon->type === 'percentage' ? $coupon->value.'%' : format_xaf($coupon->value) }}</td>
                            <td>{{ $coupon->times_used }}{{ $coupon->usage_limit ? ' / '.$coupon->usage_limit : '' }}</td>
                            <td><span class="pill {{ $coupon->is_active ? 'pill-green' : 'pill-gray' }}">{{ $coupon->is_active ? (is_fr() ? 'actif' : 'active') : (is_fr() ? 'inactif' : 'inactive') }}</span></td>
                            <td>
                                <form method="POST" action="{{ route('admin.coupons.toggle') }}">
                                    @csrf
                                    <input type="hidden" name="id" value="{{ $coupon->id }}">
                                    <button class="btn btn-ghost btn-sm" type="submit">{{ $coupon->is_active ? '⏸' : '▶' }}</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="6" style="color:var(--muted)">{{ is_fr() ? 'Aucun code.' : 'No coupons.' }}</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="card" style="padding:1.5rem">
            <h3 style="font-size:.95rem;font-weight:400">{{ is_fr() ? 'Nouveau code' : 'New coupon' }}</h3>
            <form method="POST" action="{{ route('admin.coupons.store') }}" class="form-grid" style="margin-top:1rem">
                @csrf
                <input class="field" name="code" placeholder="OSSZ10" required style="text-transform:uppercase">
                <select class="field" name="type">
                    <option value="percentage">{{ is_fr() ? 'Pourcentage (%)' : 'Percentage (%)' }}</option>
                    <option value="fixed">{{ is_fr() ? 'Montant fixe (FCFA)' : 'Fixed amount (FCFA)' }}</option>
                    <option value="free_delivery">{{ is_fr() ? 'Livraison offerte' : 'Free delivery' }}</option>
                </select>
                <input class="field" type="number" name="value" min="0" placeholder="Value">
                <input class="field" type="number" name="usage_limit" min="0" placeholder="{{ is_fr() ? 'Limite (0 = illimité)' : 'Usage limit (0 = unlimited)' }}">
                <input class="field" type="date" name="expires_at">
                <button class="btn btn-primary btn-sm" type="submit">{{ is_fr() ? 'Créer' : 'Create' }}</button>
            </form>
        </div>
    </div>
@endsection
