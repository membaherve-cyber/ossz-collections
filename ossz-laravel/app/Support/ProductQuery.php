<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;

/**
 * Catalogue queries — port of listProducts, getProductBySlug and
 * listFilterFacets from src/lib/store.ts, including the same search
 * stop-words, price bands and stock semantics.
 */
final class ProductQuery
{
    private const STOP_WORDS = [
        'show', 'me', 'the', 'a', 'an', 'in', 'for', 'with', 'and', 'or', 'of', 'do', 'you',
        'have', 'any', 'some', 'please', 'looking', 'look', 'want', 'need', 'find', 'your',
        'this', 'that', 'is', 'are', 'what', 'which', 'can', 'i', 'my', 'to', 'dress',
        'piece', 'pieces', 'something',
    ];

    /** @return array<int, array<string, mixed>> product card data */
    public static function list(array $filters = []): array
    {
        $query = Product::query()
            ->where('products.is_published', true)
            ->leftJoin('collections', 'products.collection_id', '=', 'collections.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select('products.*', 'collections.name as collection_name', 'collections.name_fr as collection_name_fr',
                'categories.name as category_name', 'categories.name_fr as category_name_fr');

        if (! empty($filters['category'])) {
            $query->where('categories.slug', $filters['category']);
        }
        if (! empty($filters['collection'])) {
            $query->where('collections.slug', $filters['collection']);
        }
        if (! empty($filters['featured'])) {
            $query->where('products.is_featured', true);
        }
        if (isset($filters['minPrice']) && is_numeric($filters['minPrice'])) {
            $query->where('products.base_price', '>=', (int) $filters['minPrice']);
        }
        if (isset($filters['maxPrice']) && is_numeric($filters['maxPrice'])) {
            $query->where('products.base_price', '<=', (int) $filters['maxPrice']);
        }
        if (! empty($filters['q'])) {
            foreach (self::tokens($filters['q']) as $term) {
                $query->where(function ($q) use ($term) {
                    $like = "%{$term}%";
                    $q->where('products.name', 'like', $like)
                        ->orWhere('products.description', 'like', $like)
                        ->orWhere('products.details', 'like', $like)
                        ->orWhere('products.care_instructions', 'like', $like);
                });
            }
        }

        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('products.base_price'),
            'price_desc' => $query->orderByDesc('products.base_price'),
            'popular' => $query->orderByDesc('products.popularity'),
            default => $query->orderByDesc('products.created_at'),
        };

        $rows = $query->limit((int) ($filters['limit'] ?? 120))->get();
        if ($rows->isEmpty()) {
            return [];
        }

        $ids = $rows->pluck('id')->all();
        $images = ProductImage::whereIn('product_id', $ids)->orderBy('sort_order')->get()->groupBy('product_id');
        $variants = ProductVariant::whereIn('product_id', $ids)->get()->groupBy('product_id');

        $cards = [];
        foreach ($rows as $row) {
            $vs = $variants->get($row->id, collect());
            $colours = $vs->pluck('colour')->unique()->values()->all();
            $sizes = $vs->pluck('size')->unique()->values()->all();
            $inStock = $vs->contains(fn ($v) => (int) $v->stock_qty > 0);

            if (! empty($filters['size']) && ! in_array($filters['size'], $sizes, true)) continue;
            if (! empty($filters['colour']) && ! in_array($filters['colour'], $colours, true)) continue;
            if (($filters['availability'] ?? '') === 'in_stock' && ! $inStock) continue;
            if (($filters['availability'] ?? '') === 'out_of_stock' && $inStock) continue;

            $img = $images->get($row->id, collect())->first();
            $cards[] = [
                'id' => $row->id,
                'name' => $row->name,
                'name_fr' => $row->name_fr,
                'slug' => $row->slug,
                'basePrice' => (int) $row->base_price,
                'description' => (string) $row->description,
                'description_fr' => (string) $row->description_fr,
                'image' => $img->url ?? '',
                'imageAlt' => $img->alt_text ?? $row->name,
                'collectionName' => $row->collection_name,
                'collectionNameFr' => $row->collection_name_fr,
                'categoryName' => $row->category_name,
                'categoryNameFr' => $row->category_name_fr,
                'colours' => $colours,
                'sizes' => $sizes,
                'inStock' => $inStock,
                'variants' => $vs->map(fn ($v) => [
                    'id' => $v->id,
                    'size' => $v->size,
                    'colour' => $v->colour,
                    'stockQty' => (int) $v->stock_qty,
                    'price' => (int) ($v->price_override ?? $row->base_price),
                ])->all(),
            ];
        }

        return $cards;
    }

    /** Product page payload: product + images + variants + parents. */
    public static function bySlug(string $slug): ?array
    {
        $product = Product::with(['category', 'collection'])->where('slug', $slug)->first();
        if (! $product) {
            return null;
        }
        $images = ProductImage::where('product_id', $product->id)->orderBy('sort_order')->get();
        $variants = ProductVariant::where('product_id', $product->id)->orderBy('id')->get();

        return compact('product', 'images', 'variants');
    }

    /** Filter sidebar data: categories, collections, sizes, colours, price range. */
    public static function facets(): array
    {
        $variants = ProductVariant::select('size', 'colour')->get();

        return [
            'categories' => Category::orderBy('sort_order')->get(),
            'collections' => Collection::where('is_published', true)->get(),
            'sizes' => $variants->pluck('size')->unique()->sort()->values()->all(),
            'colours' => $variants->pluck('colour')->unique()->sort()->values()->all(),
            'minPrice' => (int) (Product::min('base_price') ?? 0),
            'maxPrice' => (int) (Product::max('base_price') ?? 0),
        ];
    }

    /** @return string[] up to five meaningful search tokens */
    private static function tokens(string $q): array
    {
        $parts = preg_split('/[^a-z0-9]+/i', strtolower($q)) ?: [];
        $kept = [];
        foreach ($parts as $part) {
            if (strlen($part) > 2 && ! in_array($part, self::STOP_WORDS, true)) {
                $kept[] = $part;
            }
            if (count($kept) >= 5) break;
        }

        return $kept ?: [$q];
    }
}
