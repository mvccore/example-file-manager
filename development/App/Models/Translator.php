<?php

namespace App\Models;

class Translator extends Base
{
	protected static $dataDir = '/Var/Translations';
	protected static $stores = [];
	protected static $lang = NULL;

	/**
	 * @param string $lang 
	 * @return void
	 */
	public static function SetLang ($lang) {
		self::$lang = $lang;
	}

	/**
	 * @param string $key 
	 * @param string $lang 
	 * @return string
	 */
	public static function Translate ($key, $lang = NULL) {
		$result = $key;
		if ($lang === NULL) $lang = self::$lang;
		if (!isset(self::$stores[$lang])) 
			self::GetAllTranslations($lang); // loads translations
		$store = & self::$stores[$lang];
		if (isset($store[$key])) 
			$result = $store[$key];
		return $result;
	}

	/**
	 * @param string $lang 
	 * @throws \Exception 
	 * @return array
	 */
	public static function & GetAllTranslations ($lang) {
		if (!isset(self::$stores[$lang])) {
			$store = [];
			$fileFullPath = \MvcCore\Application::GetInstance()->GetRequest()->GetAppRoot() 
				. self::$dataDir . '/' . $lang . '.csv';
			if (!file_exists($fileFullPath)) {
				if ($lang === Configuration::GetDefaultLang()) {
					$defaultEmptyStore = [];
					return $defaultEmptyStore;
				}
				throw new \Exception(
					"[".__CLASS__."] No translations defined. (path: '$fileFullPath')"
				);
			}
			$rawCsv = file_get_contents($fileFullPath);
			$rawCsvRows = explode("\n", str_replace("\r\n", "\n", $rawCsv));
			foreach ($rawCsvRows as $rowKey => $rawCsvRow) {
				list($key, $value) = str_getcsv($rawCsvRow, ";", '');
				if (isset($store[$key])) {
					$rowKey += 1;
					throw new \Exception(
						"[".__CLASS__."] Translation key already defined. "
						."(path: '$fileFullPath', row: '$rowKey', key: '$key')"
					);
				}
				$store[$key] = str_replace('\\n', "\n", $value);
			}
			self::$stores[$lang] = $store;
		}
		return self::$stores[$lang];
	}
}
