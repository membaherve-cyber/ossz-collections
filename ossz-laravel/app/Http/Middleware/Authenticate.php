<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Authenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->session()->get('user_id');
        if (! $userId) {
            return redirect()->route('login')->with('error', 'Please sign in to continue.');
        }

        $user = \App\Models\User::find($userId);
        if (! $user || in_array($user->role, ['customer', 'uploader'])) {
            $request->session()->forget('user_id');
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        $request->setUserResolver(fn () => $user);
        return $next($request);
    }
}
