<div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-lg font-semibold mb-4">Quick Track Order</h2>

    @if ($successMessage)
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ $successMessage }}
        </div>
    @endif

    @if ($errorMessage)
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ $errorMessage }}
        </div>
    @endif

    <form wire:submit.prevent="trackOrder" class="space-y-4">
        <div>
            <label for="orderNumber" class="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
            <input type="text" 
                wire:model="orderNumber" 
                id="orderNumber"
                placeholder="e.g., OSZ-001"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required>
        </div>

        <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
            <select wire:model="status" 
                id="status"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                @foreach ($statusOptions as $value => $label)
                    <option value="{{ $value }}">{{ $label }}</option>
                @endforeach
            </select>
        </div>

        <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Additional Message (optional)</label>
            <textarea wire:model="message" 
                id="message"
                rows="2"
                placeholder="Any additional notes for the customer..."
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>
        </div>

        <div class="flex items-center gap-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            Customer will be notified via WhatsApp and email
        </div>

        <button type="submit" 
            class="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition font-medium">
            Send Update
        </button>
    </form>
</div>
