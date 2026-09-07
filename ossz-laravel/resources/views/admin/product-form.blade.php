@extends('layouts.admin')

@section('title', $product->exists ? (is_fr() ? 'Modifier' : 'Edit').': '.$product->name : (is_fr() ? 'Nouvelle pièce' : 'New product'))

@section('content')
    <form method="POST" action="{{ $product->exists ? route('admin.products.update', $product) : route('admin.products.store') }}"
          style="display:grid;gap:1.2rem;max-width:820px">
        @csrf

        <div class="card" style="padding:1.5rem">
            <div class="form-grid cols-2">
                <div>
                    <label class="label">{{ is_fr() ? 'Nom (EN)' : 'Name (EN)' }} *</label>
                    <input class="field" name="name" required value="{{ old('name', $product->name) }}">
                </div>
                <div>
                    <label class="label">{{ is_fr() ? 'Nom (FR)' : 'Name (FR)' }}</label>
                    <input class="field" name="name_fr" value="{{ old('name_fr', $product->name_fr) }}">
                </div>
            </div>
            <div style="margin-top:1rem">
                <label class="label">{{ is_fr() ? 'Description (EN)' : 'Description (EN)' }}</label>
                <textarea class="field" name="description" rows="3">{{ old('description', $product->description) }}</textarea>
            </div>
            <div style="margin-top:1rem">
                <label class="label">{{ is_fr() ? 'Description (FR)' : 'Description (FR)' }}</label>
                <textarea class="field" name="description_fr" rows="3">{{ old('description_fr', $product->description_fr) }}</textarea>
            </div>
            <div class="form-grid cols-2" style="margin-top:1rem">
                <div>
                    <label class="label">{{ is_fr() ? 'Détails / matière (EN)' : 'Details / fabric (EN)' }}</label>
                    <textarea class="field" name="details" rows="2">{{ old('details', $product->details) }}</textarea>
                </div>
                <div>
                    <label class="label">Détails (FR)</label>
                    <textarea class="field" name="details_fr" rows="2">{{ old('details_fr', $product->details_fr) }}</textarea>
                </div>
            </div>
            <div class="form-grid cols-2" style="margin-top:1rem">
                <div>
                    <label class="label">{{ is_fr() ? 'Entretien (EN)' : 'Care (EN)' }}</label>
                    <textarea class="field" name="care_instructions" rows="2">{{ old('care_instructions', $product->care_instructions) }}</textarea>
                </div>
                <div>
                    <label class="label">Entretien (FR)</label>
                    <textarea class="field" name="care_instructions_fr" rows="2">{{ old('care_instructions_fr', $product->care_instructions_fr) }}</textarea>
                </div>
            </div>
        </div>

        <div class="card" style="padding:1.5rem">
            <div class="form-grid cols-2">
                <div>
                    <label class="label">{{ is_fr() ? 'Catégorie' : 'Category' }}</label>
                    <select class="field" name="category_id">
                        <option value="">—</option>
                        @foreach ($categories as $cat)
                            <option value="{{ $cat->id }}" @selected(old('category_id', $product->category_id) == $cat->id)>{{ $cat->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="label">{{ is_fr() ? 'Collection' : 'Collection' }}</label>
                    <select class="field" name="collection_id">
                        <option value="">—</option>
                        @foreach ($collections as $col)
                            <option value="{{ $col->id }}" @selected(old('collection_id', $product->collection_id) == $col->id)>{{ $col->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="label">{{ is_fr() ? 'Prix de base (FCFA)' : 'Base price (FCFA)' }} *</label>
                    <input class="field" type="number" name="base_price" min="0" required value="{{ old('base_price', $product->base_price) }}">
                </div>
                <div>
                    <label class="label">SEO</label>
                    <input class="field" name="seo_title" value="{{ old('seo_title', $product->seo_title) }}">
                </div>
            </div>
            <div style="display:flex;gap:1.5rem;margin-top:1rem;font-size:.85rem">
                <label style="display:flex;gap:.5rem;align-items:center">
                    <input type="hidden" name="is_published" value="0">
                    <input type="checkbox" name="is_published" value="1" @checked(old('is_published', $product->is_published ?? true))>
                    {{ is_fr() ? 'Publié' : 'Published' }}
                </label>
                <label style="display:flex;gap:.5rem;align-items:center">
                    <input type="hidden" name="is_featured" value="0">
                    <input type="checkbox" name="is_featured" value="1" @checked(old('is_featured', $product->is_featured))>
                    {{ is_fr() ? 'Vedette' : 'Featured' }}
                </label>
            </div>
        </div>

        <div style="display:flex;gap:.8rem">
            <button class="btn btn-primary" type="submit">{{ $product->exists ? (is_fr() ? 'Enregistrer' : 'Save') : (is_fr() ? 'Créer' : 'Create') }}</button>
            <a class="btn btn-ghost" href="{{ route('admin.products.index') }}">← {{ is_fr() ? 'Catalogue' : 'Back' }}</a>
        </div>
    </form>

    @if ($product->exists)
        <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:2rem;align-items:start">
            <div class="card" style="padding:1.5rem">
                <h3 style="font-size:.95rem;font-weight:400">{{ is_fr() ? 'Variantes' : 'Variants' }}</h3>
                <table class="table" style="margin-top:.8rem">
                    <thead><tr><th>{{ t('buy.size') }}</th><th>{{ t('buy.colour') }}</th><th>{{ is_fr() ? 'Stock' : 'Stock' }}</th><th>Prix</th><th></th></tr></thead>
                    <tbody>
                        @forelse ($product->variants as $v)
                            <tr>
                                <td>{{ $v->size }}</td><td>{{ $v->colour }}</td><td>{{ $v->stock_qty }}</td>
                                <td>{{ $v->price_override ? format_xaf($v->price_override) : '—' }}</td>
                                <td>
                                    <form method="POST" action="{{ route('admin.products.variants.delete', $v) }}">
                                        @csrf
                                        <button class="btn btn-ghost btn-sm" type="submit">✕</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="5" style="color:var(--muted);font-size:.8rem">{{ is_fr() ? 'Aucune variante.' : 'No variants.' }}</td></tr>
                        @endforelse
                    </tbody>
                </table>

                <form method="POST" action="{{ route('admin.products.variants.add', $product) }}" class="form-grid cols-2" style="margin-top:1rem">
                    @csrf
                    <input class="field" name="size" placeholder="M" required>
                    <input class="field" name="colour" placeholder="Ivory" required>
                    <input class="field" type="number" name="stock_qty" min="0" placeholder="Stock" required>
                    <input class="field" type="number" name="price_override" min="0" placeholder="{{ is_fr() ? 'Prix (optionnel)' : 'Price override' }}">
                    <button class="btn btn-secondary btn-sm" type="submit">+ {{ is_fr() ? 'Variante' : 'Variant' }}</button>
                </form>
            </div>

            <div class="card" style="padding:1.5rem">
                <h3 style="font-size:.95rem;font-weight:400">{{ is_fr() ? 'Images' : 'Images' }}</h3>
                <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.8rem">
                    @forelse ($product->images as $img)
                        <div style="position:relative;width:90px">
                            <div class="photo-frame" style="aspect-ratio:1"><img src="{{ $img->url }}" alt="{{ $img->alt_text }}"></div>
                            <form method="POST" action="{{ route('admin.products.images.delete', $img) }}" style="position:absolute;top:2px;right:2px">
                                @csrf
                                <button class="btn btn-sm" style="background:#1b1917;color:#fff;padding:.15rem .4rem" type="submit">✕</button>
                            </form>
                        </div>
                    @empty
                        <p style="font-size:.8rem;color:var(--muted)">{{ is_fr() ? 'Aucune image.' : 'No images.' }}</p>
                    @endforelse
                </div>

                <form method="POST" action="{{ route('admin.products.images.add', $product) }}" class="form-grid" style="margin-top:1rem">
                    @csrf
                    <input class="field" name="url" placeholder="/catalogue/piece.webp or https://…" required>
                    <input class="field" name="alt_text" placeholder="alt text">
                    <button class="btn btn-secondary btn-sm" type="submit">+ {{ is_fr() ? 'Image' : 'Image' }}</button>
                </form>
            </div>
        </div>
    @endif
@endsection
