<?php

namespace App\Models\FileSystems\PlatformHelpers;

class Size extends \App\Models\FileSystems\PlatformHelper
{
	protected static $methods = [
		'getFileSizePhpStandard',
		'getFileSizeCurl',
		'getFileSizeFseek',
		'getFileSizeExec',
		'getFileSizeFread',
	];

	public static function GetUnitsSizeFromBytes ($bytesSizeStr) {
		$intMaxStr = (string) PHP_INT_MAX; // 32-bit: 2147483647, 64-bit: 9223372036854775807
		if ($bytesSizeStr < $intMaxStr) {
			$sizes = array('B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
			$sizeInt = intval($bytesSizeStr);
			if ($sizeInt === 0) return '0 B';
			$i = floor(log($sizeInt) / log(1024));
			$resultNumberStr = sprintf('%.03F', $sizeInt / pow(1024, $i));
			$resultUnit = $sizes[$i];
			if ($resultUnit == 'B') $resultNumberStr = rtrim($resultNumberStr, '.0');
			return $resultNumberStr . ' ' . $resultUnit;
		} else {
			$largeUnitsAndLimits = [
				"YB"	=> "1208925819614629174706176",
				"ZB"	=> "1180591620717411303424",
				"EB"	=> "1152921504606846976",	// max 64-bit int is always larger than ET limit
				"PB"	=> "1125899906842624",
				"TB"	=> "1099511627776",
				"GB"	=> "1073741824",			// max 32-bit int is always larger than GB limit
			];
			$unit = '';
			$result = '0';
			foreach ($largeUnitsAndLimits as $unit => $limitStr) {
				if ($bytesSizeStr >= $limitStr) {
					list ($quocient, $reminder) = Sizes\Calculator::GetInstance()->DivisionQuocientAndReminder($bytesSizeStr, $limitStr);
					if ($reminder !== '0') {
						$intMaxLengthMinusOne = strlen($intMaxStr) - 1;
						$reminderLength = strlen($reminder);
						$reminderRemainingLengthMinusMaxInt = $reminderLength - $intMaxLengthMinusOne;
						$limitLength = strlen($limitStr);
						$limitRemainingLengthMinusMaxInt = $limitLength - $intMaxLengthMinusOne;
						$remainingLengthToCut = max($reminderRemainingLengthMinusMaxInt, $limitRemainingLengthMinusMaxInt);
						if ($remainingLengthToCut > 0) {
							$reminderForInt = substr($reminder, 0, strlen($reminder) - $remainingLengthToCut);
							$limitForInt = substr($limitStr, 0, strlen($limitStr) - $remainingLengthToCut);
						} else {
							$reminderForInt = $reminder;
							$limitForInt = $limitStr;
						}
						$reminderInt = intval($reminderForInt);
						$limitInt = intval($limitForInt);
						$precision = substr(strval(intval(round($reminderInt / $limitInt * 10000))), 0, 3);
					} else {
						$precision = '0';
					}
					$result = $quocient . '.' . $precision;
					$unit = ' '.$unit;
					break;
				}
			}
			$fileSize = $result . $unit;
		}
		return $fileSize;
	}

	public static function GetBytesFileSize (\SplFileInfo $spl) {
		$bytesSize = "0";
		$dirPath = str_replace('\\', '/', $spl->getPath());
		$fullPath = $dirPath . '/' . $spl->getFilename();
		foreach (self::$methods as $method) {
			$bytesSize = self::{$method}($fullPath);
			if ($bytesSize !== FALSE) break;
		}
		return $bytesSize;
	}

	public static function GetBytesDirectorySize (\SplFileInfo $spl) {
		return "0";
	}

	protected static function getFileSizePhpStandard ($path) {
		$result = @filesize($path);
		if ($result === FALSE || $result < 0) return FALSE;
		return (string) $result;
	}

	protected static function getFileSizeCurl ($path) {
		if (!function_exists('curl_version')) return FALSE;
		$curl = curl_init('file://' . rawurlencode($path));
		curl_setopt_array($curl, [
			CURLOPT_NOBODY			=> TRUE,
			CURLOPT_RETURNTRANSFER	=> TRUE,
			CURLOPT_HEADER			=> TRUE,
		]);
		$data = curl_exec($curl);
		curl_close($curl);
		if ($data !== false && preg_match('/Content-Length: (\d+)/', $data, $matches)) 
			return $matches[1];
		return FALSE;
	}

	protected static function getFileSizeFseek ($path) {
		$handle = @fopen($path, 'rb'); // Permitions could be denied
		if (!$handle) return FALSE;
		$flockResult = flock($handle, LOCK_SH);
		$seekResult = fseek($handle, 0, SEEK_END);
		$position = ftell($handle);
		flock($handle, LOCK_UN);
		fclose($handle);
		if ($flockResult === FALSE) return FALSE;
		if ($seekResult !== 0) return FALSE;
		if ($position === FALSE) return FALSE;
		return (string) $position;
	}
	
	protected static function getFileSizeExec ($path) {
		if (!function_exists('system')) return FALSE;
		$platform = self::GetPlatform();
		$escapedPath = escapeshellarg($path);
		if ($platform == self::PLAFORM_UNIX) {
			$cmd = "stat -Lc%s $escapedPath";
		} else if ($platform == self::PLAFORM_WINDOWS) {
			$cmd = "for %F in ($escapedPath) do @echo %~zF";
		} else if ($platform == self::PLAFORM_MAC) {
			$cmd = "stat -f%z $escapedPath";
		} else {
			return FALSE;
		}
		$result = self::System($cmd);
		if (!is_string($result)) return FALSE;
		return $result;
	}

	protected static function getFileSizeFread ($path) {
		$handle = fopen($path, "rb");
		if (!$handle) return FALSE;
		flock($handle, LOCK_SH);
		rewind($handle);
		$fileSizeStr = "0";
		$chunkSize = max(
			1048576 /* 1 MB */, 
			intval(round(\App\Models\Base::GetPhpIniSizeLimit('memory_limit') * 0.2))
		);
		$bigIntCalculator = Sizes\Calculator::GetInstance();
		while (!feof($handle)) {
			$readBytes = strlen(fread($handle, $chunkSize));
			$fileSizeStr = $bigIntCalculator->Add($fileSizeStr, strval($readBytes));
		}
		flock($handle, LOCK_UN);
		fclose($handle);
		return $fileSizeStr;
	}
}
