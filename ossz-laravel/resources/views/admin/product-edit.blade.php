@extends('layouts.admin')

@section('title', 'Edit Product - OSSZ Backoffice')

@section('content')
<div class="p-6">
    <div class="mb-8">
        <h1 class="text-2xl font-bold">Edit Product</h1>
        <p class="text-gray-500">Update {{ $product->name }}</p>
    </div>

    <form action="{{ route('admin.products.update', $product->id) }}" method="POST" class="max-w-2xl">
        @csrf
        @method('PUT')
        
        <div class="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" name="name" id="name" value="{{ old('name', $product->name) }}" required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
            </div>

            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" id="description" rows="4" required
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">{{ old('description', $product->description) }}</textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price (XAF)</label>
                    <input type="number" name="price" id="price" value="{{ old('price', $product->base_price) }}" required min="0"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                </div>

                <div>
                    <label for="category_id" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category_id" id="category_id" required
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                        @foreach ($categories as $category)
                            <option value="{{ $category->id }}" {{ old('category_id', $product->category_id) == $category->id ? 'selected' : '' }}>
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div>
                <label for="collection_id" class="block text-sm font-medium text-gray-700 mb-1">Collection (optional)</label>
                <select name="collection_id" id="collection_id"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="">No Collection</option>
                    @foreach ($collections as $collection)
                        <option value="{{ $collection->id }}" {{ old('collection_id', $product->collection_id) == $collection->id ? 'selected' : '' }}>
                            {{ $collection->name }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div class="flex gap-4 pt-4">
                <a href="{{ route('admin.products.index') }}" 
                    class="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">
                    Cancel
                </a>
                <button type="submit" 
                    class="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
                    Update Product
                </button>
            </div>
        </div>
    </form>
</div>
@endsection
