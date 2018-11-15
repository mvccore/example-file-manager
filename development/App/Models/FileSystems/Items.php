<?php

namespace App\Models\FileSystems;

use \App\Models\FileSystems\PlatformHelpers;

class Items extends \App\Models\Base
{
	public static function GetItems (
		$rootItemId, 
		$fullPath, 
		$visibleOnly = FALSE, 
		$offset = 0,
		$limit = 0,
		$sortProperty = 'baseName', 
		$sortDirection = 'ASC'
	) {
		list($totalCount, $rawItems) = self::getByFullPathAllSortedRawItems(
			$fullPath, $visibleOnly, $offset, $limit, $sortProperty, $sortDirection
		);
		if ($offset > 0 || $limit > 0) {
			if ($offset > 0 && $limit === 0) {
				$rawItems = array_slice($rawItems, $offset);
			} else {
				$rawItems = array_slice($rawItems, $offset, $limit);
			}
		}
		$resultItems = self::getByFullPathCompleteDirsAndFiles($rawItems, $rootItemId);
		return [$totalCount, $resultItems];
	}

	public static function GetRootItems (
		$sortProperty = 'fullPath', 
		$sortDirection = 'ASC'
	) {
		$fullPath = '';
		$configuredRootItems = self::GetConfigRootItems();
		if (count($configuredRootItems) > 0) {
			$resultItems = self::getByFullPathCompleteDrives(
				$configuredRootItems, $sortProperty, $sortDirection
			);
			return [count($resultItems), $resultItems];
		} else {
			$rawItems = PlatformHelpers\Drives::GetDrives();
			if ($rawItems) {
				$resultItems = self::getByFullPathCompleteDrives(
					$rawItems, $sortProperty, $sortDirection
				);
				return [count($resultItems), $resultItems];
			} else {
				$fullPath = \MvcCore\Application::GetInstance()->GetRequest()->GetAppRoot();
				$rootItem = new Drive(new \SplFileInfo($fullPath), NULL);
				list($totalCount, $rawItems) = self::getByFullPathAllSortedRawItems(
					$fullPath, FALSE, 0, 0, $sortProperty, $sortDirection
				);
				$resultItems = self::getByFullPathCompleteDirsAndFiles($rawItems, $rootItem->GetTreeId());
				return [$totalCount, $resultItems];
			}
		}
	}

	protected static function getByFullPathAllSortedRawItems (
		$fullPath, 
		$visibleOnly = FALSE, 
		$offset = 0,
		$limit = 0,
		$sortProperty = 'baseName', 
		$sortDirection = 'ASC'
	) {
		$dirSpl = new \SplFileInfo($fullPath);
		if (PlatformHelpers\Link::IsLink($dirSpl)) 
			$fullPath = PlatformHelpers\Link::ReadLink($dirSpl);
		$di = NULL;
		$dirs = [];
		$files = [];
		$dirsCount = 0;
		$filesCount = 0;
		try {
			$di = new \DirectoryIterator($fullPath);
		} catch (\Exception $e) {}
		if ($di) {
			/** @var $spl \SplFileInfo */
			foreach ($di as $spl) {
				if ($spl->isDot()) continue;
				$hiddenAttr = NULL;
				if ($visibleOnly) {
					$hiddenAttr = PlatformHelpers\Hidden::LoadHiddenAttr($spl);
					if ($hiddenAttr) continue;
				}
				self::getByFullPathAllSortedRawItem($spl, $dirs, $files, $sortProperty, $hiddenAttr);
			}
			$dirsCount = count($dirs);
			$filesCount = count($files);
			if ($offset < $dirsCount) 
				usort($dirs, function ($a, $b) use ($sortDirection) {
					return static::sort($a, $b, $sortDirection);
				});
			if ($offset + $limit > $dirsCount)
				usort($files, function ($a, $b) use ($sortDirection) {
					return static::sort($a, $b, $sortDirection);
				});
		}
		return [$dirsCount + $filesCount, array_merge($dirs, $files)];
	}

	protected static function getByFullPathAllSortedRawItem (\SplFileInfo & $spl, & $dirs, & $files, $sortProperty, $hiddenAttr) {
		$fullPath = str_replace('\\', '/', $spl->getPath()) . '/' . $spl->getFilename();
		$isDir = is_dir($fullPath);
		$isLink = FALSE;
		$isFile = FALSE;
		if (!$isDir && PlatformHelpers\Link::IsLink($spl)) {
			$isLink = TRUE;
			$targetFullPath = PlatformHelpers\Link::ReadLink($spl);
			if (is_file($targetFullPath)) {
				$isFile = TRUE;
			} else if (is_dir($targetFullPath)) {
				$isDir = TRUE;
			}
		} else {
			$isFile = TRUE;
		}
		if ($sortProperty === 'size') {
			$sortValue = $isFile ? PlatformHelpers\Size::GetBytesFileSize($spl) : '0';
		} else if ($sortProperty === 'fullPath') {
			$sortValue = $fullPath;
		} else {
			$getter = 'get' . ucfirst($sortProperty);
			$sortValue = $spl->{$getter}();
		}
		$item = [
			$fullPath, 
			$sortValue, 
			$hiddenAttr,
			$isDir,
			$isFile,
			$isLink,
		];
		if ($isDir) {
			$dirs[] = $item;
		} else {
			$files[] = $item;
		}
	}

	protected static function getByFullPathCompleteDrives (& $rawItems, $sortProperty = 'baseName', $sortDirection = 'ASC') {
		$rawDrives = [];
		foreach ($rawItems as $fullPath) {
			$spl = new \SplFileInfo($fullPath);
			$isDir = is_dir($fullPath);
			$isFile = FALSE;
			if (!$isDir && PlatformHelpers\Link::IsLink($spl)) {
				$targetFullPath = PlatformHelpers\Link::ReadLink($spl);
				if (is_file($targetFullPath)) {
					$isFile = TRUE;
				} else if (is_dir($targetFullPath)) {
					$isDir = TRUE;
				}
			} else {
				$isFile = TRUE;
			}
			if ($sortProperty === 'size') {
				$sortValue = $isFile ? PlatformHelpers\Size::GetBytesFileSize($spl) : '0';
			} else if ($sortProperty === 'fullPath') {
				$sortValue = $fullPath;
			} else {
				$getter = 'get' . ucfirst($sortProperty);
				$sortValue = $spl->{$getter}();
			}
			$rawDrives[] = [$spl, $sortValue];
		}
		usort($rawDrives, function ($a, $b) use ($sortDirection) {
			return static::sort($a, $b, $sortDirection);
		});
		$drives = [];
		foreach ($rawDrives as $rawDrive)
			$drives[] = new Drive($rawDrive[0], NULL);
		return $drives;
	}

	protected static function getByFullPathCompleteDirsAndFiles (& $rawItems, $rootItemId = NULL) {
		$dirs = [];
		$files = [];
		foreach ($rawItems as $rawItem) {
			list($realPath,, $hiddenAttr) = $rawItem;
			$spl = new \SplFileInfo($realPath);
			$splIsDir = is_dir($realPath);
			$splIsFile = FALSE;
			/** @var $item TreeItem */
			$item = NULL;
			if ($splIsDir) {
				$item = new Directory($spl, $rootItemId);
			} else if (PlatformHelpers\Link::IsLink($spl)) {
				/** @var $item Link */
				$item = new Link($spl, $rootItemId);
				$targetFullPath = $item->GetTargetFullPath();
				$splIsFile = is_file($targetFullPath);
			} else {
				$splIsFile = TRUE;
				$item = new File($spl, $rootItemId);
			}
			$item->SetHidden($hiddenAttr);
			if ($splIsFile) {
				$files[] = $item;
			} else {
				$dirs[] = $item;
			}
		}
		return array_merge($dirs, $files);
	}

	protected static function sort (array $a, array $b, $sortDirection = 'ASC') {
		$aVal = (string) $a[1];
		$bVal = (string) $b[1];
		if ($sortDirection == 'ASC') {
			return self::mb_strcasecmp($aVal, $bVal);
		} else {
			$r = self::mb_strcasecmp($aVal, $bVal);
			return $r === 1 ? -1 : ($r === -1 ? 1 : 0);
		}
	}

	protected static function mb_strcasecmp ($str1, $str2, $encoding = null) {
		if (null === $encoding) 
			$encoding = mb_internal_encoding();
		return strcmp(mb_strtoupper($str1, $encoding), mb_strtoupper($str2, $encoding));
	}
}
