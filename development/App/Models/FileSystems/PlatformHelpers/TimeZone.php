<?php

namespace App\Models\FileSystems\PlatformHelpers;

class TimeZone extends \App\Models\FileSystems\PlatformHelper
{
	protected static $systemTimeZone = NULL;

	public static function GetSystemTimeZone () {
		if (self::$systemTimeZone === NULL) {
			$platform = self::GetPlatform();
			$systemTimeZone = NULL;
			if ($platform == self::PLAFORM_UNIX) {
				$systemTimeZone = self::getSystemTimeZoneUnix();
			} else if ($platform == self::PLAFORM_WINDOWS) {
				$systemTimeZone = self::getSystemTimeZoneWindows();
			} else if ($platform == self::PLAFORM_MAC) {
				$systemTimeZone = self::getSystemTimeZoneMac();
			}
			if ($systemTimeZone === NULL) {
				$phpTimeZone = @ini_get('date.timezone');
				if ($phpTimeZone !== FALSE) 
					$systemTimeZone = $phpTimeZone;
			}
			self::$systemTimeZone = $systemTimeZone;
		}
		return self::$systemTimeZone;
	}

	protected static function getSystemTimeZoneUnix () {
		$systemTimeZone = NULL;
		$timeZoneSubStr = 'Time zone: ';
		$rawTimeZone = self::System('timedatectl | grep "' . $timeZoneSubStr . '"');
		if ($rawTimeZone !== FALSE) {
			$rawTimeZone = trim($rawTimeZone);
			$rawTimeZone = mb_substr($rawTimeZone, mb_strlen($timeZoneSubStr));
			$spacePos = mb_strpos($rawTimeZone, ' ');
			if ($spacePos === FALSE) $spacePos = mb_strlen($rawTimeZone);
			$systemTimeZone = mb_substr($rawTimeZone, 0, $spacePos);
		}
		return $systemTimeZone;
	}

	protected static function getSystemTimeZoneWindows () {
		$systemTimeZone = NULL;
		// if `system()` function is allowed
		if (function_exists('system')) {
			$request = \MvcCore\Application::GetInstance()->GetRequest();
			$tmpFullPath = self::getSystemTimeZoneWindowsGetTmpPath($request);
			$tmpfileExists = file_exists($tmpFullPath);
			if ($tmpfileExists) {
				// some timezone is in cache place
				$content = trim(file_get_contents($tmpFullPath));
				// check if bg process is still running or if there is anything saved
				if (mb_strlen($content) > 0 && $content !== 'false') 
					$systemTimeZone = $content;
			} else {
				$phpOk = self::System('php -n -r "echo 1;"');
				// try to get timezone completed by long background process:
				if ($phpOk === '1' && !$tmpfileExists) {
					// if timezone is not in cache place, 
					// completed by background process, 
					// run background process and create empty
					// cache place about bg process is running
					file_put_contents($tmpFullPath, '');
					$phpIniLocation = str_replace('\\', '/', php_ini_loaded_file());
					$lastSlash = mb_strrpos($phpIniLocation, '/');
					$phpDirectory = mb_substr($phpIniLocation, 0, $lastSlash === FALSE ? mb_strlen($phpIniLocation) : $lastSlash);
					$scriptFullPath = $request->GetAppRoot() . '/' . trim($request->GetScriptName(), '/');
					$cmd = 'php.exe "' . $scriptFullPath . '" controller=bg-tasks action=win-time-zone';
					self::AddBackgroundJob(function () use ($cmd, $phpDirectory) {
						sleep(1);
						return self::System($cmd, $phpDirectory);
					});
				}
			}
		}
		return $systemTimeZone;
	}

	protected static function getSystemTimeZoneWindowsGetTmpPath (& $request) {
		$scriptFullPath = $request->GetAppRoot() . '/' . trim($request->GetScriptName(), '/');
		$tmpFileName = 'timezone_' . md5($scriptFullPath) . '.tmp';
		$tmpPath = str_replace('\\', '/', getenv('SystemRoot') . '/Temp');
		return $tmpPath . '/' . $tmpFileName;
	}

	public static function GetSystemTimeZoneWindowsBgProcess () {
		$result = 'false';
		$request = \MvcCore\Application::GetInstance()->GetRequest();
		$tmpFullPath = self::getSystemTimeZoneWindowsGetTmpPath($request);
		$cmd = 'systeminfo | findstr  /C:"Time Zone:"';
		$result = self::System($cmd);
		//$result = 'Time Zone:                 (UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague';
		$timezonePos = mb_strpos($result, 'Time Zone:');
		if ($timezonePos !== FALSE) {
			$result = trim(mb_substr($result, $timezonePos + 10));
			preg_match("#\(UTC([\+\-])([\d]{2})\:([\d]{2})\)#", $result, $matches);
			if ($matches && $matches[0]) {
				$sign = $matches[1] === '+' ? '-' : '+';
				$result = 'Etc/GMT' . $sign . ltrim($matches[2], '0');
				$success = date_default_timezone_set($result);
				if (!$success) $result = 'false';
			}
		}
		file_put_contents($tmpFullPath, $result);
	}

	protected static function getSystemTimeZoneMac () {
		$systemTimeZone = NULL;
		if (function_exists('system')) {
			$rawTimeZone = self::System('systemsetup -gettimezone');
			if ($rawTimeZone) {
				$rawTimeZone = trim($rawTimeZone);
				$timeZoneSubStr = 'Time Zone: ';
				if (mb_strpos($rawTimeZone, $timeZoneSubStr) === 0) {
					$systemTimeZone = trim(mb_substr($rawTimeZone, mb_strlen($timeZoneSubStr)));
					$success = date_default_timezone_set($systemTimeZone);
					if (!$success) $systemTimeZone = NULL;
				}	
			}
		}
		return $systemTimeZone;
	}
}
