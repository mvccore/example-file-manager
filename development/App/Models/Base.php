<?php

namespace App\Models;

class Base extends \MvcCore\Model
{
	protected static $rootItems = NULL;

	public static function GetConfigRootItems () {
		if (self::$rootItems === NULL) {
			$rootItems = [];
			$cfg = & Configuration::GetSystem();
			if (isset($cfg->common->rootItems)) {
				$rawRootItems = $cfg->common->rootItems;
				if (is_array($rawRootItems)) {
					foreach ($rawRootItems as $rawRootItem) 
						$rootItems[] = rtrim($rawRootItem, '\/');
				} else if (is_string($rawRootItems)) {
					$rootItems = [rtrim($rawRootItems, '\/')];
				}
			}
			self::$rootItems = $rootItems;
		}
		return self::$rootItems;
	}
	
	public static function GetPhpIniSizeLimit ($iniVarName) {
		$rawIniValue = @ini_get($iniVarName);
		if ($rawIniValue === FALSE) {
			return 0;
		} else if ($rawIniValue === NULL) {
			return NULL;
		}
		$unit = strtoupper(substr($rawIniValue, -1));
		$multiplier = (
			$unit == 'M' 
				? 1048576 
				: ($unit == 'K' 
					? 1024 
					: ($unit == 'G' 
						? 1073741824 
						: 1)));
		return intval($multiplier * floatval($rawIniValue));
	}
}
