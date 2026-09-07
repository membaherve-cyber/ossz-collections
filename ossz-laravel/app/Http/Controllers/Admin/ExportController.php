<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function csv(string $type): StreamedResponse
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::isAdmin($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Admins only.'));
        }

        $filename = "ossz-{$type}-".now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($type) {
            $out = fopen('php://output', 'w');
            match ($type) {
                'products' => $this->products($out),
                'customers' => $this->customers($out),
                default => $this->orders($out),
            };
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function orders($out): void
    {
        fputcsv($out, ['order_number', 'date', 'customer', 'email', 'phone', 'status', 'payment', 'subtotal', 'discount', 'delivery', 'total']);
        Order::orderBy('id')->chunk(500, function ($orders) use ($out) {
            foreach ($orders as $o) {
                fputcsv($out, [$o->order_number, $o->created_at, $o->customer_name, $o->guest_email, $o->guest_phone, $o->status, $o->payment_method, $o->subtotal, $o->discount, $o->delivery_fee, $o->total]);
            }
        });
    }

    private function products($out): void
    {
        fputcsv($out, ['id', 'name', 'slug', 'category', 'collection', 'base_price', 'published', 'featured', 'popularity']);
        Product::with(['category', 'collection'])->orderBy('id')->chunk(500, function ($products) use ($out) {
            foreach ($products as $p) {
                fputcsv($out, [$p->id, $p->name, $p->slug, $p->category?->name, $p->collection?->name, $p->base_price, $p->is_published ? 'yes' : 'no', $p->is_featured ? 'yes' : 'no', $p->popularity]);
            }
        });
    }

    private function customers($out): void
    {
        fputcsv($out, ['id', 'email', 'name', 'phone', 'role', 'joined']);
        User::orderBy('id')->chunk(500, function ($users) use ($out) {
            foreach ($users as $u) {
                fputcsv($out, [$u->id, $u->email, $u->full_name, $u->phone, $u->role, $u->created_at]);
            }
        });
    }
}
