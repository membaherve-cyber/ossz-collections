@extends('layouts.admin')

@section('title', 'AI Concierge - OSSZ Backoffice')

@section('content')
<div class="p-6">
    <div class="mb-8">
        <h1 class="text-2xl font-bold">AI Concierge</h1>
        <p class="text-gray-500">Monitor and manage the AI chatbot conversations</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chat Interface -->
        <div class="lg:col-span-2">
            @livewire('gemini-chatbot')
        </div>

        <!-- Sidebar Stats -->
        <div class="space-y-6">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="font-semibold mb-4">Chat Statistics</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Total Conversations</span>
                        <span class="font-semibold">0</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Today</span>
                        <span class="font-semibold">0</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Avg Response Time</span>
                        <span class="font-semibold">~1.3s</span>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="font-semibold mb-4">Quick Actions</h3>
                <div class="space-y-2">
                    <a href="https://wa.me/237694068219" 
                        target="_blank"
                        class="block w-full text-center bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
                        WhatsApp Support
                    </a>
                    <a href="mailto:info@osszcollection.com" 
                        class="block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                        Email Support
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="font-semibold mb-4">Knowledge Base</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Brand Info</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Collections</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Products</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Delivery Info</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Payment Methods</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Location & Hours</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
