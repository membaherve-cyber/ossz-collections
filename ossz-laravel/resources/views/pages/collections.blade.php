@extends('layouts.app')

@section('title', t('cols.title'))

@section('content')
    <section class="wrap" style="padding:3rem 0 1rem;text-align:center">
        <p class="eyebrow">{{ t('cols.eyebrow') }}</p>
        <h1 class="display" style="font-size:1.8rem">{{ t('cols.title') }}</h1>
        <p style="margin-top:.8rem;font-size:.9rem;color:var(--ink-soft)">{{ t('cols.intro') }}</p>
    </section>

    <section class="wrap grid grid-3" style="padding-bottom:4rem">
        @foreach ($collections as $c)
            <a href="{{ route('collections.show', $c->slug) }}" class="product-card">
                <div class="photo-frame" style="aspect-ratio:4/5">
                    @if ($c->cover_image)<img src="{{ $c->cover_image }}" alt="{{ $c->name }}" loading="lazy">@endif
                    <div style="position:absolute;inset:auto 0 0 0;padding:1.5rem;color:#fff;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)">
                        <p class="eyebrow" style="color:rgba(255,255,255,.75)">{{ \App\Support\I18n::pick($c->season, $c->season_fr) }}</p>
                        <h2 class="display" style="font-size:1.4rem">{{ \App\Support\I18n::pick($c->name, $c->name_fr) }}</h2>
                    </div>
                </div>
                <p style="margin-top:.75rem;font-size:.85rem;color:var(--ink-soft)">{{ \App\Support\I18n::pick($c->description, $c->description_fr) }}</p>
                <p style="margin-top:.4rem;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase">{{ t('cols.view') }} →</p>
            </a>
        @endforeach
    </section>
@endsection
