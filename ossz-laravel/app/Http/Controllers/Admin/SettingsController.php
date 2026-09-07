<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Auth;
use App\Support\Settings;

class SettingsController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.settings', ['settings' => Settings::all()]);
    }

    public function save(\Illuminate\Http\Request $request)
    {
        $this->guard();
        foreach (array_keys(Settings::DEFAULTS) as $key) {
            if ($request->has($key)) {
                Settings::put($key, (string) $request->input($key));
            }
        }

        return back()->with('success', 'Settings saved.');
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! Auth::isAdmin($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Admins only.'));
        }
    }
}
