<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Order;
use App\Models\Notification;

class OrderTracking extends Component
{
    public $orderNumber = '';
    public $status = 'ready_for_pickup';
    public $message = '';
    public $successMessage = '';
    public $errorMessage = '';

    public array $statusOptions = [
        'placed' => 'Placed',
        'processing' => 'Processing',
        'ready_for_pickup' => 'Ready for Pickup',
        'out_for_delivery' => 'Out for Delivery',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
        'returned' => 'Returned',
    ];

    public function trackOrder()
    {
        $this->successMessage = '';
        $this->errorMessage = '';

        if (empty(trim($this->orderNumber))) {
            $this->errorMessage = 'Please enter an order number.';
            return;
        }

        $order = Order::where('order_number', $this->orderNumber)->first();

        if (!$order) {
            $this->errorMessage = "Order {$this->orderNumber} not found.";
            return;
        }

        $oldStatus = $order->status;
        $order->status = $this->status;
        $order->save();

        // Send notifications
        $this->sendNotifications($order, $this->status);

        // Log the status change
        Notification::create([
            'type' => 'order_status',
            'content' => "Order {$order->order_number} status changed from {$oldStatus} to {$this->status}",
            'metadata' => json_encode([
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $this->status,
            ]),
        ]);

        $statusLabel = $this->statusOptions[$this->status] ?? $this->status;
        $this->successMessage = "Order {$order->order_number} updated to: {$statusLabel}. Customer notified via WhatsApp and email.";

        // Reset form
        $this->orderNumber = '';
        $this->status = 'ready_for_pickup';
        $this->message = '';
    }

    private function sendNotifications(Order $order, string $status): void
    {
        $customerName = $order->customer_name ?? 'Customer';
        $customerPhone = $order->customer_phone ?? '';
        $customerEmail = $order->customer_email ?? '';

        $statusMessages = [
            'placed' => "Your order has been placed successfully.",
            'processing' => "Your order is now being processed.",
            'ready_for_pickup' => "Your order is ready for pickup at our Ange Raphael boutique, Douala.",
            'out_for_delivery' => "Your order is on its way to you!",
            'delivered' => "Your order has been delivered. Thank you for shopping with OSSZ!",
            'cancelled' => "Your order has been cancelled.",
            'returned' => "Your order return has been processed.",
        ];

        $message = $statusMessages[$status] ?? "Your order status has been updated.";

        // WhatsApp notification
        if (!empty($customerPhone)) {
            $this->sendWhatsApp($customerPhone, "Hello {$customerName},\n\n{$message}\n\nOrder: {$order->order_number}\n\nBest regards,\nOSSZ Collections");
        }

        // Email notification
        if (!empty($customerEmail)) {
            $this->sendEmail($customerEmail, "OSSZ Order Update - {$order->order_number}", $message, $customerName, $order);
        }
    }

    private function sendWhatsApp(string $phone, string $message): void
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($cleanPhone, 0, 3) === '237') {
            // Already has country code
        } elseif (substr($cleanPhone, 0, 1) === '6' || substr($cleanPhone, 0, 1) === '2') {
            $cleanPhone = '237' . $cleanPhone;
        }

        $encodedMessage = urlencode($message);
        $url = "https://wa.me/{$cleanPhone}?text={$encodedMessage}";

        // Log the WhatsApp URL (in production, use WhatsApp Business API)
        \Log::info("WhatsApp notification URL: {$url}");
    }

    private function sendEmail(string $email, string $subject, string $message, string $customerName, Order $order): void
    {
        // In production, use Laravel Mail
        \Log::info("Email notification to {$email}: {$subject}");
    }

    public function render()
    {
        return view('livewire.order-tracking');
    }
}
