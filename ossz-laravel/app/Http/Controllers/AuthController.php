<?php

namespace App\Http\Controllers;

use App\Models\PasswordReset;
use App\Models\User;
use App\Support\Auth;
use App\Support\Cart;
use App\Support\Notify;
use Illuminate\Http\Request;

/**
 * Authentication — port of the auth server actions in src/lib/actions.ts.
 * Staff sign in with a short username, customers with email; both arrive
 * in the same field.
 */
class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login', ['next' => (string) request('next', '')]);
    }

    public function login(Request $request)
    {
        $identifier = trim((string) $request->input('email'));
        $password = (string) $request->input('password');
        $next = (string) $request->input('next');

        $user = $this->findByIdentifier($identifier);
        if (! $user || ! Auth::verifyPassword($password, $user->password_hash)) {
            return back()->with('error', 'Those details did not match our records.')->withInput();
        }

        Cart::mergeGuestCart($user->id);
        session(['user_id' => $user->id]);
        session()->regenerate();

        return redirect($next ?: ($user->role === 'customer' ? '/account' : '/admin'));
    }

    public function showRegister()
    {
        return view('auth.register', ['next' => (string) request('next', '/account')]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:160',
            'password' => 'required|min:6|max:120',
            'fullName' => 'nullable|string|max:120',
            'phone' => 'nullable|string|max:40',
        ]);
        $email = strtolower($validated['email']);
        if (User::where('email', $email)->exists()) {
            return back()->with('error', 'An account with that email already exists. Please sign in.')->withInput();
        }

        $user = User::create([
            'email' => $email,
            'phone' => $validated['phone'] ?? '',
            'full_name' => $validated['fullName'] ?? '',
            'password_hash' => Auth::hashPassword($validated['password']),
            'role' => 'customer',
        ]);

        Cart::mergeGuestCart($user->id);
        session(['user_id' => $user->id]);
        session()->regenerate();

        return redirect((string) $request->input('next', '/account'));
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    public function showForgot()
    {
        return view('auth.forgot-password');
    }

    public function requestReset(Request $request)
    {
        $email = strtolower(trim((string) $request->input('email')));
        $generic = 'If that address has an account, a reset link is on its way.';
        if (! str_contains($email, '@')) {
            return back()->with('error', 'Please enter a valid email address.');
        }

        $user = User::where('email', $email)->first();
        if ($user) {
            $token = bin2hex(random_bytes(24));
            PasswordReset::create([
                'user_id' => $user->id,
                'token' => $token,
                'expires_at' => now()->addHour(),
            ]);
            Notify::passwordReset($email, $user->full_name ?: 'customer', $token);
        }

        return back()->with('success', $generic);
    }

    public function showReset(Request $request)
    {
        return view('auth.reset-password', ['token' => (string) $request->input('token', '')]);
    }

    public function completeReset(Request $request)
    {
        $token = trim((string) $request->input('token'));
        $password = (string) $request->input('password');
        if (strlen($password) < 6) {
            return back()->with('error', 'Please choose a password of at least 6 characters.');
        }
        $reset = PasswordReset::where('token', $token)->first();
        if (! $reset || $reset->used_at || $reset->expires_at->isPast()) {
            return back()->with('error', 'That link has expired. Please request a new one.');
        }

        User::where('id', $reset->user_id)->update(['password_hash' => Auth::hashPassword($password)]);
        $reset->update(['used_at' => now()]);

        return redirect()->route('login')->with('success', 'Your password has been changed. You may now sign in.');
    }

    private function findByIdentifier(string $identifier): ?User
    {
        $id = strtolower($identifier);
        if ($id === '') {
            return null;
        }

        return User::where('username', $id)->orWhere('email', $id)->first();
    }
}
