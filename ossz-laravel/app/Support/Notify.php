<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;

/**
 * Transactional messaging — port of src/lib/notify.ts.
 *
 * Every message is written to `notifications` first, then delivery is
 * attempted. Without a provider key the row stays queued: staff see
 * exactly what should go out, and the WhatsApp deep link on the order
 * page lets them send it by hand.
 */
final class Notify
{
    public static function email(string $to, string $subject, string $body, ?int $orderId = null, ?int $appointmentId = null): void
    {
        $key = env('RESEND_API_KEY');
        if (! $key) {
            self::record($orderId, $appointmentId, 'email', $to, $subject, $body, 'queued');

            return;
        }

        try {
            $res = \Http::withToken($key)->timeout(8)
                ->post('https://api.resend.com/emails', [
                    'from' => env('RESEND_FROM', 'OSSZ Collections <hello@osszcollections.cm>'),
                    'to' => [$to],
                    'subject' => $subject,
                    'text' => $body,
                ]);
            self::record($orderId, $appointmentId, 'email', $to, $subject, $body, $res->successful() ? 'sent' : 'failed', $res->successful() ? '' : 'HTTP '.$res->status());
        } catch (\Throwable $e) {
            self::record($orderId, $appointmentId, 'email', $to, $subject, $body, 'failed', substr($e->getMessage(), 0, 200));
        }
    }

    /** Queue the WhatsApp copy for staff to send via the wa.me deep link. */
    public static function whatsapp(string $to, string $body, ?int $orderId = null, ?int $appointmentId = null): void
    {
        self::record($orderId, $appointmentId, 'whatsapp', $to, '', $body, 'queued');
    }

    public static function orderPlaced(int $orderId): void
    {
        $order = Order::find($orderId);
        if (! $order) {
            return;
        }
        $items = OrderItem::where('order_id', $orderId)->get();
        $settings = Settings::all();

        $itemLines = $items->map(fn ($it) =>
            "  • {$it->product_name} ({$it->variant_label}) × {$it->quantity}  —  ".format_xaf($it->unit_price * $it->quantity)
        )->implode("\n");
        $itemCount = $items->sum('quantity');

        $emailBody = implode("\n", [
            "Dear {$order->customer_name},",
            '',
            'Thank you for your order with OSSZ Collections.',
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            "  ORDER  {$order->order_number}",
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            '',
            "Items ({$itemCount}):",
            $itemLines,
            '',
            '───────────────────────────────────────────',
            '  Subtotal:      '.format_xaf($order->subtotal),
            $order->discount > 0 ? '  Discount:      −'.format_xaf($order->discount) : null,
            '  Delivery:      '.($order->delivery_fee == 0 ? 'Complimentary' : format_xaf($order->delivery_fee)),
            '  TOTAL:         '.format_xaf($order->total),
            '───────────────────────────────────────────',
            '',
            'Payment method: '.ucwords(str_replace('_', ' ', $order->payment_method)),
            'Delivery:       '.delivery_label($order->delivery_method).' — '.$order->delivery_zone,
            '',
            'Track your order at any time:',
            url("/order/{$order->order_number}"),
            '',
            "If you have any questions, reply to this email or message us on WhatsApp at {$settings['whatsapp_number']}.",
            '',
            'With warm regards,',
            "OSSZ Collections · {$settings['store_address']}",
        ]);

        self::email($order->guest_email, "Your OSSZ order {$order->order_number} — ".format_xaf($order->total), $emailBody, $orderId);

        if ($order->guest_phone) {
            $wa = implode("\n", [
                '🛍️ *OSSZ Collections — Order Confirmation*',
                '',
                "Hi {$order->customer_name},",
                '',
                'Thank you for your order! Here are the details:',
                '',
                "📋 *Order:* {$order->order_number}",
                '',
                '*Items:*',
                ...$items->map(fn ($it) => "• {$it->product_name} ({$it->variant_label}) × {$it->quantity} — ".format_xaf($it->unit_price * $it->quantity))->all(),
                '',
                '💰 Subtotal: '.format_xaf($order->subtotal),
                $order->discount > 0 ? '🏷️ Discount: −'.format_xaf($order->discount) : null,
                '🚚 Delivery: '.($order->delivery_fee == 0 ? 'Complimentary' : format_xaf($order->delivery_fee)),
                '💰 *TOTAL: '.format_xaf($order->total).' (FCFA)*',
                '',
                'Payment: '.ucwords(str_replace('_', ' ', $order->payment_method)),
                'Track anytime: '.url("/order/{$order->order_number}"),
                '',
                "— OSSZ Collections, {$settings['store_address']}",
            ]);
            self::whatsapp($order->guest_phone, $wa, $orderId);
        }
    }

    public static function orderStatusChanged(Order $order, string $oldStatus): void
    {
        $lines = [
            'en' => [
                'placed' => 'We have received your order and it is being prepared.',
                'processing' => 'Your order is being prepared in our Ange Raphael atelier.',
                'ready' => 'Your order is ready.',
                'out_for_delivery' => 'Your order is on its way to you.',
                'delivered' => 'Your order has been delivered. We hope you love it.',
                'returned' => 'Your return has been received.',
                'cancelled' => 'Your order has been cancelled.',
            ],
            'fr' => [
                'placed' => 'Nous avons bien reçu votre commande, elle est en préparation.',
                'processing' => 'Votre commande est en préparation dans notre atelier d\'Ange Raphael.',
                'ready' => 'Votre commande est prête.',
                'out_for_delivery' => 'Votre commande est en route.',
                'delivered' => 'Votre commande a été livrée. Nous espérons qu\'elle vous plaira.',
                'returned' => 'Votre retour a bien été reçu.',
                'cancelled' => 'Votre commande a été annulée.',
            ],
        ];

        $locale = is_fr() ? 'fr' : 'en';
        $line = $lines[$locale][$order->status] ?? status_label($order->status);
        $track = url("/order/{$order->order_number}");

        self::email(
            $order->guest_email,
            "OSSZ order {$order->order_number} — ".status_label($order->status),
            "Dear {$order->customer_name},\n\n{$line}\n\nTrack your order: {$track}\n\nWith warm regards,\nOSSZ Collections",
            $order->id
        );

        if ($order->guest_phone) {
            self::whatsapp(
                $order->guest_phone,
                "📦 OSSZ Collections — order {$order->order_number} is now *".status_label($order->status)."*.\n\n{$line}\n\nTrack: {$track}",
                $order->id
            );
        }
    }

    public static function appointmentRequested(Appointment $appointment): void
    {
        $when = $appointment->slot_start->format('d M Y · H:i');
        $ref = $appointment->reference;

        self::email(
            $appointment->guest_contact,
            "OSSZ appointment request {$ref}",
            "Dear {$appointment->guest_name},\n\nWe have received your request for a {$appointment->service} on {$when}.\nYour reference is {$ref}. Our stylist will confirm shortly.\n\nWith warm regards,\nOSSZ Collections",
            null,
            $appointment->id
        );

        self::whatsapp(
            $appointment->guest_contact,
            "Hello {$appointment->guest_name}, we received your appointment request {$ref} for {$when}. We will confirm shortly — OSSZ Collections",
            null,
            $appointment->id
        );
    }

    public static function appointmentStatusChanged(Appointment $appointment): void
    {
        $when = $appointment->slot_start->format('d M Y · H:i');
        $ref = $appointment->reference;
        $status = status_label($appointment->status);

        self::email(
            $appointment->guest_contact,
            "OSSZ appointment {$ref} — {$status}",
            "Dear {$appointment->guest_name},\n\nYour appointment {$ref} ({$when}) is now: {$status}.\n\nWith warm regards,\nOSSZ Collections",
            null,
            $appointment->id
        );
    }

    public static function contactMessage(array $data): void
    {
        self::email(
            Settings::get('contact_email', 'info@osszcollection.com'),
            "New message from {$data['name']} — {$data['contact']}",
            "New customer message received.\n\nName: {$data['name']}\nContact: {$data['contact']}\nMessage:\n{$data['message']}",
        );
    }

    public static function passwordReset(string $email, string $fullName, string $token): void
    {
        $link = url('/reset-password?token='.$token);
        self::email(
            $email,
            'Reset your OSSZ Collections password',
            "Dear {$fullName},\n\nYou may set a new password using the link below. It is valid for one hour.\n\n{$link}\n\nIf you did not ask for this, you may safely ignore this message.\n\nWith warm regards,\nOSSZ Collections",
        );
    }

    private static function record(
        ?int $orderId,
        ?int $appointmentId,
        string $channel,
        string $recipient,
        string $subject,
        string $body,
        string $status,
        string $error = ''
    ): void {
        try {
            Notification::create(compact('orderId', 'appointmentId', 'channel', 'recipient', 'subject', 'body', 'status', 'error'));
        } catch (\Throwable) {
            // logging must never break the request
        }
    }
}
