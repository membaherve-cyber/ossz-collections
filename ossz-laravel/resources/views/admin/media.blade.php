@extends('layouts.admin')

@section('title', is_fr() ? 'Médias' : 'Media')

@section('content')
    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
        <div class="card" style="padding:1.2rem">
            <table class="table">
                <thead><tr><th>Fichier</th><th>Tags</th><th>{{ is_fr() ? 'Ajouté' : 'Added' }}</th></tr></thead>
                <tbody>
                    @forelse ($media as $item)
                        <tr>
                            <td style="font-size:.8rem;word-break:break-all">{{ $item->url }}</td>
                            <td style="font-size:.75rem">{{ $item->tags }}</td>
                            <td style="font-size:.75rem">{{ format_date($item->created_at) }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="3" style="color:var(--muted)">{{ is_fr() ? 'Aucun média.' : 'No media.' }}</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <form method="POST" action="{{ route('admin.media.upload') }}" class="card" style="padding:1.5rem" enctype="multipart/form-data">
            @csrf
            <h3 style="font-size:.95rem;font-weight:400">{{ is_fr() ? 'Téléverser un fichier' : 'Upload file' }}</h3>
            <div class="form-grid" style="margin-top:1rem">
                <input class="field" type="file" name="file" required>
                <input class="field" name="tags" placeholder="{{ is_fr() ? 'Tags (séparés par virgule)' : 'Tags (comma separated)' }}">
                <button class="btn btn-primary btn-sm" type="submit">{{ is_fr() ? 'Téléverser' : 'Upload' }}</button>
            </div>
            <p style="font-size:.72rem;color:var(--muted);margin-top:.8rem">
                {{ is_fr() ? 'Les fichiers vont dans storage/app/media — servez-les via le dossier public de votre hébergeur ou un lien symbolique.'
                   : 'Files land in storage/app/media — serve them from your host\'s public folder or a symlink.' }}
            </p>
        </form>
    </div>
@endsection
