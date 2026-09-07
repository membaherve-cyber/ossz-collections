<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Support\Auth;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $this->guard('catalogue');

        $q = trim((string) $request->input('q'));
        $products = Product::with(['category', 'collection', 'variants', 'images'])
            ->when($q, fn ($query) => $query->where('name', 'like', "%{$q}%")->orWhere('slug', 'like', "%{$q}%"))
            ->orderByDesc('created_at')
            ->get();

        return view('admin.products', ['products' => $products, 'q' => $q]);
    }

    public function create()
    {
        $this->guard('catalogue');

        return view('admin.product-form', [
            'product' => new Product(),
            'categories' => Category::orderBy('name')->get(),
            'collections' => Collection::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->guard('catalogue');
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?: $data['name']);
        $product = Product::create($data);

        return redirect()->route('admin.products.edit', $product)->with('success', 'Product created.');
    }

    public function edit(Product $product)
    {
        $this->guard('catalogue');

        return view('admin.product-form', [
            'product' => $product->load(['variants', 'images']),
            'categories' => Category::orderBy('name')->get(),
            'collections' => Collection::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $this->guard('catalogue');
        $product->update($this->validated($request));

        return back()->with('success', 'Product saved.');
    }

    public function destroy(Product $product)
    {
        $this->guard('catalogue');
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted.');
    }

    public function addVariant(Request $request, Product $product)
    {
        $this->guard('catalogue');
        $data = $request->validate([
            'size' => 'required|string|max:40',
            'colour' => 'required|string|max:40',
            'stock_qty' => 'required|integer|min:0',
            'price_override' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:60',
        ]);
        $product->variants()->create($data);

        return back()->with('success', 'Variant added.');
    }

    public function deleteVariant(ProductVariant $variant)
    {
        $this->guard('catalogue');
        $variant->delete();

        return back()->with('success', 'Variant removed.');
    }

    public function addImage(Request $request, Product $product)
    {
        $this->guard('catalogue');
        $request->validate(['url' => 'required|string|max:500', 'alt_text' => 'nullable|string|max:200']);
        $max = (int) $product->images()->max('sort_order');
        $product->images()->create([
            'url' => $request->input('url'),
            'alt_text' => (string) $request->input('alt_text', ''),
            'sort_order' => $max + 1,
        ]);

        return back()->with('success', 'Image added.');
    }

    public function deleteImage(ProductImage $image)
    {
        $this->guard('catalogue');
        $image->delete();

        return back()->with('success', 'Image removed.');
    }

    public function collections()
    {
        $this->guard('catalogue');

        return view('admin.collections', [
            'collections' => Collection::orderBy('name')->get(),
        ]);
    }

    public function storeCollection(Request $request)
    {
        $this->guard('catalogue');
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'name_fr' => 'nullable|string|max:120',
            'season' => 'nullable|string|max:60',
            'season_fr' => 'nullable|string|max:60',
            'description' => 'nullable|string|max:2000',
            'cover_image' => 'nullable|string|max:400',
        ]);
        $data['slug'] = $this->uniqueSlug($data['name']);
        Collection::create($data);

        return back()->with('success', 'Collection created.');
    }

    public function destroyCollection(Collection $collection)
    {
        $this->guard('catalogue');
        $collection->delete();

        return back()->with('success', 'Collection deleted.');
    }

    public function inventory()
    {
        $this->guard('catalogue');

        return view('admin.inventory', [
            'variants' => ProductVariant::with(['product', 'product.images'])
                ->orderBy('product_id')
                ->orderBy('size')
                ->get(),
        ]);
    }

    public function updateStock(Request $request)
    {
        $this->guard('catalogue');
        $variant = ProductVariant::findOrFail((int) $request->input('variant_id'));
        $variant->update(['stock_qty' => max(0, (int) $request->input('stock_qty', 0))]);

        return back()->with('success', 'Stock updated for '.$variant->product->name.' ('.$variant->size.').');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:180',
            'name_fr' => 'nullable|string|max:180',
            'description' => 'nullable|string|max:5000',
            'description_fr' => 'nullable|string|max:5000',
            'details' => 'nullable|string|max:5000',
            'details_fr' => 'nullable|string|max:5000',
            'care_instructions' => 'nullable|string|max:2000',
            'care_instructions_fr' => 'nullable|string|max:2000',
            'category_id' => 'nullable|integer',
            'collection_id' => 'nullable|integer',
            'base_price' => 'required|integer|min:0',
            'is_published' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'seo_title' => 'nullable|string|max:200',
            'seo_description' => 'nullable|string|max:300',
        ]) + ['slug' => slugify((string) $request->input('slug', ''))];
    }

    private function uniqueSlug(string $source): string
    {
        $base = $source !== '' ? $source : 'piece';
        $slug = $base;
        $i = 2;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    /** Page-level access control — port of src/lib/guard.ts. */
    private function guard(string $area): void
    {
        $user = request()->attributes->get('ossz_user');
        $allowed = match ($area) {
            'orders' => Auth::canFulfilOrders($user->role),
            'catalogue' => Auth::canManageCatalogue($user->role),
            default => Auth::isAdmin($user->role),
        };
        if (! $allowed) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Insufficient permissions.'));
        }
    }
}
