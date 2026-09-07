@extends('layouts.app')

@section('title', 'OSSZ Collections — Contemporary fashion house, Douala')

@section('content')
    @php $loc = locale(); @endphp

    {{-- Hero --}}
    <section class="hero">
        @if ($hero && $hero->image_url)
            <img src="{{ $hero->image_url }}" alt="{{ $hero->heading }}" fetchpriority="high">
        @endif
        <div class="hero-content">
            <h1 class="display">{{ \App\Support\I18n::pick($hero->heading ?? '', $hero->heading_fr ?? '') }}</h1>
            <div class="hero-actions">
                <a href="{{ $hero->cta_href ?? '/shop' }}" class="btn btn-primary" style="background:#fff;color:var(--ink)">
                    {{ \App\Support\I18n::pick($hero->cta_label ?? '', $hero->cta_label_fr ?? '') }}
                </a>
                <a href="{{ route('appointments') }}" class="btn btn-secondary" style="color:#fff;border-color:rgba(255,255,255,.3)">
                    {{ t('home.bookCta') }}
                </a>
            </div>
        </div>
    </section>

    {{-- New arrivals --}}
    <section class="section wrap">
        <div class="section-head">
            <div>
                <p class="eyebrow">{{ t('home.newEyebrow') }}</p>
                <h2 class="display">{{ t('home.newTitle') }}</h2>
                <p class="intro">{{ t('home.newIntro') }}</p>
            </div>
            <a class="btn btn-ghost" href="{{ route('shop') }}">{{ t('home.shopAll') }} →</a>
        </div>
        <div class="grid grid-4">
            @foreach ($newArrivals as $p)
                @include('partials.product-card', ['p' => $p])
            @endforeach
        </div>
    </section>

    {{-- Collection banner --}}
    @if ($banner)
        <section class="bg-dark">
            <div class="grid" style="grid-template-columns:1fr 1fr;align-items:stretch">
                <div class="photo-frame" style="aspect-ratio:4/3;border-radius:0">
                    @if ($banner->image_url)
                        <img src="{{ $banner->image_url }}" alt="{{ $banner->heading }}">
                    @endif
                </div>
                <div style="display:flex;flex-direction:column;justify-content:center;gap:1.2rem;padding:4rem">
                    <p class="eyebrow" style="color:rgba(255,255,255,.7)">{{ \App\Support\I18n::pick($banner->eyebrow, $banner->eyebrow_fr) }}</p>
                    <h2 class="display" style="font-size:1.9rem">{{ \App\Support\I18n::pick($banner->heading, $banner->heading_fr) }}</h2>
                    <p style="max-width:28rem;font-size:.9rem;color:rgba(255,255,255,.8)">{{ \App\Support\I18n::pick($banner->body, $banner->body_fr) }}</p>
                    <a href="{{ $banner->cta_href }}" class="btn btn-secondary" style="color:#fff;border-color:#fff;width:fit-content">
                        {{ \App\Support\I18n::pick($banner->cta_label, $banner->cta_label_fr) }}
                    </a>
                </div>
            </div>
        </section>
    @endif

    {{-- Featured --}}
    <section class="section wrap">
        <div class="section-head">
            <div>
                <p class="eyebrow">{{ t('home.editEyebrow') }}</p>
                <h2 class="display">{{ t('home.editTitle') }}</h2>
            </div>
            <a class="btn btn-ghost" href="{{ route('shop', ['sort' => 'popular']) }}">{{ t('home.editLink') }} →</a>
        </div>
        <div class="grid grid-4">
            @foreach ($featured as $p)
                @include('partials.product-card', ['p' => $p])
            @endforeach
        </div>
    </section>

    {{-- Collections --}}
    <section class="section bg-paper">
        <div class="wrap">
            <div class="section-head">
                <div>
                    <p class="eyebrow">{{ t('home.colsEyebrow') }}</p>
                    <h2 class="display">{{ t('home.colsTitle') }}</h2>
                </div>
                <a class="btn btn-ghost" href="{{ route('collections.index') }}">{{ t('home.colsLink') }} →</a>
            </div>
            <div class="grid grid-3">
                @foreach ($collections as $c)
                    <a href="{{ route('collections.show', $c->slug) }}" class="product-card">
                        <div class="photo-frame" style="aspect-ratio:4/5">
                            @if ($c->cover_image)<img src="{{ $c->cover_image }}" alt="{{ $c->name }}" loading="lazy">@endif
                            <div style="position:absolute;inset:auto 0 0 0;padding:1.5rem;color:#fff;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)">
                                <p class="eyebrow" style="color:rgba(255,255,255,.75)">{{ \App\Support\I18n::pick($c->season, $c->season_fr) }}</p>
                                <h3 class="display" style="font-size:1.4rem">{{ \App\Support\I18n::pick($c->name, $c->name_fr) }}</h3>
                            </div>
                        </div>
                        <p style="margin-top:.75rem;font-size:.85rem;color:var(--ink-soft)">{{ \App\Support\I18n::pick($c->description, $c->description_fr) }}</p>
                    </a>
                @endforeach
            </div>
        </div>
    </section>

    {{-- Lookbook teaser --}}
    <section class="section wrap">
        <div class="section-head">
            <div>
                <p class="eyebrow">{{ t('home.lookEyebrow') }}</p>
                <h2 class="display">{{ t('home.lookTitle') }}</h2>
            </div>
            <a class="btn btn-ghost" href="{{ route('lookbook') }}">{{ t('home.lookLink') }} →</a>
        </div>
        <div class="grid grid-3">
            @foreach ($looks as $look)
                <figure>
                    <div class="photo-frame" style="aspect-ratio:3/4">
                        @if ($look->media_type === 'video' && $look->video_url)
                            <video src="{{ $look->video_url }}" poster="{{ $look->poster_url }}" muted playsinline preload="metadata"></video>
                        @elseif ($look->image_url)
                            <img src="{{ $look->image_url }}" alt="{{ $look->title }}" loading="lazy">
                        @endif
                    </div>
                    <figcaption style="margin-top:.5rem;font-size:.72rem;color:var(--muted)">{{ \App\Support\I18n::pick($look->caption, $look->caption_fr) }}</figcaption>
                </figure>
            @endforeach
        </div>
    </section>

    {{-- Brand story + journal --}}
    <section class="section" style="background:rgba(241,242,244,.4)">
        <div class="wrap grid" style="grid-template-columns:1fr 1fr;align-items:center">
            <div>
                <p class="eyebrow">{{ t('home.storyEyebrow') }}</p>
                <h2 class="display" style="font-size:1.8rem;margin-top:.8rem">{{ t('home.storyTitle') }}</h2>
                <p style="margin-top:1.2rem;font-size:.9rem;color:var(--ink-soft)">{{ t('home.storyBody') }}</p>
                <div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap">
                    <a href="{{ route('about') }}" class="btn btn-secondary">{{ t('home.storyCta') }}</a>
                    <a href="{{ route('journal.index') }}" class="btn btn-ghost">{{ t('home.journalCta') }}</a>
                </div>
            </div>
            <div style="display:grid;gap:1.2rem">
                @foreach ($posts as $post)
                    <a href="{{ route('journal.show', $post->slug) }}" class="card" style="display:flex;gap:1rem;padding:1rem">
                        <div class="photo-frame photo-frame-sm" style="width:96px;height:96px;flex-shrink:0">
                            @if ($post->cover_image)<img src="{{ $post->cover_image }}" alt="{{ $post->title }}" loading="lazy">@endif
                        </div>
                        <div>
                            <h3 class="display" style="font-size:1.15rem">{{ \App\Support\I18n::pick($post->title, $post->title_fr) }}</h3>
                            <p style="margin-top:.25rem;font-size:.72rem;color:var(--ink-soft)">{{ \App\Support\I18n::pick($post->excerpt, $post->excerpt_fr) }}</p>
                        </div>
                    </a>
                @endforeach
                @if ($invite)
                    <div class="card" style="background:var(--canvas);padding:1.25rem">
                        <p class="eyebrow">{{ \App\Support\I18n::pick($invite->eyebrow, $invite->eyebrow_fr) }}</p>
                        <h3 class="display" style="font-size:1.15rem;margin-top:.3rem">{{ \App\Support\I18n::pick($invite->heading, $invite->heading_fr) }}</h3>
                        <p style="margin-top:.5rem;font-size:.78rem;color:var(--ink-soft)">{{ \App\Support\I18n::pick($invite->body, $invite->body_fr) }}</p>
                        <a href="{{ $invite->cta_href }}" class="btn btn-primary btn-sm" style="margin-top:1rem">
                            {{ \App\Support\I18n::pick($invite->cta_label, $invite->cta_label_fr) }}
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </section>

    {{-- Contact CTA --}}
    <section class="bg-dark" style="padding:2.5rem 0">
        <div class="wrap" style="text-align:center;display:grid;gap:.8rem;justify-items:center">
            <p style="font-size:.9rem;color:rgba(255,255,255,.9)">
                {{ is_fr() ? 'Besoin d\'aide pour trouver la bonne pièce ? Nous sommes là pour vous.' : 'Need help finding the right piece? We are here for you.' }}
            </p>
            <a href="{{ route('contact') }}" class="btn" style="background:#fff;color:var(--ink)">{{ is_fr() ? 'Nous contacter' : 'Get in touch' }}</a>
            <p style="font-size:.72rem;color:rgba(255,255,255,.5)">
                {{ is_fr() ? 'Ou écrivez-nous à' : 'Or write to us directly at' }}
                <a href="mailto:info@osszcollection.com" style="color:var(--accent)">{{ \App\Support\Settings::get('contact_email') }}</a>
            </p>
        </div>
    </section>
@endsection
