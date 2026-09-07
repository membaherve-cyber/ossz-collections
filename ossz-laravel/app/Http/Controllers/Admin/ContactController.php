<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Support\Notify;

class ContactController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.contact', [
            'messages' => ContactMessage::orderByDesc('created_at')->limit(200)->get(),
        ]);
    }

    public function reply(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $data = $request->validate([
            'messageId' => 'required|integer',
            'reply' => 'required|string|max:4000',
        ]);
        $message = ContactMessage::findOrFail((int) $data['messageId']);
        $message->update(['handled' => true]);

        if (str_contains($message->contact, '@')) {
            Notify::email(
                $message->contact,
                'OSSZ Collections — regarding your message',
                "Dear {$message->name},\n\nThank you for reaching out to OSSZ Collections.\n\n{$data['reply']}\n\nWith warm regards,\nOSSZ Collections\nAnge Raphael, Douala, Cameroon"
            );
        }
        if (strlen(preg_replace('/\D/', '', $message->contact) ?? '') >= 7) {
            Notify::whatsapp($message->contact, "Hello {$message->name}, thank you for your message. {$data['reply']}");
        }

        return back()->with('success', "Your reply has been sent to {$message->name}.");
    }

    public function markHandled(\Illuminate\Http\Request $request)
    {
        $this->guard();
        ContactMessage::where('id', (int) $request->input('id'))->update(['handled' => true]);

        return back()->with('success', 'Marked as handled.');
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::canFulfilOrders($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Insufficient permissions.'));
        }
    }
}
