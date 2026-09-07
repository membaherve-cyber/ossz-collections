<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();
        if (! $user) return redirect()->route('login');
        if (in_array($user->role, $roles)) return $next($request);
        return redirect()->route('admin.dashboard')->with('error', 'Insufficient permissions.');
    }
}
