<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        DB::table('users')->insert([
            'email' => 'admin@osszcollection.com',
            'full_name' => 'OSSZ Admin',
            'password_hash' => Hash::make('password'),
            'role' => 'admin',
            'created_at' => now(),
        ]);

        DB::table('users')->insert([
            'email' => 'staff@osszcollection.com',
            'full_name' => 'OSSZ Staff',
            'password_hash' => Hash::make('password'),
            'role' => 'staff',
            'created_at' => now(),
        ]);

        // Create categories
        $categories = [
            ['name' => 'Ready to Wear', 'name_fr' => 'Prêt-à-porter', 'slug' => 'ready-to-wear', 'sort_order' => 0],
            ['name' => 'Kaftans', 'name_fr' => 'Kaftans', 'slug' => 'kaftans', 'sort_order' => 1],
            ['name' => 'Agbada', 'name_fr' => 'Agbada', 'slug' => 'agbada', 'sort_order' => 2],
            ['name' => 'Pants', 'name_fr' => 'Pantalons', 'slug' => 'pants', 'sort_order' => 3],
            ['name' => 'Shirts', 'name_fr' => 'Chemises', 'slug' => 'shirts', 'sort_order' => 4],
            ['name' => 'Danshiki', 'name_fr' => 'Danshiki', 'slug' => 'danshiki', 'sort_order' => 5],
            ['name' => 'Oversize', 'name_fr' => 'Oversize', 'slug' => 'oversize', 'sort_order' => 6],
            ['name' => 'Hats', 'name_fr' => 'Chapeaux', 'slug' => 'hats', 'sort_order' => 7],
            ['name' => 'Shoes', 'name_fr' => 'Chaussures', 'slug' => 'shoes', 'sort_order' => 8],
            ['name' => 'Sandals', 'name_fr' => 'Sandales', 'slug' => 'sandals', 'sort_order' => 9],
            ['name' => 'Cufflinks', 'name_fr' => 'Manchettes', 'slug' => 'cufflinks', 'sort_order' => 10],
            ['name' => 'Bags', 'name_fr' => 'Sacs', 'slug' => 'bags', 'sort_order' => 11],
            ['name' => 'Tie / Cravate', 'name_fr' => 'Cravate', 'slug' => 'tie', 'sort_order' => 12],
            ['name' => 'Bold Tie', 'name_fr' => 'Cravate Audacieuse', 'slug' => 'bold-tie', 'sort_order' => 13],
        ];

        DB::table('categories')->insert($categories);

        // Create subcategories
        $shirtsId = DB::table('categories')->where('slug', 'shirts')->first()->id;
        $pantsId = DB::table('categories')->where('slug', 'pants')->first()->id;

        DB::table('categories')->insert([
            ['name' => 'Classic Shirts', 'name_fr' => 'Chemises Classiques', 'slug' => 'classic-shirts', 'parent_id' => $shirtsId, 'sort_order' => 0],
            ['name' => 'Vintage Shirts', 'name_fr' => 'Chemises Vintage', 'slug' => 'vintage-shirts', 'parent_id' => $shirtsId, 'sort_order' => 1],
            ['name' => 'Classic Pants', 'name_fr' => 'Pantalons Classiques', 'slug' => 'classic-pants', 'parent_id' => $pantsId, 'sort_order' => 0],
            ['name' => 'Gurkha Pants', 'name_fr' => 'Pantalons Gurkha', 'slug' => 'gurkha-pants', 'parent_id' => $pantsId, 'sort_order' => 1],
            ['name' => 'Palazzo Pants', 'name_fr' => 'Pantalons Palazzo', 'slug' => 'palazzo-pants', 'parent_id' => $pantsId, 'sort_order' => 2],
        ]);

        // Create collections
        $collections = [
            ['name' => 'Check Moves', 'slug' => 'check-moves', 'season' => '2023', 'description' => 'Geometric precision meets bold pattern.', 'name_fr' => 'Mouvements à Carreaux', 'season_fr' => '2023', 'description_fr' => 'Précision géométrique et motifs audacieux.', 'cover_image' => '/collections/check-moves.webp'],
            ['name' => 'Freeme', 'slug' => 'freeme', 'season' => '2021', 'description' => 'Freedom expressed in fabric.', 'name_fr' => 'Freeme', 'season_fr' => '2021', 'description_fr' => 'La liberté exprimée en tissu.', 'cover_image' => '/collections/freeme.webp'],
            ['name' => '95 VIVS Element', 'slug' => '95-vivs-element', 'season' => '2022', 'description' => 'A tribute to Douala streets.', 'name_fr' => '95 VIVS Élément', 'season_fr' => '2022', 'description_fr' => 'Un hommage aux rues de Douala.', 'cover_image' => '/collections/95-vivs.webp'],
            ['name' => 'Cultural Canvas', 'slug' => 'cultural-canvas', 'season' => '2024', 'description' => 'Every garment is a canvas.', 'name_fr' => 'Toile Culturelle', 'season_fr' => '2024', 'description_fr' => 'Chaque vêtement est une toile.', 'cover_image' => '/collections/cultural-canvas.webp'],
            ['name' => 'Cultural Heritage', 'slug' => 'cultural-heritage', 'season' => '2024', 'description' => 'The pieces that outlast seasons.', 'name_fr' => 'Patrimoine Culturel', 'season_fr' => '2024', 'description_fr' => 'Les pièces qui survivent aux saisons.', 'cover_image' => '/collections/cultural-heritage.webp'],
        ];

        DB::table('collections')->insert($collections);

        // Create sample products
        $sampleProducts = [
            ['name' => 'Midnight Agbada', 'base_price' => 185000, 'category_slug' => 'agbada', 'collection_slug' => 'cultural-heritage'],
            ['name' => 'Indigo Kaftan', 'base_price' => 95000, 'category_slug' => 'kaftans', 'collection_slug' => 'cultural-canvas'],
            ['name' => 'Liberty Silk Shirt', 'base_price' => 45000, 'category_slug' => 'shirts', 'collection_slug' => 'freeme'],
            ['name' => 'Palazzo Trousers', 'base_price' => 55000, 'category_slug' => 'pants', 'collection_slug' => '95-vivs-element'],
            ['name' => 'Heritage Bold Tie', 'base_price' => 25000, 'category_slug' => 'bold-tie', 'collection_slug' => 'cultural-heritage'],
            ['name' => 'Urban Sandals', 'base_price' => 35000, 'category_slug' => 'sandals', 'collection_slug' => '95-vivs-element'],
            ['name' => 'Check Move Blazer', 'base_price' => 125000, 'category_slug' => 'ready-to-wear', 'collection_slug' => 'check-moves'],
            ['name' => 'Danshiki Modern', 'base_price' => 65000, 'category_slug' => 'danshiki', 'collection_slug' => 'freeme'],
            ['name' => 'Leather Weekend Bag', 'base_price' => 85000, 'category_slug' => 'bags', 'collection_slug' => 'cultural-heritage'],
            ['name' => 'Silk Cravat Set', 'base_price' => 32000, 'category_slug' => 'tie', 'collection_slug' => 'check-moves'],
            ['name' => 'Oversize Boubou', 'base_price' => 75000, 'category_slug' => 'oversize', 'collection_slug' => 'freeme'],
            ['name' => 'Gold Cufflinks', 'base_price' => 28000, 'category_slug' => 'cufflinks', 'collection_slug' => 'cultural-heritage'],
        ];

        foreach ($sampleProducts as $productData) {
            $category = DB::table('categories')->where('slug', $productData['category_slug'])->first();
            $collection = DB::table('collections')->where('slug', $productData['collection_slug'])->first();

            if ($category && $collection) {
                $productId = DB::table('products')->insertGetId([
                    'name' => $productData['name'],
                    'slug' => Str::slug($productData['name']),
                    'description' => 'Handcrafted by our artisans in Douala, this piece exemplifies the OSSZ commitment to quality and cultural authenticity.',
                    'base_price' => $productData['base_price'],
                    'category_id' => $category->id,
                    'collection_id' => $collection->id,
                    'is_published' => true,
                    'created_at' => now(),
                ]);

                // Create variants (sizes)
                DB::table('product_variants')->insert([
                    ['product_id' => $productId, 'size' => 'S', 'colour' => 'Natural', 'stock_qty' => 5, 'price_override' => $productData['base_price']],
                    ['product_id' => $productId, 'size' => 'M', 'colour' => 'Natural', 'stock_qty' => 8, 'price_override' => $productData['base_price']],
                    ['product_id' => $productId, 'size' => 'L', 'colour' => 'Natural', 'stock_qty' => 6, 'price_override' => $productData['base_price']],
                    ['product_id' => $productId, 'size' => 'XL', 'colour' => 'Natural', 'stock_qty' => 3, 'price_override' => $productData['base_price']],
                ]);

                // Create product image
                DB::table('product_images')->insert([
                    'product_id' => $productId,
                    'url' => "/catalogue/{$category->slug}.webp",
                    'sort_order' => 0,
                ]);
            }
        }

        // Create delivery zones
        DB::table('delivery_zones')->insert([
            ['name' => 'In-store pickup — Ange Raphael boutique', 'name_fr' => 'Retrait en boutique — Ange Raphael', 'method' => 'pickup', 'fee' => 0, 'eta_label' => 'Ready within 24h', 'eta_label_fr' => 'Prêt sous 24h', 'is_active' => true],
            ['name' => 'National shipping — Cameroon', 'name_fr' => 'Livraison nationale — Cameroun', 'method' => 'national', 'fee' => 6500, 'eta_label' => '2–4 days', 'eta_label_fr' => '2–4 jours', 'is_active' => true],
        ]);

        // Create settings
        $settings = [
            ['key' => 'site_name', 'value' => 'OSSZ Collections'],
            ['key' => 'currency', 'value' => 'XAF'],
            ['key' => 'whatsapp_number', 'value' => '237694068219'],
            ['key' => 'whatsapp_number2', 'value' => '237651468831'],
            ['key' => 'email', 'value' => 'info@osszcollection.com'],
            ['key' => 'address', 'value' => 'Ange Raphael, Douala, Cameroon'],
            ['key' => 'hours_weekday', 'value' => 'Monday to Friday, 9:00am - 6:00pm'],
            ['key' => 'hours_saturday', 'value' => 'Saturday, 9:00am - 1:00pm'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->insert($setting);
        }
    }
}
