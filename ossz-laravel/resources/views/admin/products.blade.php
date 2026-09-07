@extends('layouts.admin')

@section('title', 'Products - OSSZ Backoffice')

@section('content')
<div class="p-6">
    <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-2xl font-bold">Products</h1>
            <p class="text-gray-500">Manage your product catalogue</p>
        </div>
        <a href="{{ route('admin.products.create') }}" 
            class="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition">
            + Add Product
        </a>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex flex-wrap gap-4">
            <input type="text" 
                placeholder="Search products..." 
                class="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
            <select class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">All Categories</option>
                <option value="ready-to-wear">Ready to Wear</option>
                <option value="kaftans">Kaftans</option>
                <option value="agbada">Agbada</option>
                <option value="pants">Pants</option>
                <option value="shirts">Shirts</option>
                <option value="danshiki">Danshiki</option>
                <option value="oversize">Oversize</option>
                <option value="hats">Hats</option>
                <option value="shoes">Shoes</option>
                <option value="sandals">Sandals</option>
                <option value="cufflinks">Cufflinks</option>
                <option value="bags">Bags</option>
                <option value="tie">Tie / Cravate</option>
                <option value="bold-tie">Bold Tie</option>
            </select>
            <select class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
            </select>
        </div>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @forelse ($products ?? [] as $product)
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="aspect-square bg-gray-100">
                    @if ($product->images && count($product->images) > 0)
                        <img src="{{ $product->images[0] }}" 
                            alt="{{ $product->name }}" 
                            class="w-full h-full object-cover">
                    @else
                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                    @endif
                </div>
                <div class="p-4">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="font-semibold">{{ $product->name }}</h3>
                            <p class="text-sm text-gray-500">{{ $product->category->name ?? 'Uncategorized' }}</p>
                        </div>
                        <span class="text-lg font-bold">{{ number_format($product->price, 0, '.', ' ') }} XAF</span>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-sm text-gray-500">
                            {{ $product->variants->sum('stock') ?? 0 }} in stock
                        </span>
                        <div class="flex gap-2">
                            <a href="{{ route('admin.products.edit', $product->id) }}" 
                                class="text-amber-600 hover:text-amber-800">
                                Edit
                            </a>
                            <form action="{{ route('admin.products.destroy', $product->id) }}" 
                                method="POST" 
                                onsubmit="return confirm('Are you sure?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-800">Delete</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p class="mt-4 text-gray-500">No products found</p>
                <a href="{{ route('admin.products.create') }}" 
                    class="inline-block mt-4 text-amber-600 hover:text-amber-800">
                    Add your first product
                </a>
            </div>
        @endforelse
    </div>
</div>
@endsection
