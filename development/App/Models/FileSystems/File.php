<?php

namespace App\Models\FileSystems;

use \App\Models\FileSystems\PlatformHelpers;

class File extends TreeItem
{
	protected $fullFileName = NULL;
	protected $extension = NULL;
	protected $content = NULL;
	protected $encoding = NULL;
	protected $atime = NULL;
	protected $ctime = NULL;
	
	public function __construct (\SplfileInfo $spl, $rootItemId = NULL) {
		parent::__construct($spl, $rootItemId);
		$this->fullFileName = $spl->getFilename();
		$this->extension = $spl->getExtension();
		$this->fullPath = $this->dirPath . '/' . $this->fullFileName;
	}
	
	public function HasChildren () {
		return FALSE;
	}
	public function GetChildren ($visibleOnly = FALSE, $sortProperty = 'baseName', $sortDirection = 'ASC') {
		return [];
    }
	public function GetTreeMetaData () {
		$result = parent::GetTreeMetaData();
		$sizeBytes = $this->GetSizeBytes();
		$result->sizeBytes = $sizeBytes . ($sizeBytes !== '0' ? ' ' . \App\Models\Translator::Translate('bytes') : '');
		$result->sizeUnits = $this->GetSizeUnits();
		return $result;
	}

	public function GetMimeType () {
		if ($this->mimeType === NULL) {
			try {
				list($this->encoding, $this->mimeType) = PlatformHelpers\Finfo::GetEncodingAndMimeType(
					$this->fullPath
				);
			} catch (\Exception $e) {
				$this->encoding = 'unknown';
				$this->mimeType = 'unknown';
				$this->errors[] = $e->getMessage();
			}
		}
		return $this->mimeType;
	}

	public function GetType () {
		if ($this->type === NULL) 
			$this->type = PlatformHelpers\Finfo::GetType(
				$this->GetMimeType(), $this->extension
			);
		return $this->type;
	}

	public function GetFullFileName () {
		return $this->fullFileName;
	}
	public function GetExtension () {
		return $this->extension;
	}
	public static function GetByFullPathAndRootId ($fullPath, $rootId) {
		clearstatcache(TRUE, $fullPath);
		if (!file_exists($fullPath)) return NULL;
		$spl = new \SplFileInfo($fullPath);
		if ($spl === NULL) return NULL;
		return new static($spl, $rootId);
	}
    public function GetContent () {
		if ($this->content === NULL) {
			$this->content = file_get_contents($this->fullPath);
		}
		return $this->content;
    }
    public function GetSizeBytes () {
		if ($this->sizeBytes === NULL) 
			$this->sizeBytes = PlatformHelpers\Size::GetBytesFileSize($this->spl);
		return $this->sizeBytes;
    }
	public function GetEncoding () {
		$this->GetMimeType();
		return $this->encoding;
	}

	public function GetTreeIdsPath () {
		$pathIds = [$this->GetTreeId()];
		$dirPath = $this->dirPath;
		$rootId = $this->GetRootId();
		while (TRUE) {
			$firstSlashPos = mb_strpos($dirPath, '/');
			$lastSlashPos = mb_strrpos($dirPath, '/');
			if ($firstSlashPos === $lastSlashPos) {
				$parentDir = new Directory(new \SplFileInfo($dirPath), $rootId);
				$pathIds[] = $parentDir->GetTreeId();
				$dirPath = dirname($dirPath);
				$parentDir = new Drive(new \SplFileInfo($dirPath), $rootId);
				$pathIds[] = $parentDir->GetTreeId();
				break;
			} else {
				$parentDir = new Directory(new \SplFileInfo($dirPath), $rootId);
				$pathIds[] = $parentDir->GetTreeId();
				$dirPath = $parentDir->GetDirPath();
			}
		}
		$pathIds = array_reverse($pathIds);
		return implode('/', $pathIds);
	}
	
	public function GetTimeLastAccess () {
		if ($this->atime === NULL) {
			set_error_handler([__CLASS__, 'ErrorHandler'], E_ALL); 
			$atime = fileatime($this->fullPath);
			restore_error_handler();
			if (self::$error !== NULL) {
				$atime = 0;
				$this->errors[] = self::$error[1];
				self::$error = NULL;
			}
			$this->atime = $atime;
		}
		return $this->atime;
	}
	
	public function GetTimeCreation () {
		if ($this->ctime === NULL) {
			if (PlatformHelper::GetPlatform() !== PlatformHelper::PLAFORM_WINDOWS) {
				$this->ctime = self::GetTimeLastChange();
			} else {
				set_error_handler([__CLASS__, 'ErrorHandler'], E_ALL); 
				$ctime = filectime($this->fullPath);
				restore_error_handler();
				if (self::$error !== NULL) {
					$ctime = 0;
					$this->errors[] = self::$error[1];
					self::$error = NULL;
				}
				$this->ctime = $ctime;
			}
		}
		return $this->ctime;
	}
}

