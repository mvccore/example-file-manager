<?php

namespace App\Controllers;

use \App\Models\FileSystems;

class File extends Base
{
	const CONTENT_PLACEHOLDER = '__FILE_CONTENT_PLACEHOLDER__';

	protected static $errorMsg = NULL;

	public static function ErrorHandler ($level, $msg, $file, $line, $args) {
		self::$errorMsg = $msg;
	}

	public function ReadAction () {
		$rootId = $this->GetParam('rootId', FALSE);
		$fullPath = base64_decode($this->GetParam('fullPath', FALSE));
		$this->renderRead($rootId, $fullPath, TRUE);
	}

	public function UpdateAction () {
		$oldRootId = $this->GetParam('rootId', FALSE);
		$oldFullPath = base64_decode($this->GetParam('fullPath', FALSE));
		$baseName = base64_decode($this->GetParam('baseName', FALSE));
		$dirPath = base64_decode($this->GetParam('dirPath', FALSE));
		$encoding = $this->GetParam('encoding', '-a-zA-Z0-9_');
		$content = $this->GetParam('content', FALSE);
		$content = $content !== NULL ? base64_decode($this->GetParam('content', FALSE)) : NULL;
		$lastChange = $this->GetParam('lastChange', FALSE, 0, 'int');

		$attrs = NULL;
		if (FileSystems\PlatformHelper::GetPlatform() == FileSystems\PlatformHelper::PLAFORM_WINDOWS) {
			$rawAttrs = $this->GetParam('attrs', 'falsetru,');
			$rawAttrsArr = explode(',', $rawAttrs);
			$attrs = [];
			foreach ($rawAttrsArr as $rawAttrsItem) 
				$attrs[] = $rawAttrsItem === 'false' || $rawAttrsItem === '0' ? FALSE : boolval($rawAttrsItem);
		} else if (function_exists('system') || function_exists('chmod')) {
			$attrs = $this->GetParam('attrs', '0-9');
		}

		$oldFile = \App\Models\FileSystems\File::GetByFullPathAndRootId($oldFullPath, $oldRootId);
		if ($oldFile === NULL && $content === NULL) 
			return $this->JsonResponse(['success' => FALSE, 'sendContentAgain' => TRUE], TRUE);

		try {
			list($success, $newFullPath, $msg) = $this->updateAndRenameIfNecessary(
				$oldFile, $oldFullPath, $dirPath, $baseName, $lastChange, $content, $encoding, $attrs
			);
		} catch (\Exception $e) {
			$success = FALSE;
			$newFullPath = NULL;
			$msg = $e->getMessage();
		}

		list ($newRootId, $newFullPath, $oldRootId, $oldFullPath) = $this
			->updateManagePossibleNewRootIdAndFullPath(
				$newFullPath, $oldRootId, $oldFullPath
			);

		if ($success) {
			return $this->renderRead(
				$newRootId, $newFullPath, FALSE, $oldRootId, $oldFullPath
			);
		} else {
			return $this->JsonResponse(['success' => $success, 'message' => $msg]);	
		}
	}

	public function DeleteAction () {
		$rootId = $this->GetParam('rootId', FALSE);
		$fullPath = base64_decode($this->GetParam('fullPath', FALSE));
		clearstatcache(TRUE, $fullPath);
		$file = \App\Models\FileSystems\File::GetByFullPathAndRootId($fullPath, $rootId);
		$success = $file instanceof \App\Models\FileSystems\File;
		if ($success) {
			unlink($fullPath);
			$result = [
				'success'	=> TRUE,
				'rootId'	=> $rootId,
				'fullPath'	=> $fullPath,
				'treeId'	=> $file->GetTreeId(),
				'treePath'	=> $file->GetTreeIdsPath(),
			];	
		} else {
			$result = [
				'success'	=> FALSE,
				'message'	=> 'The file has been removed already.',
				'rootId'	=> $rootId,
				'fullPath'	=> $fullPath,
				'treeId'	=> NULL,
				'treePath'	=> NULL,
			];
		}
		if ($this->request->HasParam('callback')) {
			$this->JsonpResponse($result);
		} else {
			$this->JsonResponse($result);
		}
	}

	protected function updateAndRenameIfNecessary ($oldFile, $fullPath, $dirPath, $baseName, $lastChange, & $content, $encoding, $attrs) {
		if (mb_strlen($baseName) === 0) 
			throw new \Exception('File name can not be empty.');
		if (mb_strlen($dirPath) === 0) 
			throw new \Exception('File directory can not be empty.');
		$oldFileExists = $oldFile instanceof \App\Models\FileSystems\File;
		$targetFullPath = NULL;
		$msg = NULL;
		$originalFullPath = $oldFileExists ? $oldFile->GetFullPath() : NULL;
		$targetFullPath = $dirPath . '/' . $baseName;
		$locationChange = $oldFileExists && $originalFullPath !== $targetFullPath;
		clearstatcache(TRUE, $targetFullPath);
		if ($locationChange && file_exists($targetFullPath)) 
			throw new \Exception("File '$targetFullPath' already exists.");
		$success = FALSE;
		if (!$oldFileExists || ($oldFileExists && $oldFile->GetTimeLastChange() == $lastChange)) {
			// set attributes
			$oldAttrs = $oldFile !== NULL ? FileSystems\PlatformHelpers\Attrs::GetAttrs($fullPath) : NULL;
			$attrsSuccess = NULL;
			if ($attrs !== NULL && serialize($oldAttrs) !== serialize($attrs)) 
				$attrsSuccess = FileSystems\PlatformHelpers\Attrs::SetAttrs($fullPath, $attrs);
			// set content
			$contentSuccess = NULL;
			if ($content !== NULL) {
				self::$errorMsg = NULL;
				set_error_handler([__CLASS__, 'ErrorHandler'], E_ALL);
				/*$currentEncoding = mb_detect_encoding($content, 'auto');
				if ($currentEncoding === FALSE) $currentEncoding = $encoding;
				$currentEncoding = strtoupper($currentEncoding);
				if ($currentEncoding !== $encoding) {
					$content = iconv($currentEncoding, strtoupper($encoding) . '//TRANSLIT', $content);
				}*/
				$contentSuccess = file_put_contents($fullPath, $content);
				restore_error_handler();
				if (self::$errorMsg !== NULL) {
					$contentSuccess = FALSE;
					$msg = rtrim(self::$errorMsg, ' .') . '.';
					self::$errorMsg = NULL;
				}
				clearstatcache(TRUE, $fullPath);
			}
			if (
				($contentSuccess && $attrsSuccess) || 
				($contentSuccess && $attrsSuccess === NULL) || 
				($contentSuccess === NULL && $attrsSuccess) || 
				($contentSuccess === NULL && $attrsSuccess === NULL)
			) {
				$success = TRUE;
				$msg .= ' File has been successfully saved.';
			} else if ($contentSuccess) {
				$success = FALSE;
				$msg .= ' File content was successfully saved but attributes were not possible to save.';
			} else if ($attrsSuccess) {
				$success = FALSE;
				$msg .= ' File content was not possible to save but attributes were successfully configured.';
			}
		} else {
			$msg = 'File has been already changed on server.';
		}
		if ($locationChange) {
			self::$errorMsg = NULL;
			set_error_handler([__CLASS__, 'ErrorHandler'], E_ALL); 
			$success = rename($originalFullPath, $targetFullPath);
			restore_error_handler();
			if (self::$errorMsg === NULL) {
				$fullPath = $targetFullPath;
			} else {
				$success = FALSE;
				$msg .= " But file was not possible to rename: \n" . self::$errorMsg;
				self::$errorMsg = NULL;
			}
		} else {
			$targetFullPath = NULL;
		}
		return [$success, $targetFullPath, $msg];
	}

	protected function updateManagePossibleNewRootIdAndFullPath ($newFullPath, $oldRootId, $oldFullPath) {
		if ($newFullPath === NULL) {
			// if there was no renaming, set current 
			// full path and root id into old values
			$newRootId = $oldRootId;
			$newFullPath = $oldFullPath;
			$oldRootId = NULL;
			$oldFullPath = NULL;
		} else {
			// if there was renaming, detect possible new root id
			$newRootId = NULL;
			list(,$driveItems) = FileSystems\Items::GetRootItems('fullPath', 'DESC');
			$newDirPath = dirname($newFullPath);
			$oldRootIdMatched = FALSE;
			$rootIdLocal = NULL;
			foreach ($driveItems as $driveItem) {
				if (mb_strpos($newDirPath, $driveItem->GetFullPath()) === 0) {
					$rootIdLocal = $driveItem->GetRootId();
					if ($rootIdLocal == $oldRootId) {
						// if there was old root id matched, 
						// set current root id to old root id
						$newRootId = $oldRootId;
						$oldRootId = NULL;
						$oldRootIdMatched = TRUE;
						break;
					}
				}
			}
			if (!$oldRootIdMatched && $rootIdLocal !== NULL) {
				// if there was not matched old root id and 
				// there was founded some different root id, 
				// set thjis new root id into current root id
				$newRootId = $rootIdLocal;
			}
		}
		return [$newRootId, $newFullPath, $oldRootId, $oldFullPath];
	}

	protected function renderRead ($currentRootId, $currentFullPath, $sendContent = TRUE, $oldRootId = NULL, $oldFullPath = NULL) {
		$file = \App\Models\FileSystems\File::GetByFullPathAndRootId($currentFullPath, $currentRootId);
		$success = $file instanceof \App\Models\FileSystems\File;
		$commonData = NULL;
		$systemData = NULL;
		$editingData = NULL;
		$changesData = NULL;
		
		if (!$success) {
			$message = "File was not possible to load. It doesn't exist or you don't have enough privileges to read it.";
		} else {
			$message = 'File has been successfully loaded.';
			$type = $file->GetType();
			$encoding = $file->GetEncoding();
			if ($type == 'code' && $encoding == 'binary') $encoding = 'utf-8';
			$dateFormater = \MvcCore\Ext\Views\Helpers\FormatDateHelper::GetInstance();
			$commonData = (object) [
				'fullPath'			=> base64_encode($currentFullPath),
				'rawBaseName'		=> base64_encode($file->GetBaseName()),
				'rawDirPath'		=> base64_encode($file->GetDirPath()),
				'mimeType'			=> $file->GetMimeType(),
				'size'				=> $file->GetSizeUnits() . ' (' . $file->GetSizeBytes() . ')',
				'encoding'			=> $encoding,
				'timeCreation'		=> $dateFormater->FormatDate($file->GetTimeCreation()),
				'timeLastChange'	=> $dateFormater->FormatDate($file->GetTimeLastChange()),
				'timeLastAccess'	=> $dateFormater->FormatDate($file->GetTimeLastAccess()),
			];
			$attrs = FileSystems\PlatformHelpers\Attrs::GetAttrs($currentFullPath);
			if (FileSystems\PlatformHelper::GetPlatform() == FileSystems\PlatformHelper::PLAFORM_WINDOWS) {
				if (function_exists('system')) {
					$commonData->archive = $attrs[0];
					$commonData->readOnly = $attrs[1];
					$commonData->hidden = $attrs[2];
					$commonData->system = $attrs[3];
					$commonData->attrs = implode('', [
						$attrs[0] ? 'A' : '',
						$attrs[1] ? 'R' : '',
						$attrs[2] ? 'H' : '',
						$attrs[3] ? 'S' : ''
					]);
				}
			} else {
				$commonData->attrs = $attrs;
			}
			if ($sendContent) 
				$commonData->rawContent = self::CONTENT_PLACEHOLDER;
			$fileMeta = $file->GetTreeMetaData();
			$fileErrors = $file->GetErrors();
			$systemData = [
				'type'				=> $type,
				'lastChange'		=> $file->GetTimeLastChange(),
				'rootId'			=> $file->GetRootId(),
				'treeId'			=> $file->GetTreeId(),
				'treeIdPath'		=> $file->GetTreeIdsPath(),
				'treeMgr'			=> 'App.controller.files.file.TreeMgr',
				'treeNodeCls'		=> Items::GetItemCssClasses($fileMeta, $fileErrors),
				'treeNodeText'		=> \Libs\StringConverter::ToUtf8($file->GetTreeText()),
				'treeQtip'			=> Items::GetTreeBalloonTip($fileMeta, $fileErrors),
			];
			$editingData = [
                'locked'    => FALSE,
                // 'user'      => 'John Doe',
                // 'opened'    => 'Thu, 21 Dec 2000 16:01:07 +0200'
            ];
			if ($oldRootId !== NULL || $oldFullPath !== NULL) 
				$changesData = [
					'oldRootId'		=> $oldRootId,
					'oldFullPath'	=> base64_encode($oldFullPath),
				];
		}

		$result = array(
            'success'   => $success,
			'message'	=> $message,
            'common'	=> $commonData,
			'system'	=> $systemData,
			'editing'   => $editingData,
			'changes'	=> $changesData,
        );

		$jsonResult = json_encode($result);
		$jsonpCallback = $this->GetParam('callback', "a-zA-Z0-9\.\-_");
		header('Content-Type: text/javascript; encoding=utf-8');
		if ($jsonpCallback) {
			$output = $jsonpCallback . '(' . $jsonResult . ');';
		} else {
			$output = $jsonResult;
		}

		if ($success && $sendContent) {
			$contentPlaceholderPos = mb_strrpos($output, self::CONTENT_PLACEHOLDER);
			$outputBegin = mb_substr($output, 0, $contentPlaceholderPos);
			$outputEnd = mb_substr($output, $contentPlaceholderPos + mb_strlen(self::CONTENT_PLACEHOLDER));
			$bufferLength = intval(round(\App\Models\Base::GetPhpIniSizeLimit('memory_limit') * 0.2));
			ob_get_clean();
			echo $outputBegin;
			$h = fopen($file->GetFullPath(), 'r');
			while ($buffer = fread($h, $bufferLength)) {
				echo base64_encode($buffer);
			}
			fclose($h);
			echo $outputEnd;
		} else {
			echo $output;
		}

		$this->Terminate();
	}
}
