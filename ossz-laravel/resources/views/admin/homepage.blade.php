@extends('layouts.admin')

@section('title', is_fr() ? 'Blocs d\'accueil' : 'Homepage blocks')

@section('content')
    <div style="display:grid;gap:1rem">
        @foreach ($blocks as $block)
            <form method="POST" action="{{ route('admin.homepage.save') }}" class="card" style="padding:1.3rem">
                @csrf
                <input type="hidden" name="id" value="{{ $block->id }}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem">
                    <span class="pill pill-blue">{{ $block->type }}</span>
                    <label style="font-size:.78rem;display:flex;gap:.4rem;align-items:center">
                        <input type="hidden" name="is_published" value="0">
                        <input type="checkbox" name="is_published" value="1" @checked($block->is_published)>
                        {{ is_fr() ? 'Publié' : 'Published' }}
                    </label>
                </div>
                <div class="form-grid cols-2">
                    <input class="field" name="type" value="{{ $block->type }}" placeholder="hero|banner|quote|editorial">
                    <input class="field" name="cta_href" value="{{ $block->cta_href }}" placeholder="/shop">
                    <input class="field" name="eyebrow" value="{{ $block->eyebrow }}" placeholder="Eyebrow EN">
                    <input class="field" name="eyebrow_fr" value="{{ $block->eyebrow_fr }}" placeholder="Eyebrow FR">
                    <input class="field" name="heading" value="{{ $block->heading }}" placeholder="Heading EN">
                    <input class="field" name="heading_fr" value="{{ $block->heading_fr }}" placeholder="Heading FR">
                    <input class="field" name="cta_label" value="{{ $block->cta_label }}" placeholder="CTA EN">
                    <input class="field" name="cta_label_fr" value="{{ $block->cta_label_fr }}" placeholder="CTA FR">
                    <input class="field" name="image_url" value="{{ $block->image_url }}" placeholder="/catalogue/hero.webp">
                    <input class="field" type="number" name="sort_order" value="{{ $block->sort_order }}">
                </div>
                <div class="form-grid cols-2" style="margin-top:.8rem">
                    <textarea class="field" name="body" rows="2" placeholder="Body EN">{{ $block->body }}</textarea>
                    <textarea class="field" name="body_fr" rows="2" placeholder="Body FR">{{ $block->body_fr }}</textarea>
                </div>
                <div style="display:flex;gap:.6rem;margin-top:.8rem">
                    <button class="btn btn-primary btn-sm" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save' }}</button>
                </div>
            </form>
        @endforeach

        <form method="POST" action="{{ route('admin.homepage.save') }}" class="card" style="padding:1.3rem">
            @csrf
            <h3 style="font-size:.95rem;font-weight:400;margin-bottom:.8rem">+ {{ is_fr() ? 'Nouveau bloc' : 'New block' }}</h3>
            <div class="form-grid cols-2">
                <select class="field" name="type">
                    <option value="hero">hero</option><option value="banner">banner</option>
                    <option value="quote">quote</option><option value="editorial">editorial</option>
                </select>
                <input class="field" name="cta_href" placeholder="/shop">
                <input class="field" name="heading" placeholder="Heading EN" required>
                <input class="field" name="heading_fr" placeholder="Heading FR">
                <input class="field" name="cta_label" placeholder="CTA EN">
                <input class="field" name="image_url" placeholder="/catalogue/hero.webp">
            </div>
            <button class="btn btn-secondary btn-sm" style="margin-top:.8rem" type="submit">{{ is_fr() ? 'Créer' : 'Create' }}</button>
        </form>
    </div>
@endsection
