<?php

namespace App\Models\FileSystems\PlatformHelpers;

class Finfo extends \App\Models\FileSystems\PlatformHelper
{
	protected static $baseMimeTypesAndTypes = [
		'directory'									=> 'directory',
		'link'										=> 'link',
		'image'										=> 'image',
		'video'										=> 'video',
		'audio'										=> 'audio',
		'music'										=> 'audio',
		'x-music'									=> 'audio',
		'font'										=> 'font',
	];

	protected static $extsMimeTypessAndTypes = [
		'exe|application/octet-stream'				=> 'executable',
		'bin|application/octet-stream'				=> 'executable',
		'pkg|application/octet-stream'				=> 'executable',
		'exe|application/octet-stream'				=> 'executable',
		'msi|application/octet-stream'				=> 'executable',
		'arj|application/octet-stream'				=> 'executable',
		'com|application/octet-stream'				=> 'executable',
		'exe|application/x-msdownload'				=> 'executable',
		'com|application/x-msdownload'				=> 'executable',
		'bat|application/x-msdownload'				=> 'executable',
		'msi|application/x-msdownload'				=> 'executable',
		'doc|application/vnd.ms-office'				=> 'document',
		'docx|application/vnd.ms-office'			=> 'document',
		'xls|application/vnd.ms-office'				=> 'sheet',
		'xlsx|application/vnd.ms-office'			=> 'sheet',
		'ppt|application/vnd.ms-office'				=> 'presentation',
		'pptx|application/vnd.ms-office'			=> 'presentation',
		'conf|text/plain'							=> 'code',
		'ini|text/plain'							=> 'code',
		'c|text/plain'								=> 'code',
		'c++|text/plain'							=> 'code',
		'cc|text/plain'								=> 'code',
		'com|text/plain'							=> 'code',
		'cxx|text/plain'							=> 'code',
		'f|text/plain'								=> 'code',
		'f90|text/plain'							=> 'code',
		'for|text/plain'							=> 'code',
		'g|text/plain'								=> 'code',
		'h|text/plain'								=> 'code',
		'hh|text/plain'								=> 'code',
		'idc|text/plain'							=> 'code',
		'jav|text/plain'							=> 'code',
		'java|text/plain'							=> 'code',
		'lst|text/plain'							=> 'code',
		'm|text/plain'								=> 'code',
		'mar|text/plain'							=> 'code',
		'pl|text/plain'								=> 'code',
		'sdml|text/plain'							=> 'code',
		'json|text/plain'							=> 'code',
		'lock|text/plain'							=> 'code',
		'htaccess|text/plain'						=> 'code',
		'cmd|text/plain'							=> 'code',
		'bat|text/plain'							=> 'code',
		'cmd|text/x-msdos-batch'					=> 'code',
		'bat|text/x-msdos-batch'					=> 'code',
		'sh|text/plain'								=> 'code',
		'sql|text/plain'							=> 'code',
		'php|application/octet-stream'				=> 'code',
	];
	
	protected static $mimeTypesAndTypes = [
		'application/x-compressed'					=> 'archive',
		'multipart/x-zip'							=> 'archive',
		'application/zip'							=> 'archive',
		'application/x-zip-compressed'				=> 'archive',
		'application/x-gzip'						=> 'archive',
		'application/x-gtar'						=> 'archive',
		'application/x-rar'							=> 'archive',
		'application/x-compress'					=> 'archive',
		'application/x-7z-compressed'				=> 'archive',

		'application/vnd.android.package-archive'	=> 'executable',
		'application/x-msdos-program'				=> 'executable',
		'application/x-dosexec'						=> 'executable',
		
		'application/xml'							=> 'code',
		'text/asp'									=> 'code',
		'text/coffeescript'							=> 'code',
		'text/css'									=> 'code',
		'text/csv'									=> 'code',
		'text/ecmascript'							=> 'code',
		'text/html'									=> 'code',
		'text/jade'									=> 'code',
		'text/javascript'							=> 'code',
		'text/jsp'									=> 'code',
		'text/jsx'									=> 'code',
		'text/less'									=> 'code',
		'text/markdown'								=> 'code',
		'text/mathml'								=> 'code',
		'text/pascal'								=> 'code',
		'text/sgml'									=> 'code',
		'text/slim'									=> 'code',
		'text/x-c'									=> 'code',
		'text/x-php'								=> 'code',
		'text/x-component'							=> 'code',
		'text/x-java-source'						=> 'code',
		'text/x-lua'								=> 'code',
		'text/x-m'									=> 'code',
		'text/x-markdown'							=> 'code',
		'text/x-nfo'								=> 'code',
		'text/x-pascal'								=> 'code',
		'text/x-sass'								=> 'code',
		'text/x-script'								=> 'code',
		'text/x-script.lisp'						=> 'code',
		'text/x-script.perl'						=> 'code',
		'text/x-script.perl-module'					=> 'code',
		'text/x-script.phyton'						=> 'code',
		'text/x-script.sh'							=> 'code',
		'text/x-script.zsh'							=> 'code',												
		'text/x-scss'								=> 'code',												
		'text/x-server-parsed-html'					=> 'code',
		'text/xml'									=> 'code',
		'text/yaml'									=> 'code',
		
		'application/pdf'															=> 'acrobat',
		'message/rfc822'															=> 'email',

		'application/msword'														=> 'document',
		'application/vnd.ms-word.document.macroenabled.12'							=> 'document',
		'application/vnd.ms-word.template.macroenabled.12'							=> 'document',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document'	=> 'document',
		'application/vnd.oasis.opendocument.text'									=> 'document',

		'application/excel'															=> 'sheet',
		'application/vnd.ms-excel'													=> 'sheet',
		'application/vnd.ms-excel.addin.macroenabled.12'							=> 'sheet',
		'application/vnd.ms-excel.sheet.binary.macroenabled.12'						=> 'sheet',
		'application/vnd.ms-excel.sheet.macroenabled.12'							=> 'sheet',
		'application/vnd.ms-excel.template.macroenabled.12'							=> 'sheet',
		'application/x-excel'														=> 'sheet',
		'application/x-msexcel'														=> 'sheet',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'			=> 'sheet',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.template'		=> 'sheet',
		'application/vnd.oasis.opendocument.spreadsheet'							=> 'sheet',
		'application/vnd.oasis.opendocument.spreadsheet-template'					=> 'sheet',
		
		'application/mspowerpoint'													=> 'presentation',
		'application/powerpoint'													=> 'presentation',
		'application/vnd.ms-powerpoint'												=> 'presentation',
		'application/x-mspowerpoint'												=> 'presentation',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation'	=> 'presentation',
		'application/vnd.openxmlformats-officedocument.presentationml.slide'		=> 'presentation',
		'application/vnd.openxmlformats-officedocument.presentationml.slideshow'	=> 'presentation',
		'application/vnd.openxmlformats-officedocument.presentationml.template'		=> 'presentation',
		'application/vnd.oasis.opendocument.presentation'							=> 'presentation',
		'application/vnd.oasis.opendocument.presentation-template'					=> 'presentation',

		'text/plain'																=> 'text',
	];

	public static function GetEncodingAndMimeType ($fullPath) {
		$finfo = finfo_open(FILEINFO_MIME | FILEINFO_MIME_ENCODING);
		$rawMimeType = @finfo_file($finfo, $fullPath);
		finfo_close($finfo);
		if ($rawMimeType === FALSE) {
			$encoding = 'unknown';
			$mimeType = 'unknown';
		} else {
			$encoding = 'unknown';
			$semicolonPos = strpos($rawMimeType, ';');
			if ($semicolonPos !== FALSE) {
				$mimeType = substr($rawMimeType, 0, $semicolonPos);
				$encoding = trim(substr($rawMimeType, $semicolonPos + 1));
				$equalPos = strpos($encoding, '=');
				$equalPos = $equalPos === FALSE ? 0 : $equalPos + 1;
				$encoding = substr($encoding, $equalPos);
			} else {
				$mimeType = $rawMimeType;
			}
		}
		return [$encoding, $mimeType];
	}

	public static function GetType ($mimeType, $extension = NULL) {
		if ($mimeType === 'unknown') return $mimeType;
		$slashPos = strpos($mimeType, '/');
		if ($slashPos === FALSE) $slashPos = strlen($mimeType);
		$baseType = substr($mimeType, 0, $slashPos);
		if (isset(self::$baseMimeTypesAndTypes[$baseType]))
			return self::$baseMimeTypesAndTypes[$baseType];
		if ($extension !== NULL) {
			$extAndMimeTypeKey = mb_strtolower($extension) . '|' . $mimeType;
			if (isset(self::$extsMimeTypessAndTypes[$extAndMimeTypeKey]))
				return self::$extsMimeTypessAndTypes[$extAndMimeTypeKey];
		if (isset(self::$mimeTypesAndTypes[$mimeType]))
			return self::$mimeTypesAndTypes[$mimeType];
		}
		return 'binary';
	}
}
