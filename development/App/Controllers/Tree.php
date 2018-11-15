<?php

namespace App\Controllers;

use \App\Models\FileSystems;

class Tree extends Items
{
	public function ReadAction () {
		list($rootId, $fullPath, $offset, $limit) = $this->getParams();

		if (mb_strlen($fullPath) === 0) {
			list($totalCount, $rawItems) = FileSystems\Items::GetRootItems('fullPath', 'ASC');
		} else {
			list($totalCount, $rawItems) = FileSystems\Items::GetItems(
				$rootId, $fullPath, $this->displayVisibleItemsOnly, $offset, $limit
			);
		}

        $treeItems = $this->completeTreeRecords($rawItems);

		$this->sendResponse($treeItems, $totalCount, $offset, $limit);
    }

    protected function completeTreeRecords (& $items) {
		$treeItems = [];
		/** @var $item FileSystems\ITreeItem */
        foreach ($items as $item) {
			$meta = $item->GetTreeMetaData();
			$meta->name = \Libs\StringConverter::ToUtf8($meta->name);
			$meta->path = \Libs\StringConverter::ToUtf8($meta->path);
			$hasChildren = $item->HasChildren();
			$errors = \Libs\StringConverter::ToUtf8Recursive($item->GetErrors());
			$cssClasses = self::GetItemCssClasses($meta, $errors);
			$qtip = self::GetTreeBalloonTip($meta, $errors);
			$treeItems[] = (object) array(
				"text"          => \Libs\StringConverter::ToUtf8($item->GetTreeText()),
				"id"	        => $item->GetTreeId(),
				"rootId"		=> $item->GetRootId(),
				"fullPath"      => base64_encode($item->GetFullPath()),
				"leaf"			=> FALSE,
				"expandable"	=> $hasChildren,
				"cls"           => $cssClasses,
				"detailMgr"		=> 'App.controller.files.' . $meta->className,
				"treeMgr"		=> 'App.controller.files.' . strtolower($meta->className) . '.TreeMgr',
				"qtip"          => $qtip,
			);
		}
		return $treeItems;
    }
}
