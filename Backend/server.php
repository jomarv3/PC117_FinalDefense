<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
$publicRoot = realpath(__DIR__.'/public');
$storageRoot = realpath(__DIR__.'/storage/app/public');
$path = realpath(__DIR__.'/public'.$uri);

if ($uri !== '/' && $path && is_file($path)) {
    $isPublicFile = $publicRoot && str_starts_with($path, $publicRoot);
    $isStorageFile = $storageRoot && str_starts_with($path, $storageRoot);

    if ($isPublicFile || $isStorageFile) {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        if ($extension === 'php') {
            return false;
        }

        $contentTypes = [
            'css' => 'text/css',
            'gif' => 'image/gif',
            'html' => 'text/html',
            'ico' => 'image/x-icon',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'png' => 'image/png',
            'svg' => 'image/svg+xml',
            'webp' => 'image/webp',
        ];

        header('Content-Type: '.($contentTypes[$extension] ?? 'application/octet-stream'));
        header('Content-Length: '.filesize($path));
        readfile($path);

        return true;
    }
}

require_once __DIR__.'/public/index.php';
