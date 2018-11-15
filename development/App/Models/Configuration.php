<?php

namespace App\Models;

class Configuration extends Base
{
	protected static $defaultConfiguration = [
		'localization'			=> [
			'lang'					=> 'en',
			'locale'				=> 'US',
		],
		'common'				=> [
			'visibleOnly'			=> FALSE,
			'alertOnAppClose'		=> FALSE,
			'timeZone'				=> 'Europe/London', // overwritten by loaded: ini_get('date.timezone')
		],
		'tree'					=> [
			'itemsPerPage'			=> 50,
		],
		'grid'					=> [
			'itemsPerPage'			=> 50,
		],
		'editor'				=> [
			'alertOnChangedTabClose'=> TRUE,
			'verticalLinePosition'	=> 120,
		],
	];
	
	protected static $cfg = NULL;

	public static function GetDefaultLang () {
		return self::$defaultConfiguration['localization']['lang'];
	}

	public static function & GetSystem () {
		if (self::$cfg === NULL) {
			$cfg = & \MvcCore\Config::GetSystem();
			if (!$cfg) $cfg = new \stdClass;
			if (is_array($cfg)) $cfg = (object) $cfg;
			$defaultCfg = self::$defaultConfiguration;
			if (!isset($cfg->common->timeZone)) {
				$serverTimeZone = \App\Models\FileSystems\PlatformHelpers\TimeZone::GetSystemTimeZone();
				if ($serverTimeZone) 
					$defaultCfg['common']['timeZone'] = $serverTimeZone;
			}
			foreach ($defaultCfg as $sectionName => $sectionData) {
				if (!isset($cfg->{$sectionName})) 
					$cfg->{$sectionName} = new \stdClass;
				$cfgSection = & $cfg->{$sectionName};
				foreach ($sectionData as $property => $value) {
					if (!isset($cfgSection->{$property}))
						$cfgSection->{$property} = $value;
				}
			}
			self::$cfg = & $cfg;
			date_default_timezone_set($cfg->common->timeZone);
		}
		return self::$cfg;
	}

}
