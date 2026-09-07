<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Coupon;
use App\Models\DeliveryZone;
use App\Models\Faq;
use App\Models\HomeBlock;
use App\Models\JournalPost;
use App\Models\LookbookItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Support\Auth;
use Illuminate\Database\Seeder;

/**
 * Seeds the same reference data the Next.js shop bootstrapped itself with
 * (scripts/seed.mjs, seed-fr.mjs, seed-real.mjs, seed-staff-logins.mjs):
 * staff logins, categories, collections, catalogue pieces, delivery zones,
 * settings, homepage blocks, FAQs, journal and a welcome coupon.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Staff logins ───────────────────────────────────────────────
        $staff = [
            ['email' => 'admin@osszcollection.com', 'username' => 'admin', 'full_name' => 'OSSZ Admin', 'role' => 'admin', 'password' => 'OsszAdmin2026!'],
            ['email' => 'staff@osszcollection.com', 'username' => 'staff', 'full_name' => 'OSSZ Staff', 'role' => 'staff', 'password' => 'OsszStaff2026!'],
            ['email' => 'uploader@osszcollection.com', 'username' => 'uploader', 'full_name' => 'OSSZ Uploader', 'role' => 'uploader', 'password' => 'OsszUpload2026!'],
        ];
        foreach ($staff as $s) {
            User::updateOrCreate(
                ['email' => $s['email']],
                [
                    'username' => $s['username'],
                    'full_name' => $s['full_name'],
                    'role' => $s['role'],
                    'password_hash' => Auth::hashPassword($s['password']),
                ]
            );
        }

        // ── Categories ─────────────────────────────────────────────────
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
            ['name' => 'Cufflinks', 'name_fr' => 'Boutons de manchette', 'slug' => 'cufflinks', 'sort_order' => 10],
            ['name' => 'Bags', 'name_fr' => 'Sacs', 'slug' => 'bags', 'sort_order' => 11],
            ['name' => 'Tie / Cravate', 'name_fr' => 'Cravate', 'slug' => 'tie-cravate', 'sort_order' => 12],
            ['name' => 'Bold Tie', 'name_fr' => 'Cravate audacieuse', 'slug' => 'bold-tie', 'sort_order' => 13],
            ['name' => 'Accessories', 'name_fr' => 'Accessoires', 'slug' => 'accessories', 'sort_order' => 14],
        ];
        foreach ($categories as $c) {
            Category::updateOrCreate(['slug' => $c['slug']], $c);
        }

        // ── Collections ────────────────────────────────────────────────
        $collections = [
            ['name' => 'Check Moves', 'slug' => 'check-moves', 'season' => '2023', 'description' => 'Geometric precision meets bold pattern.', 'name_fr' => 'Check Moves', 'season_fr' => '2023', 'description_fr' => 'Précision géométrique et motifs audacieux.', 'cover_image' => '/collections/check-moves.webp'],
            ['name' => 'Freeme', 'slug' => 'freeme', 'season' => '2021', 'description' => 'Freedom expressed in fabric.', 'name_fr' => 'Freeme', 'season_fr' => '2021', 'description_fr' => 'La liberté exprimée en tissu.', 'cover_image' => '/collections/freeme.webp'],
            ['name' => '95 VIVS Element', 'slug' => '95-vivs-element', 'season' => '2022', 'description' => 'A tribute to Douala streets.', 'name_fr' => '95 VIVS Élément', 'season_fr' => '2022', 'description_fr' => 'Un hommage aux rues de Douala.', 'cover_image' => '/collections/95-vivs.webp'],
            ['name' => 'Cultural Canvas', 'slug' => 'cultural-canvas', 'season' => '2024', 'description' => 'Every garment is a canvas.', 'name_fr' => 'Toile Culturelle', 'season_fr' => '2024', 'description_fr' => 'Chaque vêtement est une toile.', 'cover_image' => '/collections/cultural-canvas.webp'],
            ['name' => 'Cultural Heritage', 'slug' => 'cultural-heritage', 'season' => '2024', 'description' => 'The pieces that outlast seasons.', 'name_fr' => 'Patrimoine Culturel', 'season_fr' => '2024', 'description_fr' => 'Les pièces qui survivent aux saisons.', 'cover_image' => '/collections/cultural-heritage.webp'],
        ];
        foreach ($collections as $i => $col) {
            Collection::updateOrCreate(['slug' => $col['slug']], $col + ['sort_order' => $i]);
        }

        // ── Catalogue ──────────────────────────────────────────────────
        $pieces = [
            ['name' => 'Midnight Agbada', 'name_fr' => 'Agbada Minuit', 'base_price' => 185000, 'category' => 'agbada', 'collection' => 'cultural-heritage', 'featured' => true, 'description' => 'Three-piece agbada in deep midnight adire, hand-embroidered at the neckline.', 'description_fr' => 'Agbada trois pièces en adire bleu minuit, brodé main au col.'],
            ['name' => 'Ivory Kaftan', 'name_fr' => 'Kaftan Ivoire', 'base_price' => 95000, 'category' => 'kaftans', 'collection' => 'cultural-canvas', 'featured' => true, 'description' => 'Flowing silk-blend kaftan in ivory with raffia trim.', 'description_fr' => 'Kaftan fluide en soie mélangée, ivoire, avec liseré en raphia.'],
            ['name' => 'Liberty Silk Shirt', 'name_fr' => 'Chemise Soie Liberté', 'base_price' => 45000, 'category' => 'shirts', 'collection' => 'freeme', 'description' => 'Relaxed silk shirt with tonal embroidery.', 'description_fr' => 'Chemise en soie décontractée avec broderie tonale.'],
            ['name' => 'Palazzo Trousers', 'name_fr' => 'Pantalon Palazzo', 'base_price' => 55000, 'category' => 'pants', 'collection' => '95-vivs-element', 'description' => 'High-waisted palazzo trousers in crisp cotton.', 'description_fr' => 'Pantalon palazzo taille haute en coton net.'],
            ['name' => 'Heritage Bold Tie', 'name_fr' => 'Cravate Héritage', 'base_price' => 25000, 'category' => 'bold-tie', 'collection' => 'cultural-heritage', 'description' => 'Wide silk tie in heritage wax print.', 'description_fr' => 'Cravate large en soie, imprimé wax patrimonial.'],
            ['name' => 'Urban Sandals', 'name_fr' => 'Sandales Urbaines', 'base_price' => 35000, 'category' => 'sandals', 'collection' => '95-vivs-element', 'description' => 'Leather sandals with woven raffia footbed.', 'description_fr' => 'Sandales en cuir à semelle tressée en raphia.'],
            ['name' => 'Check Move Blazer', 'name_fr' => 'Blazer Check Moves', 'base_price' => 125000, 'category' => 'ready-to-wear', 'collection' => 'check-moves', 'featured' => true, 'description' => 'Single-breasted blazer in signature check wool.', 'description_fr' => 'Blazer une pièce en laine à carreaux signature.'],
            ['name' => 'Danshiki Moderne', 'name_fr' => 'Danshiki Moderne', 'base_price' => 65000, 'category' => 'danshiki', 'collection' => 'freeme', 'description' => 'Contemporary danshiki tunic with woven neckline.', 'description_fr' => 'Tunique danshiki contemporaine à col tissé.'],
            ['name' => 'Leather Weekend Bag', 'name_fr' => 'Sac Week-end Cuir', 'base_price' => 85000, 'category' => 'bags', 'collection' => 'cultural-heritage', 'description' => 'Weekender in vegetable-tanned leather.', 'description_fr' => 'Sac de week-end en cuir à tannage végétal.'],
            ['name' => 'Silk Cravat Set', 'name_fr' => 'Ensemble Cravate Soie', 'base_price' => 32000, 'category' => 'tie-cravate', 'collection' => 'check-moves', 'description' => 'Cravat and pocket square in printed silk.', 'description_fr' => 'Foulard cravate et pochette en soie imprimée.'],
            ['name' => 'Oversize Boubou', 'name_fr' => 'Boubou Oversize', 'base_price' => 75000, 'category' => 'oversize', 'collection' => 'freeme', 'description' => 'Oversize boubou in airy hand-woven cotton.', 'description_fr' => 'Boubou oversize en coton tissé main aérien.'],
            ['name' => 'Gold Cufflinks', 'name_fr' => 'Boutons de Manchette Dorés', 'base_price' => 28000, 'category' => 'cufflinks', 'collection' => 'cultural-heritage', 'description' => 'Engraved brass cufflinks with amber stone.', 'description_fr' => 'Boutons de manchette en laiton gravé, pierre ambrée.'],
        ];

        foreach ($pieces as $piece) {
            $category = Category::where('slug', $piece['category'])->first();
            $collection = Collection::where('slug', $piece['collection'])->first();
            if (! $category || ! $collection) {
                continue;
            }

            $product = Product::updateOrCreate(
                ['slug' => slugify($piece['name'])],
                [
                    'name' => $piece['name'],
                    'name_fr' => $piece['name_fr'] ?? '',
                    'description' => $piece['description'] ?? '',
                    'description_fr' => $piece['description_fr'] ?? '',
                    'details' => 'Hand-finished in our Douala atelier.',
                    'details_fr' => 'Fini à la main dans notre atelier de Douala.',
                    'care_instructions' => 'Dry clean only. Store folded in the provided garment bag.',
                    'care_instructions_fr' => 'Nettoyage à sec uniquement. Ranger plié dans la housse fournie.',
                    'category_id' => $category->id,
                    'collection_id' => $collection->id,
                    'base_price' => $piece['base_price'],
                    'is_published' => true,
                    'is_featured' => (bool) ($piece['featured'] ?? false),
                    'popularity' => random_int(3, 40),
                ]
            );

            $colours = ['Ivory', 'Noir', 'Sand'];
            foreach (['S', 'M', 'L'] as $i => $size) {
                ProductVariant::updateOrCreate(
                    ['product_id' => $product->id, 'size' => $size, 'colour' => $colours[$i % 3]],
                    ['stock_qty' => random_int(2, 12), 'low_stock_threshold' => 3]
                );
            }

            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'sort_order' => 0],
                ['url' => '/catalogue/'.$category->slug.'.webp', 'alt_text' => $piece['name']]
            );
        }

        // ── Delivery zones ─────────────────────────────────────────────
        $zones = [
            ['name' => 'In-store pickup — Ange Raphael boutique', 'name_fr' => 'Retrait en boutique — Ange Raphael', 'method' => 'pickup', 'fee' => 0, 'eta_label' => 'Ready within 24h', 'eta_label_fr' => 'Prêt sous 24h'],
            ['name' => 'Douala local delivery', 'name_fr' => 'Livraison locale Douala', 'method' => 'douala_local', 'fee' => 2000, 'eta_label' => 'Same day', 'eta_label_fr' => 'Le jour même'],
            ['name' => 'National shipping — Cameroon', 'name_fr' => 'Livraison nationale — Cameroun', 'method' => 'national', 'fee' => 6500, 'eta_label' => '2–4 days', 'eta_label_fr' => '2 à 4 jours'],
        ];
        foreach ($zones as $zone) {
            DeliveryZone::updateOrCreate(['name' => $zone['name']], $zone + ['is_active' => true]);
        }

        // ── Settings ───────────────────────────────────────────────────
        $settings = [
            'whatsapp_number' => '+237694068219',
            'whatsapp_number2' => '+237651468831',
            'store_address' => 'Ange Raphael, Douala, Cameroon',
            'business_hours' => 'Monday to Friday, 9:00am - 6pm. Saturday 9:00am - 1pm',
            'contact_email' => 'info@osszcollection.com',
            'cod_enabled' => 'false',
            'mobile_money_enabled' => 'true',
            'card_enabled' => 'true',
            'free_delivery_threshold' => '150000',
        ];
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // ── Homepage blocks ────────────────────────────────────────────
        HomeBlock::updateOrCreate(
            ['type' => 'hero', 'sort_order' => 0],
            [
                'heading' => 'A Douala atelier, an African hand, a modern wardrobe',
                'heading_fr' => 'Un atelier à Douala, une main africaine, un vestiaire moderne',
                'body' => '',
                'image_url' => '/catalogue/editorial-b.webp',
                'cta_label' => 'Shop the collection',
                'cta_label_fr' => 'Voir la collection',
                'cta_href' => '/shop',
                'is_published' => true,
            ]
        );
        HomeBlock::updateOrCreate(
            ['type' => 'banner', 'sort_order' => 1],
            [
                'eyebrow' => 'Cultural Heritage',
                'eyebrow_fr' => 'Patrimoine Culturel',
                'heading' => 'The pieces that outlast seasons',
                'heading_fr' => 'Les pièces qui survivent aux saisons',
                'body' => 'Hand-embroidered adire, woven raffia and tailored wool — the heritage edit.',
                'body_fr' => 'Adire brodé main, raphia tissé et laine tailleur — la sélection patrimoine.',
                'image_url' => '/catalogue/editorial-a.webp',
                'cta_label' => 'Discover',
                'cta_label_fr' => 'Découvrir',
                'cta_href' => '/collections/cultural-heritage',
                'is_published' => true,
            ]
        );
        HomeBlock::updateOrCreate(
            ['type' => 'quote', 'sort_order' => 2],
            [
                'eyebrow' => 'By reservation',
                'eyebrow_fr' => 'Sur réservation',
                'heading' => 'Private styling at the boutique',
                'heading_fr' => 'Styling privé à la boutique',
                'body' => 'One hour with a stylist, eight measurements kept on file, alterations included.',
                'body_fr' => 'Une heure avec un styliste, huit mesures conservées, retouches incluses.',
                'cta_label' => 'Book an appointment',
                'cta_label_fr' => 'Prendre rendez-vous',
                'cta_href' => '/appointments',
                'is_published' => true,
            ]
        );

        // ── FAQs ───────────────────────────────────────────────────────
        $faqs = [
            ['category' => 'Delivery', 'category_fr' => 'Livraison', 'question' => 'How long does delivery take?', 'question_fr' => 'Quels sont les délais de livraison ?', 'answer' => 'Douala deliveries arrive the same day. National shipping reaches every region of Cameroon in 2–4 days. In-store pickup is ready within 24 hours.', 'answer_fr' => 'Les livraisons à Douala arrivent le jour même. L\'expédition nationale couvre tout le Cameroun en 2 à 4 jours. Le retrait en boutique est prêt sous 24 heures.', 'sort_order' => 1],
            ['category' => 'Payment', 'category_fr' => 'Paiement', 'question' => 'Which payment methods do you accept?', 'question_fr' => 'Quels moyens de paiement acceptez-vous ?', 'answer' => 'MTN Mobile Money, Orange Money, Visa and Mastercard. Cash on delivery is available in Douala on request.', 'answer_fr' => 'MTN Mobile Money, Orange Money, Visa et Mastercard. Le paiement à la livraison est possible à Douala sur demande.', 'sort_order' => 2],
            ['category' => 'Returns', 'category_fr' => 'Retours', 'question' => 'Can I return a piece?', 'question_fr' => 'Puis-je retourner une pièce ?', 'answer' => 'Unworn pieces may be returned within 14 days with their garment bag. Complimentary alterations are included within 30 days of purchase.', 'answer_fr' => 'Les pièces non portées sont reprises sous 14 jours avec leur housse. Les retouches sont offertes dans les 30 jours suivant l\'achat.', 'sort_order' => 3],
            ['category' => 'Sizing', 'category_fr' => 'Tailles', 'question' => 'How do OSSZ sizes run?', 'question_fr' => 'Comment taillent les pièces OSSZ ?', 'answer' => 'Our ready-to-wear runs true to size with generous ease through the shoulder. XS fits FR 34, S fits FR 36, M fits FR 38, L fits FR 40.', 'answer_fr' => 'Notre prêt-à-porter taille normalement, avec une aisance généreuse à l\'épaule. XS correspond au FR 34, S au FR 36, M au FR 38, L au FR 40.', 'sort_order' => 4],
        ];
        foreach ($faqs as $faq) {
            Faq::updateOrCreate(['question' => $faq['question']], $faq);
        }

        // ── Journal ────────────────────────────────────────────────────
        JournalPost::updateOrCreate(
            ['slug' => 'notes-from-the-atelier'],
            [
                'title' => 'Notes from the atelier',
                'title_fr' => 'Notes de l\'atelier',
                'excerpt' => 'What a week of cutting, dyeing and fitting looks like on Ange Raphael street.',
                'excerpt_fr' => 'Une semaine de coupe, de teinture et d\'essayages rue Ange Raphael.',
                'body' => "Monday begins with the adire bath.\nOur indigo vats are kept alive from week to week, and the depth of the blue tells you the mood of the season...\n\nEvery piece leaves the atelier pressed, bagged and signed by the hand that finished it.",
                'body_fr' => "Lundi commence par le bain d'adire.\nNos cuves d'indigo se gardent de semaine en semaine, et la profondeur du bleu annonce l'humeur de la saison...\n\nChaque pièce quitte l'atelier repassée, ensachée et signée par la main qui l'a finie.",
                'author_name' => 'OSSZ Studio',
                'status' => 'published',
                'published_at' => now(),
            ]
        );

        // ── Lookbook ───────────────────────────────────────────────────
        LookbookItem::updateOrCreate(
            ['image_url' => '/catalogue/editorial-a.webp', 'sort_order' => 0],
            ['title' => 'Heritage in motion', 'caption' => 'The heritage edit, worn in Douala light.', 'caption_fr' => 'La sélection patrimoine, portée dans la lumière de Douala.', 'media_type' => 'image']
        );
        LookbookItem::updateOrCreate(
            ['image_url' => '/catalogue/editorial-b.webp', 'sort_order' => 1],
            ['title' => 'Evening hour', 'caption' => 'Silk, gold and midnight blue for the evening hour.', 'caption_fr' => 'Soie, or et bleu minuit pour l\'heure du soir.', 'media_type' => 'image']
        );

        // ── Welcome coupon ─────────────────────────────────────────────
        Coupon::updateOrCreate(
            ['code' => 'BONJOUR10'],
            ['type' => 'percentage', 'value' => 10, 'is_active' => true]
        );
    }
}
