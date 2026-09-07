@extends('layouts.admin')

@section('title', is_fr() ? 'Notifications' : 'Notifications')

@section('content')
    <div class="card" style="padding:1.2rem">
        <table class="table">
            <thead>
                <tr>
                    <th>{{ is_fr() ? 'Canal' : 'Channel' }}</th><th>{{ is_fr() ? 'Destinataire' : 'Recipient' }}</th>
                    <th>{{ is_fr() ? 'Objet' : 'Subject' }}</th><th>{{ is_fr() ? 'Statut' : 'Status' }}</th><th>{{ is_fr() ? 'Date' : 'Date' }}</th><th></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($notifications as $n)
                    <tr>
                        <td><span class="pill {{ $n->channel === 'whatsapp' ? 'pill-green' : 'pill-blue' }}">{{ strtoupper($n->channel) }}</span></td>
                        <td style="font-size:.8rem">{{ $n->recipient }}</td>
                        <td style="font-size:.8rem">{{ \Illuminate\Support\Str::limit($n->subject ?: $n->body, 60) }}</td>
                        <td><span class="pill {{ $n->status === 'sent' ? 'pill-green' : ($n->status === 'failed' ? 'pill-red' : 'pill-yellow') }}">{{ $n->status }}</span></td>
                        <td style="font-size:.75rem">{{ format_date_time($n->created_at) }}</td>
                        <td>
                            @if ($n->channel === 'whatsapp')
                                <a class="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href="{{ \App\Support\wa_link($n->recipient, $n->body) }}">{{ is_fr() ? 'Envoyer' : 'Send' }} ↗</a>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" style="color:var(--muted)">{{ is_fr() ? 'Aucune notification.' : 'No notifications.' }}</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
