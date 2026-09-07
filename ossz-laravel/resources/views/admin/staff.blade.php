@extends('layouts.admin')

@section('title', is_fr() ? 'Équipe' : 'Staff')

@section('content')
    <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
        <div class="card" style="padding:1.2rem">
            <table class="table">
                <thead><tr><th>Email</th><th>{{ is_fr() ? 'Nom' : 'Name' }}</th><th>{{ is_fr() ? 'Rôle' : 'Role' }}</th><th></th></tr></thead>
                <tbody>
                    @forelse ($staff as $member)
                        <tr>
                            <td style="font-size:.85rem">{{ $member->email }}@if($member->username)<br><span style="font-size:.72rem;color:var(--muted)">{{ $member->username }}</span>@endif</td>
                            <td>{{ $member->full_name }}</td>
                            <td>
                                <form method="POST" action="{{ route('admin.staff.role') }}" class="inline-form" style="display:flex;gap:.4rem">
                                    @csrf
                                    <input type="hidden" name="user_id" value="{{ $member->id }}">
                                    <select class="field" style="width:auto;padding:.3rem .4rem;font-size:.75rem" name="role">
                                        @foreach (['uploader', 'staff', 'admin'] as $role)
                                            <option value="{{ $role }}" @selected($member->role === $role)>{{ $role }}</option>
                                        @endforeach
                                    </select>
                                    <button class="btn btn-secondary btn-sm" type="submit">✓</button>
                                </form>
                            </td>
                            <td style="font-size:.75rem;color:var(--muted)">{{ format_date($member->created_at) }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="4" style="color:var(--muted)">{{ is_fr() ? 'Aucun membre.' : 'No staff.' }}</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="card" style="padding:1.5rem">
            <h3 style="font-size:.95rem;font-weight:400">+ {{ is_fr() ? 'Nouveau compte' : 'New account' }}</h3>
            <form method="POST" action="{{ route('admin.staff.store') }}" class="form-grid" style="margin-top:1rem">
                @csrf
                <input class="field" type="email" name="email" placeholder="email" required>
                <input class="field" name="username" placeholder="{{ is_fr() ? 'Identifiant court (staff)' : 'Short username (staff)' }}">
                <input class="field" name="fullName" placeholder="{{ is_fr() ? 'Nom complet' : 'Full name' }}" required>
                <select class="field" name="role">
                    <option value="uploader">uploader</option>
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                </select>
                <input class="field" type="password" name="password" minlength="6" placeholder="password" required>
                <button class="btn btn-primary btn-sm" type="submit">{{ is_fr() ? 'Créer' : 'Create' }}</button>
            </form>
        </div>
    </div>
@endsection
