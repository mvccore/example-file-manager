<?php

namespace App\Models\FileSystems;

use \App\Models\FileSystems\PlatformHelper,
	\App\Models\FileSystems\PlatformHelpers,
	\App\Models\FileSystems\ITreeItem;

abstract class	TreeItem 
extends			\App\Models\Base
implements		IFileSystemObject, 
				ITreeItem
{
	protected static $error = NULL;

	protected $baseName = NULL;
	protected $dirPath = NULL;
	protected $spl = NULL;
	protected $rootItemId = NULL;

	protected $fullPath = NULL;
	protected $hasChildren = NULL;
	protected $children = NULL;
	protected $hidden = NULL;
	protected $className = NULL;
	protected $sizeBytes = NULL;
	protected $sizeUnits = NULL;
	protected $mimeType = NULL;
	protected $type = NULL;
	protected $errors = [];
	protected $mtime = NULL;

	public function __construct (\SplfileInfo $spl, $rootItemId = NULL) {
		$this->baseName = $spl->getBasename();
		$this->dirPath = str_replace('\\', '/', $spl->getPath());
		$this->spl = $spl;
		$this->rootItemId = $rootItemId;
	}
	
	abstract public function GetMimeType ();
	abstract public function GetType ();
    abstract public function GetSizeBytes ();

	public function GetTreeText () {
		return $this->baseName;
	}
	public function GetTreeId () {
		return sha1(implode('|', [
			basename(str_replace('\\', '/', get_class($this))),
			$this->rootItemId === NULL ? 'NULL' : $this->rootItemId,
			$this->fullPath
		]));
	}
	public function GetRootId () {
		if ($this->rootItemId === NULL) 
			return sha1(implode('|', [
				basename(str_replace('\\', '/', get_class($this))),
				'NULL',
				$this->fullPath
			]));
		return $this->rootItemId;
	}
	public function GetErrors () {
		return $this->errors;
	}
	public function GetTreeMetaData () {
		return (object) [
			'className'	=> $this->GetClassName(),
			'name'		=> $this->GetBaseName(),
			'path'		=> $this->getDirPath(),
			'lastChange'=> $this->GetTimeLastChange(),
			'hidden'	=> $this->GetHidden(),
			'mimeType'	=> $this->GetMimeType(),
			'type'		=> $this->GetType(),
		];
	}
	public function GetFullPath () {
		return $this->fullPath;
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
	public function GetChildren ($visibleOnly = FALSE, $sortProperty = 'baseName', $sortDirection = 'ASC') {
		if ($this->children === NULL) {
			try {
				$this->children = Items::GetItemsByFullPath($this->fullPath, $visibleOnly, $sortProperty, $sortDirection);
			} catch (\Exception $e) {
				$this->children = [];
				$this->errors[] = __METHOD__.'(): ' . $e->getMessage();
			}
		}
		return $this->children;
    }
	
	public function GetBaseName () {
		return $this->baseName;
	}
	public function GetDirPath () {
		return $this->dirPath;
	}
	public function GetHidden () {
		if ($this->hidden === NULL)
			$this->hidden = PlatformHelpers\Hidden::LoadHiddenAttr($this->spl);
		return $this->hidden;
	}
	public function SetHidden ($hidden) {
		$this->hidden = $hidden;
		return $this;
	}
    public function GetSizeUnits () {
		if ($this->sizeUnits === NULL) {
			if ($this->sizeBytes === NULL) $this->GetSizeBytes();
			$this->sizeUnits = PlatformHelpers\Size::GetUnitsSizeFromBytes($this->sizeBytes);
		}
		return $this->sizeUnits;
	}
	public function GetTimeLastChange () {
		if ($this->mtime === NULL) {
			set_error_handler([__CLASS__, 'ErrorHandler'], E_ALL); 
			$mtime = filemtime($this->fullPath);
			restore_error_handler();
			if (self::$error !== NULL) {
				$mtime = 0;
				$this->errors[] = self::$error[1];
				self::$error = NULL;
			}
			$this->mtime = $mtime;
		}
		return $this->mtime;
	}
	public static function ErrorHandler ($level, $msg, $file, $line, $args) {
		self::$error = func_get_args();
	}

	public function GetClassName () {
		if ($this->className === NULL) {
			$classExploded = explode('\\', get_class($this));
			$this->className = $classExploded[count($classExploded) - 1];
		}
		return $this->className;
	}

	/**
	 * @return \bool[]|string
	 */
	public function GetAttrs () {
		return PlatformHelper::GetAttrs($this->fullPath);
	}

	/**
	 * @param \bool[]|string|int $attrs
	 * @return bool
	 */
	public function SetAttrs ($attrs) {
		return PlatformHelper::SetAttrs($this->fullPath, $attrs);
	}
}
