<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;

class MediaController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.media', [
            'media' => Media::orderByDesc('created_at')->limit(200)->get(),
        ]);
    }

    public function upload(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $request->validate([
            'file' => 'required|file|max:51200',
            'tags' => 'nullable|string|max:200',
        ]);
        $file = $request->file('file');
        $path = $file->store('media', 'local_custom');
        Media::create([
            'url' => $path,
            'alt_text' => (string) $request->input('alt', ''),
            'tags' => (string) $request->input('tags', ''),
            'uploaded_by' => request()->attributes->get('ossz_user')->id,
        ]);

        return back()->with('success', 'File uploaded to storage: '.$path);
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::canManageCatalogue($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Insufficient permissions.'));
        }
    }
}
