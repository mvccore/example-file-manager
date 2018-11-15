<?php

namespace App\Models\FileSystems\PlatformHelpers;

class Attrs extends \App\Models\FileSystems\PlatformHelper
{
	protected static $cache = [];

	/**
	 * @param string $fullPath
	 * @return \bool[]|string Example: win: [archive, readOnly, hidden, system], other: 0666
	 */
	public static function GetAttrs ($fullPath) {
		if (isset(self::$cache[$fullPath])) 
			return self::$cache[$fullPath];
		if (self::GetPlatform() == self::PLAFORM_WINDOWS) {
			// [archive, readOnly, hidden, system]
			$sysOut = self::System('attrib ' . escapeshellarg($fullPath));
			if ($sysOut === FALSE) {
				$result = [NULL,NULL,NULL,NULL];
			} else {
				$sysOut = str_replace('\\', '/', $sysOut);
				$fullPathPos = mb_strpos($sysOut, $fullPath);
				if ($fullPathPos !== FALSE) $sysOut = mb_substr($sysOut, 0, $fullPathPos);
				$sysOut = str_replace(' ', '', $sysOut);
				$result = [
					strpos($sysOut, 'A') !== FALSE,
					strpos($sysOut, 'R') !== FALSE,
					strpos($sysOut, 'H') !== FALSE,
					strpos($sysOut, 'S') !== FALSE
				];
			}
		} else {
			$result = strval(fileperms($fullPath));
		}
		self::$cache[$fullPath] = $result;
		return $result;
	}

	/**
	 * @param string $fullPath
	 * @param \bool[]|string|int $attrs Example: win: [archive, readOnly, hidden, system], other: 0666
	 * @return bool
	 */
	public static function SetAttrs ($fullPath, $attrs) {
		self::$cache[$fullPath] = $attrs;
		if (self::GetPlatform() == self::PLAFORM_WINDOWS) {
			// [archive, readOnly, hidden, system]
			list($archive, $readOnly, $hidden, $system) = $attrs;
			$cmd = 'attrib '
				. ($system ? '+' : '-') . 'S '
				. ($hidden ? '+' : '-') . 'H '
				. ($archive ? '+' : '-') . 'A '
				. ($readOnly ? '+' : '-') . 'R '
				. escapeshellarg($fullPath);
			$sysOut = self::System($cmd);
			if ($sysOut === FALSE) return FALSE;
			return TRUE;
		} else {
			return chmod($fullPath, $attrs);
		}
	}
}
