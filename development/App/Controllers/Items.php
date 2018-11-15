<?php

namespace App\Controllers;

class Items extends Base
{
	protected function getParams () {
		$rootId = $this->GetParam('rootId', FALSE);
		$fullPath = $this->GetParam('fullPath', FALSE);
		$fullPath = $fullPath === NULL ? '' : base64_decode($fullPath);
        $offset = $this->GetParam('offset', '0-9', 0, 'int');
        $limit = $this->GetParam('limit', '0-9', 0, 'int');
		return [$rootId, $fullPath, $offset, $limit];
	}

	protected function sendResponse (& $items, $totalCount, $offset, $limit) {
		$result = (object) [
			'success'	=> TRUE,
			'nodes'		=> $items,
			'total'		=> $totalCount,
			'offset'	=> $offset,
			'limit'		=> $limit,
		];

		//x($result);
		if ($this->request->HasParam('callback')) {
			$this->JsonpResponse($result);
		} else {
			$this->JsonResponse($result);
		}
	}

    public static function GetItemCssClasses (\stdClass $itemMetaInfo, array $errors) {
		$cssClass = 'fa files-' . strtolower($itemMetaInfo->className);
		if ($itemMetaInfo->className == 'File') 
			$cssClass .= '-'. $itemMetaInfo->type;
		if ($itemMetaInfo->className == 'Directory' && $itemMetaInfo->type !== 'directory') 
			$cssClass .= '-'. $itemMetaInfo->type;
		if ($itemMetaInfo->hidden) 
			$cssClass .= ' files-hidden';
		if ($errors)
			$cssClass .= ' files-errors';
		return $cssClass;
	}

	public static function GetTreeBalloonTip (\stdClass $itemMetaInfo, array $itemErrors) {
		/** @var $dateFormater \MvcCore\Ext\Views\Helpers\FormatDateHelper */
		$dateFormater = \MvcCore\Ext\Views\Helpers\FormatDateHelper::GetInstance();
		$br = '<br/>';
		$isNotDrive = $itemMetaInfo->mimeType !== 'drive';
		$qtip = self::Translate('Name') . ": '" . $itemMetaInfo->name . "'" . $br;
		if ($isNotDrive) $qtip .= self::Translate('Path') . ": '" . $itemMetaInfo->path . "'" . $br;
		$qtip .= self::Translate('Type').": '" . $itemMetaInfo->mimeType . "'" . $br;
		if ($itemMetaInfo->sizeBytes !== '0') {
			$sizeStr = $itemMetaInfo->sizeUnits . ' (' . $itemMetaInfo->sizeBytes . ')';
			$qtip .= self::Translate('Size') . ': ' . $sizeStr . $br;
		}
		if ($itemErrors) $qtip .=
			self::Translate('Errors') . ':' . $br . implode($br . '   ', $itemErrors) . $br;
		if ($isNotDrive) $qtip .=
			self::Translate('Last Change') . ': ' . $dateFormater->FormatDate($itemMetaInfo->lastChange);
		return $qtip;
	}
}
