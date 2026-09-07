<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Support\Notify;

class AppointmentController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.appointments', [
            'appointments' => Appointment::orderByDesc('slot_start')->limit(200)->get(),
        ]);
    }

    public function update(\Illuminate\Http\Request $request, Appointment $appointment)
    {
        $this->guard();
        $request->validate(['status' => 'required|in:requested,confirmed,completed,cancelled']);
        $appointment->update(['status' => $request->input('status')]);
        Notify::appointmentStatusChanged($appointment);

        return back()->with('success', 'Appointment '.$appointment->reference.' → '.status_label($appointment->status).'.');
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::canFulfilOrders($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Insufficient permissions.'));
        }
    }
}
