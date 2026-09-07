@extends('layouts.app')

@section('title', t('jour.title'))

@section('content')
    <section class="wrap" style="padding:3rem 0 1rem">
        <h1 class="display" style="font-size:1.8rem">{{ t('jour.title') }}</h1>
    </section>

    <section class="wrap grid grid-3" style="padding-bottom:4rem">
        @forelse ($posts as $post)
            <a href="{{ route('journal.show', $post->slug) }}" class="product-card">
                <div class="photo-frame" style="aspect-ratio:4/3">
                    @if ($post->cover_image)<img src="{{ $post->cover_image }}" alt="{{ $post->title }}" loading="lazy">@endif
                </div>
                <div class="card-body">
                    <h2 class="display" style="font-size:1.15rem">{{ \App\Support\I18n::pick($post->title, $post->title_fr) }}</h2>
                    <p class="card-meta">{{ format_date($post->published_at) }} · {{ $post->author_name }}</p>
                    <p style="margin-top:.4rem;font-size:.82rem;color:var(--ink-soft)">{{ \App\Support\I18n::pick($post->excerpt, $post->excerpt_fr) }}</p>
                </div>
            </a>
        @empty
            <p style="grid-column:1/-1;font-size:.9rem;color:var(--muted)">
                {{ is_fr() ? 'Les premiers articles arrivent bientôt.' : 'The first entries are on their way.' }}
            </p>
        @endforelse
    </section>
@endsection
