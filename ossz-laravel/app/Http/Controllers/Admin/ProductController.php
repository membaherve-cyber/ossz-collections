<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Collection;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'collection', 'variants'])
            ->latest()
            ->get();

        return view('admin.products', compact('products'));
    }

    public function create()
    {
        $categories = Category::orderBy('name')->get();
        $collections = Collection::orderBy('name')->get();

        return view('admin.product-create', compact('categories', 'collections'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'collection_id' => 'nullable|exists:collections,id',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        $validated['slug'] = \Str::slug($validated['name']);
        $validated['is_published'] = true;

        $product = Product::create($validated);

        // Create default variant
        $product->variants()->create([
            'size' => 'One size',
            'colour' => 'Natural',
            'stock_qty' => 10,
            'price_override' => $validated['price'],
        ]);

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $categories = Category::orderBy('name')->get();
        $collections = Collection::orderBy('name')->get();

        return view('admin.product-edit', compact('product', 'categories', 'collections'));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'collection_id' => 'nullable|exists:collections,id',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        $validated['slug'] = \Str::slug($validated['name']);

        $product->update($validated);

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
