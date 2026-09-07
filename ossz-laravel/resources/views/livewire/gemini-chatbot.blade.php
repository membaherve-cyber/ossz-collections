<div class="flex flex-col h-[500px] bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-900 text-white rounded-t-lg">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-bold text-sm">OZ</div>
            <div>
                <h3 class="font-semibold">OSSZ Concierge</h3>
                <p class="text-xs text-gray-300">Here for you, around the clock</p>
            </div>
        </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
        @forelse ($messages as $message)
            <div class="flex {{ $message['role'] === 'user' ? 'justify-end' : 'justify-start' }}">
                <div class="{{ $message['role'] === 'user' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-800' }} 
                    rounded-lg px-4 py-2 max-w-[80%]">
                    <p class="text-sm">{{ $message['content'] }}</p>
                </div>
            </div>
        @empty
            <div class="text-center text-gray-400 mt-8">
                <div class="w-12 h-12 bg-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white">OZ</div>
                <p class="text-sm">Welcome to OSSZ Concierge. How can I assist you today?</p>
            </div>
        @endforelse

        @if ($isTyping)
            <div class="flex justify-start">
                <div class="bg-gray-100 rounded-lg px-4 py-2">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                </div>
            </div>
        @endif
    </div>

    <!-- Quick Prompts -->
    @if (count($messages) <= 1)
        <div class="px-4 pb-2 flex flex-wrap gap-2">
            <button wire:click="$set('newMessage', 'Show me your latest collection')" 
                class="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition">
                🎨 Show me your latest collection
            </button>
            <button wire:click="$set('newMessage', 'Track my order')" 
                class="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition">
                📦 Track my order
            </button>
            <button wire:click="$set('newMessage', 'Book an appointment')" 
                class="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition">
                📅 Book an appointment
            </button>
            <button wire:click="$set('newMessage', 'What are your prices?')" 
                class="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition">
                💰 Pricing info
            </button>
        </div>
    @endif

    <!-- Input -->
    <form wire:submit.prevent="sendMessage" class="p-4 border-t">
        <div class="flex gap-2">
            <input type="text" 
                wire:model="newMessage" 
                placeholder="Ask me anything about OSSZ..."
                class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                @if ($isTyping) disabled @endif>
            <button type="submit" 
                class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                @if ($isTyping || empty(trim($newMessage))) disabled @endif>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
            </button>
        </div>
    </form>

    <!-- WhatsApp Fallback -->
    <div class="px-4 pb-3">
        <a href="https://wa.me/237694068219" target="_blank" 
            class="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Speak with an agent on WhatsApp
        </a>
    </div>
</div>

@push('scripts')
<script>
    Livewire.on('scrollToBottom', () => {
        const container = document.getElementById('chat-messages');
        container.scrollTop = container.scrollHeight;
    });
</script>
@endpush
