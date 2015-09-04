<?php

use Nette\Diagnostics\Debugger,
    Nette\Application\Routers\Route;

define('LIBS_DIR', __DIR__ . '/libs');
define('WWW_DIR', __DIR__);
define('FILES_DIR', __DIR__ . '/file');

function sanitizePath($path)
{
	$path = preg_replace('~(\.\.)+~', '', $path); // This is not necessary
	$path = preg_replace('~/+~', '', $path);
	return $path;
}

// Load libraries
require LIBS_DIR . '/Nette/loader.php';


// Enable Nette Debugger for error visualisation & logging
Debugger::$logDirectory = __DIR__ . '/log';
Debugger::enable();


// Configure application
$configurator = new Nette\Config\Configurator;
$configurator->setTempDirectory(__DIR__ . '/temp');
$container = $configurator->createContainer();

// Setup router
// Homepage and about
$container->router[] = new Route('<page (|about)>', function($presenter, $page) {
	$page = $page ?: 'default';
    return $presenter->createTemplate()->setFile(__DIR__ . '/app/' . $page . '.latte');
});

$container->router[] = new Route('process', function($presenter) {
	require __DIR__ . '/app/PngCompressor.php';

	/* Accept input */
	// Never trust user input	
	$filename = trim($_SERVER['HTTP_X_FILE_NAME']);
	$filename = sanitizePath($filename);
	$filepath = FILES_DIR . '/' . $filename;	
	
	// Save file
	$file = file_get_contents("php://input");
	file_put_contents($filepath, $file);	

	/* Process and send result */
	$response = PngCompressor::compress($filepath, $filename);	
	return new Nette\Application\Responses\JsonResponse($response);
});

// Download
$container->router[] = new Route('download/<filename>', function($presenter, $filename) {
    return new Nette\Application\Responses\FileResponse(FILES_DIR . '/' . sanitizePath($filename));
});


// Run the application!
$container->application->run();