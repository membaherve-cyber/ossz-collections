@extends('layouts.app')

@section('title', is_fr() ? 'La maison' : 'The house')

@section('content')
    <section class="wrap" style="padding:3rem 0 1rem;max-width:760px">
        <p class="eyebrow">{{ t('home.storyEyebrow') }}</p>
        <h1 class="display" style="font-size:2rem">{{ t('home.storyTitle') }}</h1>
        <p style="margin-top:1.2rem;font-size:.95rem;line-height:1.85;color:var(--ink-soft)">{{ t('home.storyBody') }}</p>
    </section>

    <section class="wrap" style="max-width:760px;padding-bottom:4rem;display:grid;gap:1.5rem">
        <div class="card" style="padding:1.8rem">
            <h2 class="display" style="font-size:1.2rem">{{ is_fr() ? 'L\'atelier' : 'The atelier' }}</h2>
            <p style="margin-top:.7rem;font-size:.88rem;color:var(--ink-soft)">
                {{ is_fr()
                    ? 'Chaque pièce est coupée, cousue et finie dans notre atelier d\'Ange Raphael, à Douala, par des artisans que nous connaissons par leur prénom.'
                    : 'Every piece is cut, sewn and finished in our Ange Raphael atelier in Douala, by artisans we know by name.' }}
            </p>
        </div>
        <div class="card" style="padding:1.8rem">
            <h2 class="display" style="font-size:1.2rem">{{ is_fr() ? 'Nos services' : 'Our services' }}</h2>
            <div style="margin-top:.8rem;display:grid;gap:.6rem;font-size:.88rem;color:var(--ink-soft)">
                <p><strong>{{ t('home.svc1') }}</strong> — {{ t('home.svc1b') }}</p>
                <p><strong>{{ t('home.svc2') }}</strong> — {{ t('home.svc2b') }}</p>
                <p><strong>{{ t('home.svc3') }}</strong> — {{ t('home.svc3b') }}</p>
                <p><strong>{{ t('home.svc4') }}</strong> — {{ t('home.svc4b') }}</p>
            </div>
        </div>
        <div style="display:flex;gap:.75rem">
            <a class="btn btn-primary" href="{{ route('contact') }}">{{ t('faq.contactCta') }}</a>
            <a class="btn btn-secondary" href="{{ route('appointments') }}">{{ t('home.bookCta') }}</a>
        </div>
    </section>
@endsection
