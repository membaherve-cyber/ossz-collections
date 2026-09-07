@extends('layouts.app')

@section('title', \App\Support\I18n::pick($post->title, $post->title_fr))

@section('content')
    <article class="wrap" style="padding:3rem 0;max-width:760px">
        <a class="btn btn-ghost btn-sm" href="{{ route('journal.index') }}">{{ t('jour.all') }}</a>

        <h1 class="display" style="font-size:2rem;margin-top:1rem">{{ \App\Support\I18n::pick($post->title, $post->title_fr) }}</h1>
        <p class="card-meta" style="margin-top:.5rem">{{ format_date($post->published_at) }} · {{ $post->author_name }}</p>

        @if ($post->cover_image)
            <div class="photo-frame" style="aspect-ratio:16/9;margin:2rem 0">
                <img src="{{ $post->cover_image }}" alt="{{ \App\Support\I18n::pick($post->title, $post->title_fr) }}">
            </div>
        @endif

        <div style="font-size:.95rem;line-height:1.85;color:var(--ink-soft);white-space:pre-line">
            {{ \App\Support\I18n::pick($post->body, $post->body_fr) }}
        </div>
    </article>
@endsection
