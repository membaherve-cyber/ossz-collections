<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Serves files uploaded to storage/app (payment proofs, lookbook videos,
 * media library) through a controller so shared hosts never need a
 * storage symlink.
 */
class MediaFileController extends Controller
{
    public function show(string $path)
    {
        $base = realpath(storage_path('app'));
        $full = realpath(storage_path('app'.DIRECTORY_SEPARATOR.$path));

        if ($base === false || $full === false || ! str_starts_with($full, $base) || ! is_file($full)) {
            abort(404);
        }

        return new BinaryFileResponse($full, 200, [
            'Content-Type' => mime_content_type($full) ?: 'application/octet-stream',
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }
}
