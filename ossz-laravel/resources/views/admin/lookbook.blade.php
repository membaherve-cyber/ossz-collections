@extends('layouts.admin')

@section('title', t('nav.lookbook'))

@section('content')
    <div style="display:grid;gap:1rem">
        @foreach ($looks as $look)
            <form method="POST" action="{{ route('admin.lookbook.save') }}" class="card" style="padding:1.3rem">
                @csrf
                <input type="hidden" name="id" value="{{ $look->id }}">
                <div style="display:flex;gap:1rem;flex-wrap:wrap">
                    <div class="photo-frame" style="width:110px;aspect-ratio:3/4;flex-shrink:0">
                        @if ($look->media_type === 'video' && $look->poster_url)
                            <img src="{{ $look->poster_url }}" alt="">
                        @elseif ($look->image_url)
                            <img src="{{ $look->image_url }}" alt="">
                        @endif
                    </div>
                    <div style="flex:1;min-width:260px">
                        <div class="form-grid cols-2">
                            <input class="field" name="title" value="{{ $look->title }}" placeholder="Title">
                            <select class="field" name="media_type">
                                <option value="image" @selected($look->media_type === 'image')>image</option>
                                <option value="video" @selected($look->media_type === 'video')>video</option>
                            </select>
                            <input class="field" name="image_url" value="{{ $look->image_url }}" placeholder="Image URL">
                            <input class="field" name="video_url" value="{{ $look->video_url }}" placeholder="Video URL">
                            <input class="field" name="poster_url" value="{{ $look->poster_url }}" placeholder="Poster URL">
                            <input class="field" name="product_slug" value="{{ $look->product_slug }}" placeholder="product-slug">
                            <input class="field" type="number" name="sort_order" value="{{ $look->sort_order }}">
                        </div>
                        <div class="form-grid cols-2" style="margin-top:.8rem">
                            <input class="field" name="caption" value="{{ $look->caption }}" placeholder="Caption EN">
                            <input class="field" name="caption_fr" value="{{ $look->caption_fr }}" placeholder="Caption FR">
                        </div>
                        <button class="btn btn-primary btn-sm" style="margin-top:.8rem" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save' }}</button>
                    </div>
                </div>
            </form>
        @endforeach

        <div class="grid" style="grid-template-columns:1fr 1fr">
            <form method="POST" action="{{ route('admin.lookbook.save') }}" class="card" style="padding:1.3rem">
                @csrf
                <h3 style="font-size:.95rem;font-weight:400;margin-bottom:.8rem">+ {{ is_fr() ? 'Nouveau look' : 'New look' }}</h3>
                <div class="form-grid">
                    <input class="field" name="title" placeholder="Title">
                    <input class="field" name="image_url" placeholder="Image URL" required>
                    <input class="field" name="caption" placeholder="Caption">
                    <input class="field" name="product_slug" placeholder="product-slug">
                    <button class="btn btn-secondary btn-sm" type="submit">{{ is_fr() ? 'Créer' : 'Create' }}</button>
                </div>
            </form>

            <form method="POST" action="{{ route('admin.lookbook.upload') }}" class="card" style="padding:1.3rem" enctype="multipart/form-data">
                @csrf
                <h3 style="font-size:.95rem;font-weight:400;margin-bottom:.8rem">{{ is_fr() ? 'Téléverser une vidéo' : 'Upload video' }}</h3>
                <div class="form-grid">
                    <input class="field" type="file" name="video" accept="video/mp4,video/webm,video/quicktime" required>
                    <button class="btn btn-secondary btn-sm" type="submit">{{ is_fr() ? 'Téléverser' : 'Upload' }}</button>
                </div>
                @if (session('uploaded_path'))
                    <p style="font-size:.75rem;margin-top:.6rem;color:var(--ink-soft)">{{ session('uploaded_path') }}</p>
                @endif
            </form>
        </div>
    </div>
@endsection
