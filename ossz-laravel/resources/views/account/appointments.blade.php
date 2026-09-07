@extends('layouts.account')

@section('account')
    <div class="card" style="padding:1.5rem">
        <h2 class="display" style="font-size:1.2rem">{{ t('nav.appointments') }}</h2>
        @forelse ($appointments as $apt)
            <div style="display:flex;justify-content:space-between;align-items:center;padding:.9rem 0;border-bottom:1px solid var(--line);flex-wrap:wrap;gap:.5rem">
                <div>
                    <strong style="font-size:.9rem">{{ $apt->reference }}</strong> — {{ $apt->service }}
                    <p style="font-size:.75rem;color:var(--muted);margin-top:.2rem">{{ format_date_time($apt->slot_start) }}</p>
                </div>
                <div style="display:flex;gap:.8rem;align-items:center">
                    <span class="pill {{ $apt->status === 'confirmed' ? 'pill-green' : ($apt->status === 'cancelled' ? 'pill-red' : 'pill-yellow') }}">{{ status_label($apt->status) }}</span>
                    @if (in_array($apt->status, ['requested', 'confirmed']))
                        <form method="POST" action="{{ route('account.appointments.cancel') }}">
                            @csrf
                            <input type="hidden" name="id" value="{{ $apt->id }}">
                            <button class="btn btn-ghost btn-sm" type="submit">{{ is_fr() ? 'Annuler' : 'Cancel' }}</button>
                        </form>
                    @endif
                </div>
            </div>
        @empty
            <p style="margin-top:1rem;font-size:.85rem;color:var(--muted)">{{ is_fr() ? 'Aucun rendez-vous.' : 'No appointments.' }}</p>
        @endforelse
    </div>
@endsection
