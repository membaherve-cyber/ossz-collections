<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = ['email', 'username', 'phone', 'full_name', 'password_hash', 'role'];
    protected $hidden = ['password_hash'];
    protected $casts = ['created_at' => 'datetime'];

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function canFulfilOrders(): bool { return in_array($this->role, ['admin', 'staff']); }
    public function canManageCatalogue(): bool { return in_array($this->role, ['admin', 'staff', 'uploader']); }
}
