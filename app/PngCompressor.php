<?php

class PngCompressor
{

	public static function compress($path, $name)
	{
		// Is image?
		$mimetype = Nette\Utils\MimeTypeDetector::fromFile($path);
		$isImage = in_array($mimetype, array('image/gif', 'image/png', 'image/jpeg'), TRUE);
		$isPng = $mimetype === 'image/png';

		if(!$isPng) {
			$output = array('status' => 'error',
					   'message' => ($isImage ? 'File is not PNG' : 'File is not image'));
			unlink($path);
		} else {

			/* PngQuant */
			$pngquantPath = LIBS_DIR . '/pngquant/pngquant';
			$pngquantPath .= (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') ? 'i.exe' : NULL;
			system($pngquantPath . ' -ext .png -force -speed 10 256 -- ' . FILES_DIR . '/' . escapeshellarg($name));
			/**/

			$relativepath = str_replace(WWW_DIR, '', $path);
			$output = array('status' => 'ok',
				   	   'filepath' => $relativepath,
				   	   'filename' => $name,
				   		);
		}

		return $output;
	}
}
