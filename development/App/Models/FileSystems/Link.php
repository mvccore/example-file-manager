<?php

namespace App\Models\FileSystems;

use \App\Models\FileSystems\PlatformHelpers;

class Link extends TreeItem
{
	protected $targetBaseName = NULL;
	protected $targetDirPath = NULL;
	protected $targetFullPath = NULL;
	protected $targetSpl = NULL;
	protected $targetIsFile = NULL;

	protected $encoding = NULL;
	protected $extension = NULL;

	public function __construct (\SplfileInfo $spl, $rootItemId = NULL) {
		parent::__construct($spl, $rootItemId);
		$this->fullPath = $this->dirPath . '/' . $spl->getFilename();
		$this->targetFullPath = PlatformHelpers\Link::ReadLink($this->spl);
		$this->targetSpl = new \SplFileInfo($this->targetFullPath);
		$lastSlashPos = mb_strrpos($this->targetFullPath, '/');
		if ($lastSlashPos === FALSE) $lastSlashPos = mb_strlen($this->targetFullPath);
		$this->targetBaseName = mb_substr($this->targetFullPath, $lastSlashPos + 1);
		$this->targetDirPath = mb_substr($this->targetFullPath, 0, $lastSlashPos);
		$this->targetIsFile = is_file($this->targetFullPath) && !is_dir($this->targetFullPath);
		if ($this->targetIsFile) {
			$lastDotPos = mb_strrpos($this->targetBaseName, '.');
			if ($lastDotPos === FALSE) {
				$this->extension = '';
			} else {
				$this->extension = mb_substr($this->targetBaseName, 0, $lastDotPos);
			}
		}
	}
	
	public function GetTreeMetaData () {
		$result = parent::GetTreeMetaData();
		$result->name = $this->getTargetName();
		$result->path = $this->getTargetPath();
		if ($this->targetIsFile) {
			$sizeBytes = $this->GetSizeBytes();
			$result->sizeBytes = $sizeBytes . ($sizeBytes !== '0' ? ' ' . \App\Models\Translator::Translate('bytes') : '');
			$result->sizeUnits = $this->GetSizeUnits();
		} else {
			// do not load recursively directory size for tree displaying
			$result->sizeBytes = "0";
			$result->sizeUnits = "0";
		}
		return $result;
	}
	public function GetTreeText () {
		return $this->baseName . ' [' . $this->getTargetName() . ']';
	}
	public function HasChildren () {
		if ($this->hasChildren === NULL) {
			$this->hasChildren = FALSE;
			$targetFullPath = $this->GetTargetFullPath();
			if (!$this->targetIsFile) {
				try {
				$di = new \DirectoryIterator($targetFullPath);
					foreach ($di as $item) {
						if ($item->isDot()) continue;
						$this->hasChildren = TRUE;
						break;
					}
				} catch (\Exception $e) {
					$this->hasChildren = TRUE;
					$this->errors[] = $e->getMessage();
				}
			}
		}
		return $this->hasChildren;
    }
	public function GetChildren ($visibleOnly = FALSE, $sortProperty = 'baseName', $sortDirection = 'ASC') {
		if ($this->children === NULL) {
			$targetFullPath = $this->GetTargetFullPath();
			if (!$this->targetIsFile) {
				try {
					$this->children = Tree::GetItemsByFullPath(
						$targetFullPath, $visibleOnly, $sortProperty, $sortDirection
					);
				} catch (\Exception $e) {
					$this->children = [];
					$this->errors[] = $e->getMessage();
				}
			} else {
				$this->children = [];
			}
		}
		return $this->children;
    }

	public function GetTimeLastChange () {
		$targetSpl = $this->GetTarget();
		$mtime = 0;
		try {
			$mtime = $targetSpl->getMTime();
		} catch (\Exception $e) {
			$this->errors[] = $e->getMessage();
		}
		return $mtime;
	}
	
	
	public function GetMimeType () {
		if ($this->mimeType === NULL) {
			if ($this->targetIsFile) {
				try {
					list($this->encoding, $this->mimeType) = PlatformHelpers\Finfo::GetEncodingAndMimeType(
						$this->targetFullPath
					);
				} catch (\Exception $e) {
					$this->mimeType = 'unknown';
					$this->encoding = 'unknown';
					$this->errors[] = $e->getMessage();
				}
			} else {
				$this->mimeType = 'directory';
				$this->encoding = 'unknown';
			}
		}
		return $this->mimeType;
	}

	public function GetType () {
		if ($this->type === NULL) {
			if ($this->targetIsFile) {
				$this->type = PlatformHelpers\Finfo::GetType(
					$this->GetMimeType(), $this->extension
				);
			} else {
				$this->type = 'directory';
			}
		}
		return $this->type;
	}
	public function GetEncoding () {
		$this->GetMimeType();
		return $this->encoding;
	}
    public function GetContent () {
		if ($this->content === NULL && $this->targetIsFile) {
			$this->content = file_get_contents($this->targetFullPath);
		}
		return $this->content;
    }
    public function GetSizeBytes () {
		if ($this->sizeBytes === NULL) {
			if ($this->targetIsFile) {
				$this->sizeBytes = PlatformHelpers\Size::GetBytesFileSize($this->targetSpl);
			} else {
				$this->sizeBytes = PlatformHelpers\Size::GetBytesDirectorySize($this->targetSpl);
			}
		}
		return $this->sizeBytes;
	}
	
	public function GetTarget () {
		return $this->targetSpl;
	}
	public function GetTargetFullPath () {
		return $this->targetFullPath;
	}
	protected function getTargetName () {
		if ($this->targetName === NULL) {
			$targetFullPath = $this->GetTargetFullPath();
			$lastSlash = mb_strrpos($targetFullPath, '/');
			$lastSlash = $lastSlash === FALSE
				? mb_strlen($targetFullPath)
				: $lastSlash + 1;
			$this->targetName = mb_substr($targetFullPath, $lastSlash);
			$this->targetPath = mb_substr($targetFullPath, 0, $lastSlash - 1);
		}
		return $this->targetName;
	}
	protected function getTargetPath () {
		if ($this->targetPath === NULL) {
			$targetFullPath = $this->GetTargetFullPath();
			$lastSlash = mb_strrpos($targetFullPath, '/');
			$lastSlash = $lastSlash === FALSE
				? mb_strlen($targetFullPath)
				: $lastSlash + 1;
			$this->targetName = mb_substr($targetFullPath, $lastSlash);
			$this->targetPath = mb_substr($targetFullPath, 0, $lastSlash - 1);
		}
		return $this->targetPath;
	}
}

