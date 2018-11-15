<?php

namespace App\Models\FileSystems\PlatformHelpers;

class Drives extends \App\Models\FileSystems\PlatformHelper
{
	protected static $drives = NULL;

	public static function GetDrives () {
		if (self::$drives === NULL) {
			$platform = self::GetPlatform();
			if ($platform == self::PLAFORM_UNIX) {
				self::$drives = self::getDrivesUnix();
			} else if ($platform == self::PLAFORM_WINDOWS) {
				self::$drives = self::getDrivesWindows();
			} else if ($platform == self::PLAFORM_MAC) {
				self::$drives = self::getDrivesMac();
			} else {
				self::$drives = [];
			}
		}
		return self::$drives;
	}

	protected static function getDrivesUnix () {
		$drives = ['/'];

		
		return $drives;
	}

	protected static function getDrivesWindows () {
		$drives = [];
		$sysOut = self::System('for /f "skip=1 delims=" %x in (\'wmic logicaldisk get caption\') do @echo.%x', NULL);
		if ($sysOut !== FALSE) {
			$sysOutLines = explode(PHP_EOL, $sysOut);
			foreach ($sysOutLines as $sysOutLine) 
				if ($trimmedLine = trim($sysOutLine))
					$drives[] = $trimmedLine;
		} else {
			$drives[] = 'C:';
		}
		return $drives;
	}

	protected static function getDrivesMac () {
		$drives = [];
		$sysOut = self::System('mount', NULL);
		if ($sysOut !== FALSE) {
			if (preg_match_all('/(.+)\s+on\s+(.+)\s+\((\w+).*\)\n/i', $sysOut, $m, PREG_SET_ORDER) == 0)
				return $drives;
			foreach ($m as $mount) {
				$drives[] = $mount[1];
			}
		} else {
			$drives[] = '/';
		}
		return $drives;
	}
}
