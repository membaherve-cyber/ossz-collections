<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'details', 'care_instructions',
        'name_fr', 'description_fr', 'details_fr', 'care_instructions_fr',
        'category_id', 'collection_id', 'base_price', 'is_published', 'is_featured',
        'popularity', 'seo_title', 'seo_description',
    ];
    protected $casts = [
        'base_price' => 'integer', 'is_published' => 'boolean', 'is_featured' => 'boolean',
        'popularity' => 'integer', 'created_at' => 'datetime',
    ];

    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function collection(): BelongsTo { return $this->belongsTo(Collection::class); }
    public function variants(): HasMany { return $this->hasMany(ProductVariant::class); }
    public function images(): HasMany { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }

    public function getNameAttribute(): string { return $this->name; }
}
