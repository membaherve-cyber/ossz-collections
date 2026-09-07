@extends('layouts.admin')

@section('title', t('nav.collections'))

@section('content')
    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
        <div class="card" style="padding:1.5rem">
            <table class="table">
                <thead><tr><th>{{ is_fr() ? 'Nom' : 'Name' }}</th><th>{{ is_fr() ? 'Saison' : 'Season' }}</th><th>{{ is_fr() ? 'Pièces' : 'Pieces' }}</th><th></th></tr></thead>
                <tbody>
                    @forelse ($collections as $collection)
                        <tr>
                            <td><strong style="font-size:.85rem">{{ $collection->name }}</strong><br><span style="font-size:.72rem;color:var(--muted)">{{ $collection->name_fr }}</span></td>
                            <td>{{ $collection->season }}</td>
                            <td>{{ $collection->products()->count() }}</td>
                            <td>
                                <form method="POST" action="{{ route('admin.collections.destroy', $collection) }}">
                                    @csrf
                                    <button class="btn btn-ghost btn-sm" type="submit">✕</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="4" style="color:var(--muted)">{{ is_fr() ? 'Aucune collection.' : 'No collections.' }}</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="card" style="padding:1.5rem">
            <h3 style="font-size:.95rem;font-weight:400">{{ is_fr() ? 'Nouvelle collection' : 'New collection' }}</h3>
            <form method="POST" action="{{ route('admin.collections.store') }}" class="form-grid" style="margin-top:1rem">
                @csrf
                <input class="field" name="name" placeholder="{{ is_fr() ? 'Nom (EN)' : 'Name (EN)' }}" required>
                <input class="field" name="name_fr" placeholder="{{ is_fr() ? 'Nom (FR)' : 'Name (FR)' }}">
                <input class="field" name="season" placeholder="{{ is_fr() ? 'Saison (ex. 2026)' : 'Season (e.g. 2026)' }}">
                <input class="field" name="cover_image" placeholder="/collections/cover.webp">
                <textarea class="field" name="description" rows="2" placeholder="{{ is_fr() ? 'Description' : 'Description' }}"></textarea>
                <button class="btn btn-primary btn-sm" type="submit">{{ is_fr() ? 'Créer' : 'Create' }}</button>
            </form>
        </div>
    </div>
@endsection
