@extends('layouts.app')

@section('title', t('look.title'))

@section('content')
    <section class="wrap" style="padding:3rem 0 1rem;text-align:center">
        <p class="eyebrow">{{ t('look.eyebrow') }}</p>
        <h1 class="display" style="font-size:1.8rem">{{ t('look.title') }}</h1>
        <p style="margin-top:.8rem;font-size:.9rem;color:var(--ink-soft)">{{ t('look.intro') }}</p>
    </section>

    <section class="wrap grid grid-3" style="padding-bottom:4rem">
        @foreach ($looks as $look)
            <figure>
                <div class="photo-frame" style="aspect-ratio:3/4">
                    @if ($look->media_type === 'video' && $look->video_url)
                        <video src="{{ $look->video_url }}" poster="{{ $look->poster_url }}" muted playsinline preload="metadata" controls></video>
                    @elseif ($look->image_url)
                        <img src="{{ $look->image_url }}" alt="{{ $look->title }}" loading="lazy">
                    @endif
                </div>
                <figcaption style="margin-top:.5rem;font-size:.72rem;color:var(--muted)">
                    {{ \App\Support\I18n::pick($look->caption, $look->caption_fr) }}
                    @if ($look->product_slug)
                        · <a class="link-underline" href="{{ route('product.show', $look->product_slug) }}">{{ t('look.shop') }}</a>
                    @endif
                </figcaption>
            </figure>
        @endforeach
    </section>
@endsection
