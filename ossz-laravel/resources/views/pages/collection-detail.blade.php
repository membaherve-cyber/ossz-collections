@extends('layouts.app')

@section('title', \App\Support\I18n::pick($collection->name, $collection->name_fr))

@section('content')
    <section class="wrap" style="padding:3rem 0 1rem">
        <p class="eyebrow">{{ \App\Support\I18n::pick($collection->season, $collection->season_fr) }}</p>
        <h1 class="display" style="font-size:1.9rem">{{ \App\Support\I18n::pick($collection->name, $collection->name_fr) }}</h1>
        <p style="margin-top:.8rem;font-size:.9rem;color:var(--ink-soft);max-width:40rem">
            {{ \App\Support\I18n::pick($collection->description, $collection->description_fr) }}
        </p>
    </section>

    <section class="wrap grid grid-4" style="padding-bottom:4rem">
        @forelse ($products as $p)
            @include('partials.product-card', ['p' => $p])
        @empty
            <p style="grid-column:1/-1;font-size:.9rem;color:var(--muted)">
                {{ is_fr() ? 'Les pièces de cette collection arrivent bientôt.' : 'Pieces from this collection are arriving soon.' }}
            </p>
        @endforelse
    </section>
@endsection
