<?php

namespace App\Http\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class GeminiChatbot extends Component
{
    public $messages = [];
    public $newMessage = '';
    public $isTyping = false;

    protected $listeners = ['streamComplete'];

    public function sendMessage()
    {
        if (empty(trim($this->newMessage))) return;

        $userMessage = $this->newMessage;
        $this->newMessage = '';
        $this->isTyping = true;

        $this->messages[] = [
            'role' => 'user',
            'content' => $userMessage,
        ];

        // Get context from database
        $context = $this->getContext();

        // Get AI response with streaming
        $response = $this->getGeminiResponse($userMessage, $context);

        $this->messages[] = [
            'role' => 'assistant',
            'content' => $response,
        ];

        $this->isTyping = false;
    }

    private function getContext(): string
    {
        // Query relevant app context
        $recentOrders = \App\Models\Order::latest('created_at')
            ->take(10)
            ->get(['order_number', 'status', 'total_amount', 'created_at']);

        $products = \App\Models\Product::take(10)
            ->get(['name', 'price', 'category_id']);

        $context = "Recent Orders:\n";
        foreach ($recentOrders as $order) {
            $context .= "- Order {$order->order_number}: Status={$order->status}, Amount={$order->total_amount}\n";
        }

        $context .= "\nSample Products:\n";
        foreach ($products as $product) {
            $context .= "- {$product->name}: Price={$product->price}\n";
        }

        return $context;
    }

    private function getGeminiResponse(string $message, string $context): string
    {
        $apiKey = env('GEMINI_API_KEY');
        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}";

        $systemPrompt = <<<'PROMPT'
You are the OSSZ Collections AI assistant. You help with orders, products, appointments, and general queries about OSSZ Collections, a luxury fashion house based in Douala, Cameroon.
- Provide helpful, concise responses
- Use a professional and friendly tone
- If you don't know something, say so and offer to connect with a human agent
- Currency is XAF (CFA Franc)
PROMPT;

        $payload = [
            'system_instruction' => [
                'parts' => [
                    ['text' => $systemPrompt . "\n\nContext from the database:\n" . $context],
                ],
            ],
            'contents' => array_map(function ($msg) {
                return [
                    'role' => $msg['role'] === 'user' ? 'user' : 'model',
                    'parts' => [
                        ['text' => $msg['content']],
                    ],
                ];
            }, $this->messages),
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 1024,
                'thinkingConfig' => [
                    'thinkingEnabled' => false,
                ],
            ],
        ];

        try {
            $response = Http::timeout(10)->post($apiUrl, $payload);

            if ($response->successful()) {
                return $response->json('candidates.0.content.parts.0.text', 'I apologize, but I could not generate a response. Please try again.');
            }
        } catch (\Exception $e) {
            \Log::error('Gemini API error: ' . $e->getMessage());
        }

        return $this->fallbackResponse($message);
    }

    private function fallbackResponse(string $message): string
    {
        $messageLower = strtolower($message);

        if (str_contains($messageLower, 'order') || str_contains($messageLower, 'track')) {
            return "To track your order, please provide your order number (e.g., OSZ-001). You can also contact us on WhatsApp at +237 694 068 219.";
        }

        if (str_contains($messageLower, 'appointment') || str_contains($messageLower, 'rendez')) {
            return "To book an appointment, please visit our appointments page or contact us on WhatsApp at +237 694 068 219.";
        }

        if (str_contains($messageLower, 'collection') || str_contains($messageLower, 'lookbook')) {
            return "We have several collections: Check Moves, Freeme (2021), 95 VIVS Element, Cultural Canvas, and Cultural Heritage. Browse them on our collections page.";
        }

        if (str_contains($messageLower, 'delivery') || str_contains($messageLower, 'livraison')) {
            return "We offer in-store pickup at our Ange Raphael boutique in Douala (free) and national shipping across Cameroon (6,500 FCFA, 2-4 business days).";
        }

        if (str_contains($messageLower, 'return') || str_contains($messageLower, 'retour')) {
            return "We offer free alterations within 30 days of purchase. For returns, please contact our customer service on WhatsApp.";
        }

        if (str_contains($messageLower, 'hello') || str_contains($messageLower, 'bonjour') || str_contains($messageLower, 'hi')) {
            return "Bonjour! Welcome to OSSZ Collections. How can I assist you today? Whether it's about our collections, orders, or appointments, I'm here to help.";
        }

        if (str_contains($messageLower, 'location') || str_contains($messageLower, 'address') || str_contains($messageLower, 'adresse')) {
            return "Our boutique is located at Ange Raphael, Douala, Cameroon. We're open Monday to Friday, 9am - 6pm, and Saturday 9am - 1pm.";
        }

        if (str_contains($messageLower, 'payment') || str_contains($messageLower, 'paiement')) {
            return "We accept MTN MoMo, Orange Money, Visa, and Mastercard. For appointments, a 50% deposit is required.";
        }

        if (str_contains($messageLower, 'price') || str_contains($messageLower, 'prix') || str_contains($messageLower, 'cost')) {
            return "Our prices range from 25,000 XAF for accessories to 350,000 XAF for bespoke pieces. Visit our shop to see current pricing.";
        }

        return "Thank you for your message. I can help you with information about our collections, orders, appointments, delivery, and payments. Could you please provide more details about what you're looking for? You can also reach us on WhatsApp at +237 694 068 219.";
    }

    public function render()
    {
        return view('livewire.gemini-chatbot');
    }
}
