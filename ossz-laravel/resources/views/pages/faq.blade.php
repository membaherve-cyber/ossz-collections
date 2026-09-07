@extends('layouts.app')

@section('title', t('faq.title'))

@section('content')
    <section class="wrap" style="padding:3rem 0 1rem;max-width:800px">
        <p class="eyebrow">{{ t('faq.eyebrow') }}</p>
        <h1 class="display" style="font-size:1.8rem">{{ t('faq.title') }}</h1>
        <p style="margin-top:.8rem;font-size:.9rem;color:var(--ink-soft)">{{ t('faq.intro') }}</p>
    </section>

    <section class="wrap" style="max-width:800px;padding-bottom:4rem;display:grid;gap:.75rem">
        @forelse ($faqs as $faq)
            <details class="card" style="padding:1.1rem 1.3rem">
                <summary style="cursor:pointer;font-size:.92rem;font-weight:500">
                    {{ \App\Support\I18n::pick($faq->question, $faq->question_fr) }}
                </summary>
                <p style="margin-top:.7rem;font-size:.85rem;color:var(--ink-soft);white-space:pre-line">
                    {{ \App\Support\I18n::pick($faq->answer, $faq->answer_fr) }}
                </p>
                <p class="eyebrow" style="margin-top:.7rem">{{ \App\Support\I18n::pick($faq->category, $faq->category_fr) }}</p>
            </details>
        @empty
            <p style="font-size:.9rem;color:var(--muted)">{{ is_fr() ? 'FAQ bientôt disponible.' : 'FAQ coming soon.' }}</p>
        @endforelse

        <div class="card" style="padding:1.5rem;margin-top:1.5rem">
            <p class="eyebrow">{{ t('faq.stillEyebrow') }}</p>
            <div style="display:flex;gap:.75rem;margin-top:1rem;flex-wrap:wrap">
                <a class="btn btn-secondary btn-sm" href="{{ route('contact') }}">{{ t('faq.contactCta') }}</a>
                <a class="btn btn-ghost btn-sm" href="{{ route('order.lookup.form') }}">{{ t('faq.trackCta') }}</a>
            </div>
        </div>
    </section>
@endsection
