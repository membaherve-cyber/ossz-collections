@extends('layouts.admin')

@section('title', is_fr() ? 'Messages' : 'Messages')

@section('content')
    <div style="display:grid;gap:1rem">
        @forelse ($messages as $message)
            <div class="card" style="padding:1.3rem {{ $message->handled ? 'opacity:.65' : '' }}">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem">
                    <div>
                        <strong style="font-size:.9rem">{{ $message->name }}</strong>
                        <span style="font-size:.78rem;color:var(--muted)"> · {{ $message->contact }} · {{ format_date_time($message->created_at) }}</span>
                    </div>
                    @if (! $message->handled)
                        <form method="POST" action="{{ route('admin.contact.handled') }}">
                            @csrf
                            <input type="hidden" name="id" value="{{ $message->id }}">
                            <button class="btn btn-ghost btn-sm" type="submit">✓ {{ is_fr() ? 'Traité' : 'Handled' }}</button>
                        </form>
                    @else
                        <span class="pill pill-green">{{ is_fr() ? 'Traité' : 'Handled' }}</span>
                    @endif
                </div>
                <p style="margin-top:.7rem;font-size:.85rem;color:var(--ink-soft);white-space:pre-line">{{ $message->message }}</p>

                @if (! $message->handled)
                    <form method="POST" action="{{ route('admin.contact.reply') }}" style="display:grid;gap:.6rem;margin-top:1rem;max-width:560px">
                        @csrf
                        <input type="hidden" name="messageId" value="{{ $message->id }}">
                        <textarea class="field" name="reply" rows="2" placeholder="{{ is_fr() ? 'Votre réponse…' : 'Your reply…' }}" required></textarea>
                        <button class="btn btn-secondary btn-sm" type="submit">{{ is_fr() ? 'Répondre' : 'Send reply' }}</button>
                    </form>
                @endif
            </div>
        @empty
            <div class="card" style="padding:2rem"><p style="color:var(--muted);font-size:.85rem">{{ is_fr() ? 'Aucun message.' : 'No messages.' }}</p></div>
        @endforelse
    </div>
@endsection
