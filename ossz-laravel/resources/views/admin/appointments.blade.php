@extends('layouts.admin')

@section('title', t('nav.appointments'))

@section('content')
    <div class="card" style="padding:1.2rem">
        <table class="table">
            <thead>
                <tr>
                    <th>Ref</th><th>{{ is_fr() ? 'Client' : 'Client' }}</th><th>{{ is_fr() ? 'Créneau' : 'Slot' }}</th>
                    <th>{{ is_fr() ? 'Prestation' : 'Service' }}</th><th>{{ is_fr() ? 'Statut' : 'Status' }}</th><th></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($appointments as $appointment)
                    <tr>
                        <td style="font-size:.8rem">{{ $appointment->reference }}</td>
                        <td>
                            <strong style="font-size:.85rem">{{ $appointment->guest_name }}</strong><br>
                            <span style="font-size:.72rem;color:var(--muted)">{{ $appointment->guest_contact }}</span>
                        </td>
                        <td style="font-size:.8rem">{{ format_date_time($appointment->slot_start) }}</td>
                        <td style="font-size:.8rem">{{ $appointment->service }}</td>
                        <td>
                            <span class="pill {{ $appointment->status === 'confirmed' ? 'pill-green' : ($appointment->status === 'cancelled' ? 'pill-red' : ($appointment->status === 'completed' ? 'pill-blue' : 'pill-yellow')) }}">
                                {{ status_label($appointment->status) }}
                            </span>
                        </td>
                        <td>
                            <form method="POST" action="{{ route('admin.appointments.update', $appointment) }}" class="inline-form" style="display:flex;gap:.4rem">
                                @csrf
                                <select class="field" style="width:auto;padding:.3rem .4rem;font-size:.75rem" name="status">
                                    @foreach (['requested', 'confirmed', 'completed', 'cancelled'] as $s)
                                        <option value="{{ $s }}" @selected($appointment->status === $s)>{{ status_label($s) }}</option>
                                    @endforeach
                                </select>
                                <button class="btn btn-secondary btn-sm" type="submit">✓</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" style="color:var(--muted)">{{ is_fr() ? 'Aucun rendez-vous.' : 'No appointments.' }}</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
