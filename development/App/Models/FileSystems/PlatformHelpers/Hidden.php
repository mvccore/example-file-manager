<?php

namespace App\Models\FileSystems\PlatformHelpers;

class Hidden extends \App\Models\FileSystems\PlatformHelper
{
	protected static $winDirsHiddenItems = [];

	public static function LoadHiddenAttr (\SplFileInfo $spl) {
		$platform = self::GetPlatform();
		if ($platform === self::PLAFORM_UNIX) {
			return mb_substr($spl->getBasename(), 0, 1) === '.';
		} else {
			$dirPath = str_replace('\\', '/', $spl->getPath());
			$hiddenItems = self::getItemDirWinHiddenItems($dirPath);
			return isset($hiddenItems[$spl->getFilename()]);
		}
	}

	protected static function getItemDirWinHiddenItems ($dirPath) {
		if (isset(self::$winDirsHiddenItems[$dirPath])) {
			$hiddenItems = self::$winDirsHiddenItems[$dirPath];
		} else {
			$hiddenItems = [];
			$sysOut = self::System('dir /A:H', $dirPath);
			if ($sysOut !== FALSE) {
				$sysOutLines = explode(PHP_EOL, $sysOut);
				$hiddenItems = [];
				foreach ($sysOutLines as $sysOutLine) {
					if (mb_strlen($sysOutLine) === 0) continue;
					$firstChar = mb_substr($sysOutLine, 0, 1);
					if ($firstChar === ' ') continue;
					$dateTypeOrSize = rtrim(mb_substr($sysOutLine, 0, 36));
					$fileName = mb_substr($sysOutLine, 36);
					if (mb_strpos($dateTypeOrSize, '<JUNCTION>') !== FALSE) {
						$fileNameEndPos = mb_strrpos($fileName, ' [');
						if ($fileNameEndPos === FALSE) $fileNameEndPos = mb_strlen($fileName);
						$fileName = mb_substr($fileName, 0, $fileNameEndPos);
					}
					$hiddenItems[$fileName] = TRUE;
				}
			}
			self::$winDirsHiddenItems[$dirPath] = $hiddenItems;
		}
		return $hiddenItems;
	}
}
