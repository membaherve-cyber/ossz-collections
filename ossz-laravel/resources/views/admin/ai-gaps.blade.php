@extends('layouts.admin')

@section('title', 'AI gaps')

@section('content')
    <div style="display:grid;gap:1rem">
        @forelse ($gaps as $gap)
            <div class="card" style="padding:1.3rem {{ $gap->status === 'resolved' ? 'opacity:.65' : '' }}">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
                    <div>
                        <strong style="font-size:.88rem">{{ $gap->question }}</strong>
                        <p style="font-size:.72rem;color:var(--muted);margin-top:.2rem">
                            {{ strtoupper($gap->locale) }} · intent: {{ $gap->detected_intent ?: '—' }} · {{ format_date_time($gap->created_at) }}
                        </p>
                    </div>
                    <span class="pill {{ $gap->status === 'resolved' ? 'pill-green' : 'pill-yellow' }}">{{ $gap->status }}</span>
                </div>

                @if ($gap->search_performed || $gap->search_result)
                    <p style="font-size:.75rem;color:var(--muted);margin-top:.6rem">
                        search: {{ \Illuminate\Support\Str::limit($gap->search_performed.' → '.$gap->search_result, 140) }}
                    </p>
                @endif

                @if ($gap->status !== 'resolved')
                    <form method="POST" action="{{ route('admin.ai-gaps.resolve') }}" style="display:grid;gap:.6rem;margin-top:1rem;max-width:560px">
                        @csrf
                        <input type="hidden" name="id" value="{{ $gap->id }}">
                        <textarea class="field" name="resolved_answer" rows="2" placeholder="{{ is_fr() ? 'Réponse approuvée…' : 'Approved answer…' }}" required></textarea>
                        <button class="btn btn-secondary btn-sm" type="submit">{{ is_fr() ? 'Résoudre' : 'Resolve' }}</button>
                    </form>
                @else
                    <p style="font-size:.8rem;margin-top:.6rem;color:var(--ink-soft)">{{ $gap->resolved_answer }}</p>
                @endif
            </div>
        @empty
            <div class="card" style="padding:2rem">
                <p style="color:var(--muted);font-size:.85rem">
                    {{ is_fr() ? 'Aucune question en attente — le concierge a répondu à tout.' : 'Nothing waiting — the concierge answered everything.' }}
                </p>
            </div>
        @endforelse
    </div>
@endsection
