<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::latest('date')
            ->with('user')
            ->get();

        return view('admin.appointments', compact('appointments'));
    }

    public function show(Appointment $appointment)
    {
        return view('admin.appointment-detail', compact('appointment'));
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $appointment->update($validated);

        // Notify customer
        $statusMessages = [
            'confirmed' => "Your appointment has been confirmed for {$appointment->date->format('M d, Y')} at {$appointment->time}.",
            'completed' => "Thank you for visiting OSSZ Collections!",
            'cancelled' => "Your appointment has been cancelled.",
        ];

        if (isset($statusMessages[$appointment->status])) {
            // Send WhatsApp notification
            $this->sendWhatsAppNotification($appointment, $statusMessages[$appointment->status]);
        }

        return back()->with('success', 'Appointment updated successfully.');
    }

    private function sendWhatsAppNotification(Appointment $appointment, string $message): void
    {
        $phone = preg_replace('/[^0-9]/', '', $appointment->customer_phone);
        if (substr($phone, 0, 3) !== '237') {
            $phone = '237' . $phone;
        }
        $url = "https://wa.me/{$phone}?text=" . urlencode($message);
        \Log::info("Appointment WhatsApp: {$url}");
    }
}
