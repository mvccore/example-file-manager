<?php

namespace App\Models\FileSystems;

use \App\Models\FileSystems\PlatformHelpers;

class Directory extends TreeItem
{
	protected $dirName = NULL;

	public function __construct (\SplfileInfo $spl, $rootItemId = NULL) {
		parent::__construct($spl, $rootItemId);
		$this->dirName = $spl->getFilename();
		$this->fullPath = $this->dirPath . '/' . $this->dirName;
	}
	public function GetTreeMetaData () {
		$result = parent::GetTreeMetaData();
		// do not load recursively directory size for tree displaying
		$result->sizeBytes = '0';
		$result->sizeUnits = '0';
		return $result;
	}
	
	public function GetMimeType () {
		return 'directory';
	}
	public function GetType () {
		if ($this->dirName == '$RECYCLE.BIN' && mb_strpos($this->dirPath, '/') === FALSE) {
			if (PlatformHelper::GetPlatform() == PlatformHelper::PLAFORM_WINDOWS)
				return 'recyclebin';
		}
		return 'directory';
	}
	
	public function GetDirName () {
		return $this->dirName;
	}
    public function GetSizeBytes () {
		if ($this->sizeBytes === NULL) 
			$this->sizeBytes = PlatformHelpers\Size::GetDirectorySize($this->spl);
		return $this->sizeBytes;
	}
}
