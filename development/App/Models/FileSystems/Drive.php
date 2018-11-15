<?php

namespace App\Models\FileSystems;

use \App\Models\FileSystems\PlatformHelpers;

class Drive extends TreeItem
{
	protected $sizeBytesFree = NULL;

	public function __construct (\SplfileInfo $spl, $rootItemId = NULL) {
		$this->baseName = '';
		$this->dirPath = trim($spl->getPathname(), '\\/');
		$this->spl = $spl;
		$this->fullPath = $this->dirPath;
	}

	public function GetMimeType () {
		return 'drive';
	}
	public function GetType () {
		return 'drive';
	}

	public function GetTreeText () {
		return $this->fullPath;
	}
	public function GetTimeLastChange () {
		return 0;
	}
	public function GetTreeMetaData () {
		return (object) [
			'className'	=> $this->GetClassName(),
			'name'		=> $this->fullPath,
			'path'		=> $this->fullPath,
			'lastChange'=> '',
			'hidden'	=> FALSE,
			'mimeType'	=> $this->GetMimeType(),
			'type'		=> $this->GetType(),
			'sizeBytes'	=> '0',
			'sizeUnits'	=> '0',
		];
	}

	public function HasChildren () {
		if ($this->hasChildren === NULL) {
			$this->hasChildren = FALSE;
			try {
				$di = new \DirectoryIterator($this->fullPath);
				foreach ($di as $item) {
					if ($item->isDot()) continue;
					$this->hasChildren = TRUE;
					break;
				}
			} catch (\Exception $e) {
				$this->hasChildren = TRUE;
				$this->errors[] = __METHOD__.'(): ' . $e->getMessage();
			}
		}
		return $this->hasChildren;
    }
    public function GetSizeBytes () {
		if ($this->sizeBytes === NULL) {
			if (function_exists('disk_total_space')) {
				$this->sizeBytes = @disk_total_space($this->fullPath);
			} else {
				$this->sizeBytes = '0';
			}
		}
		return $this->sizeBytes;
	}
    public function GetSizeBytesFree () {
		if ($this->sizeBytesFree === NULL) {
			if (function_exists('disk_free_space')) {
				$this->sizeBytesFree = @disk_free_space($this->fullPath);
			} else {
				$this->sizeBytesFree = '0';
			}
		}
		return $this->sizeBytesFree;
	}
    public function GetSizeUnitsFree () {
		if ($this->sizeUnitsFree === NULL) {
			if ($this->sizeBytesFree === NULL) $this->GetSizeBytesFree();
			$this->sizeUnitsFree = PlatformHelpers\Size::GetUnitsSizeFromBytes($this->sizeBytesFree);
		}
		return $this->sizeUnitsFree;
	}
}
