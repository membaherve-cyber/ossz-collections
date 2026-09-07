<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role-aware authentication guards.
 *
 * - auth.customer: any signed-in user reaches /account.
 * - auth.admin: uploader/staff/admin reach /admin; the per-page guard()
 *   helper narrows further (staff see orders, uploaders see catalogue,
 *   admins see everything) exactly like src/lib/guard.ts.
 */
class Authenticate
{
    public function handle(Request $request, Closure $next, string $area = 'admin'): Response
    {
        $user = \App\Models\User::find(session('user_id'));

        if (! $user) {
            return redirect()->route('login')
                ->with('error', 'Please sign in to continue.')
                ->withIntended($request->fullUrl());
        }

        $allowed = match ($area) {
            'customer' => true,
            'admin' => \App\Support\Auth::canEnterBackOffice($user->role),
            default => false,
        };

        if (! $allowed) {
            if ($area === 'admin') {
                return redirect()->route('home')->with('error', 'You do not have backoffice access.');
            }
            session()->forget('user_id');

            return redirect()->route('login')->with('error', 'Please sign in to continue.');
        }

        $request->attributes->set('ossz_user', $user);
        view()->share('osszUser', $user);

        return $next($request);
    }
}
