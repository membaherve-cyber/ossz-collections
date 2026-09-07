@extends('layouts.admin')

@section('title', t('nav.journal'))

@section('content')
    <div style="display:grid;gap:1rem">
        @foreach ($posts as $post)
            <form method="POST" action="{{ route('admin.journal.save') }}" class="card" style="padding:1.3rem">
                @csrf
                <input type="hidden" name="id" value="{{ $post->id }}">
                <div class="form-grid cols-2">
                    <input class="field" name="title" value="{{ $post->title }}" required>
                    <input class="field" name="title_fr" value="{{ $post->title_fr }}">
                    <input class="field" name="slug" value="{{ $post->slug }}">
                    <input class="field" name="cover_image" value="{{ $post->cover_image }}" placeholder="/journal/cover.webp">
                    <input class="field" name="author_name" value="{{ $post->author_name }}">
                    <select class="field" name="status">
                        <option value="draft" @selected($post->status === 'draft')>{{ is_fr() ? 'Brouillon' : 'Draft' }}</option>
                        <option value="published" @selected($post->status === 'published')>{{ is_fr() ? 'Publié' : 'Published' }}</option>
                    </select>
                </div>
                <div class="form-grid cols-2" style="margin-top:.8rem">
                    <textarea class="field" name="excerpt" rows="2" placeholder="Excerpt EN">{{ $post->excerpt }}</textarea>
                    <textarea class="field" name="excerpt_fr" rows="2" placeholder="Excerpt FR">{{ $post->excerpt_fr }}</textarea>
                    <textarea class="field" name="body" rows="5" placeholder="Body EN">{{ $post->body }}</textarea>
                    <textarea class="field" name="body_fr" rows="5" placeholder="Body FR">{{ $post->body_fr }}</textarea>
                </div>
                <div style="display:flex;gap:.6rem;margin-top:.8rem">
                    <button class="btn btn-primary btn-sm" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save' }}</button>
                </div>
            </form>
        @endforeach

        <form method="POST" action="{{ route('admin.journal.save') }}" class="card" style="padding:1.3rem">
            @csrf
            <h3 style="font-size:.95rem;font-weight:400;margin-bottom:.8rem">+ {{ is_fr() ? 'Nouvel article' : 'New entry' }}</h3>
            <div class="form-grid cols-2">
                <input class="field" name="title" placeholder="Title EN" required>
                <input class="field" name="title_fr" placeholder="Title FR">
                <select class="field" name="status"><option value="draft">draft</option><option value="published">published</option></select>
                <input class="field" name="cover_image" placeholder="/journal/cover.webp">
            </div>
            <textarea class="field" name="excerpt" rows="2" placeholder="Excerpt" style="margin-top:.8rem"></textarea>
            <button class="btn btn-secondary btn-sm" style="margin-top:.8rem" type="submit">{{ is_fr() ? 'Créer' : 'Create' }}</button>
        </form>
    </div>
@endsection
