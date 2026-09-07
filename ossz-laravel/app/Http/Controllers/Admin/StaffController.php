<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\Auth;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.staff', [
            'staff' => User::whereIn('role', ['uploader', 'staff', 'admin'])->orderBy('role')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->guard();
        $data = $request->validate([
            'email' => 'required|email|max:160',
            'username' => 'nullable|string|max:40|unique:users,username',
            'fullName' => 'required|string|max:120',
            'role' => 'required|in:uploader,staff,admin',
            'password' => 'required|min:6|max:120',
        ]);
        $email = strtolower($data['email']);
        if (User::where('email', $email)->exists()) {
            return back()->with('error', 'That email already has an account.');
        }
        $user = User::create([
            'email' => $email,
            'username' => $data['username'] ?? null,
            'full_name' => $data['fullName'],
            'role' => $data['role'],
            'password_hash' => Auth::hashPassword($data['password']),
        ]);
        AuditLog::create([
            'actor_id' => request()->attributes->get('ossz_user')->id,
            'actor_email' => request()->attributes->get('ossz_user')->email,
            'action' => 'staff.create',
            'detail' => "Created {$user->role} account for {$user->email}",
        ]);

        return back()->with('success', "Account for {$user->email} created.");
    }

    public function updateRole(Request $request)
    {
        $this->guard();
        $request->validate(['user_id' => 'required|integer', 'role' => 'required|in:customer,uploader,staff,admin']);
        $user = User::findOrFail((int) $request->input('user_id'));
        $user->update(['role' => $request->input('role')]);
        AuditLog::create([
            'actor_id' => request()->attributes->get('ossz_user')->id,
            'actor_email' => request()->attributes->get('ossz_user')->email,
            'action' => 'staff.role',
            'detail' => "{$user->email} is now {$user->role}",
        ]);

        return back()->with('success', "Role for {$user->email} updated.");
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! Auth::isAdmin($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Admins only.'));
        }
    }
}
