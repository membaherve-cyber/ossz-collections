<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiGap;

class AiGapController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.ai-gaps', [
            'gaps' => AiGap::orderByDesc('created_at')->limit(200)->get(),
        ]);
    }

    public function resolve(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $data = $request->validate([
            'id' => 'required|integer',
            'resolved_answer' => 'required|string|max:4000',
        ]);
        AiGap::where('id', (int) $data['id'])->update([
            'resolved_answer' => $data['resolved_answer'],
            'resolved_by' => request()->attributes->get('ossz_user')->id,
            'status' => 'resolved',
        ]);

        return back()->with('success', 'Gap resolved.');
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::canFulfilOrders($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Insufficient permissions.'));
        }
    }
}
