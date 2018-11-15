<?php

namespace App\Models\FileSystems\PlatformHelpers;

class Link extends \App\Models\FileSystems\PlatformHelper
{
	protected static $winDirsLinkItems = [];

	public static function IsLink (\SplFileInfo $spl) {
		$platform = self::GetPlatform();
		$splFileName = $spl->getFilename();
		if ($platform === self::PLAFORM_UNIX) {
			return is_link($spl->getPath() . '/' . $splFileName);
		} else {
			$dirPath = str_replace('\\', '/', $spl->getPath());
			$linkItems = self::getItemDirWinSymLinks($dirPath);
			return isset($linkItems[$splFileName]);
		}
	}

	public static function ReadLink (\SplFileInfo $spl) { 
		$platform = self::GetPlatform();
		$splFileName = $spl->getFilename();
		if ($platform === self::PLAFORM_UNIX) {
			return readlink($spl->getPath() . '/' . $splFileName);
		} else {
			$dirPath = str_replace('\\', '/', $spl->getPath());
			$linkItems = self::getItemDirWinSymLinks($dirPath);
			return $linkItems[$splFileName];
		}
	}
	
	protected static function getItemDirWinSymLinks ($dirPath) {
		if (isset(self::$winDirsLinkItems[$dirPath])) {
			$linkItems = self::$winDirsLinkItems[$dirPath];
		} else {
			$linkItems = [];
			$sysOut = self::System('dir /A:L', $dirPath);
			if ($sysOut !== FALSE) {
				$sysOutLines = explode(PHP_EOL, $sysOut);
				foreach ($sysOutLines as $sysOutLine) {
					if (mb_strlen($sysOutLine) === 0) continue;
					$firstChar = mb_substr($sysOutLine, 0, 1);
					if ($firstChar === ' ') continue;
					$fileNameWithTarget = mb_substr($sysOutLine, 36);
					$fileNameWithTargetLength = mb_strlen($fileNameWithTarget);
					$fileNameEndPos = mb_strrpos($fileNameWithTarget, ' [');
					if ($fileNameEndPos === FALSE) {
						$fileNameEndPos = mb_strlen($fileNameWithTarget);
					} else {
						$fileNameEndPos += 2;
					}
					$fileName = mb_substr($fileNameWithTarget, 0, $fileNameEndPos - 2);
					$target = str_replace('\\', '/', mb_substr($fileNameWithTarget, $fileNameEndPos, $fileNameWithTargetLength - $fileNameEndPos - 1));
					$linkItems[$fileName] = $target;
				}
			}
			self::$winDirsLinkItems[$dirPath] = $linkItems;
		}
		return $linkItems;
	}
}
