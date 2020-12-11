<?php

namespace App\Controllers;

use \App\Models\FileSystems;
use \App\Models\FileSystems\PlatformHelpers;

class Index extends Base
{
	protected $layout = 'admin';

	public function IndexAction () {
		$this->view->Settings = $this->completeIndexSettings();
		$this->view->Translations = \App\Models\Translator::GetAllTranslations($this->lang);
	}

	protected function completeIndexSettings () {
		$cfg = & $this->cfg;
		return [
			'DEBUG'						=> TRUE,
			'LANG'						=> $this->lang,
			'LOCALE'					=> $this->locale,
			'PLATFORM'					=> FileSystems\PlatformHelper::GetPlatform(),
			'SYSTEM_CALLS'				=> function_exists('system'),
			'CHMOD'						=> function_exists('chmod'),
			'URLS'						=> [
				'TREE'					=> $this->Url("Tree:Read"),
				'OPENED_TABS_SYNC'		=> $this->Url("Tabs:Sync"),
				'USED_TRANSLATIONS_SYNC'=> NULL, // use this only for translations in database
				'VALID_FILENAME'		=> $this->Url("Index:ValidFileName"),
				'AUTH_FORM'				=> $this->Url('Auth:Index'),
				'FILE'					=> [
					'CREATE'			=> $this->Url("File:Create"),
					'READ'				=> $this->Url("File:Read"),
					'UPDATE'			=> $this->Url("File:Update"),
					'DELETE'			=> $this->Url("File:Delete"),
					'RENAME'			=> $this->Url("File:Rename"),
					'MOVE'				=> $this->Url("File:Move"),
				],
				'DIRECTORY'				=> [
					'CREATE'			=> $this->Url("Directory:Create"),
					'READ'				=> $this->Url("Directory:Read"),
					'MOVE'				=> $this->Url("Directory:Move"),
					'DELETE'			=> $this->Url("Directory:Delete"),
				]
			],
			'TREE'						=> [
				'ITEMS_PER_PAGE'		=> $cfg->tree->itemsPerPage,
			],
			'EDITOR'					=> [
				'ALERT_ON_CHANGED_TAB_CLOSE'	=> $cfg->editor->alertOnChangedTabClose,
				'VERTICAL_LINE_POSITION'		=> $cfg->editor->verticalLinePosition,
			],
			'GRID'						=> [
				'ITEMS_PER_PAGE'		=> $cfg->grid->itemsPerPage,
			],
			'VISIBLE_ONLY'				=> $this->displayVisibleItemsOnly,
			'ALERT_ON_APP_CLOSE'		=> $cfg->common->alertOnAppClose,
			'openedWindows'				=> $this->completeAndClearCurrentUserOpenedWindows()
		];
    }

	protected function completeAndClearCurrentUserOpenedWindows () {
        $session = $this->getSession();
        $data = $session->data ?: [];
        $cleanedData = [];
        $browserName = $this->getExtJsBrowserName();
        foreach ($data as $item) {
			if ($item->browser == $browserName) continue;
			$cleanedData[] = $item;
		}
        $session->data = $data;
        // test data:
        /*$data = array(
            (object) array(
                'index' => 1,
                'browser' => "Chrome",
                'name' => "admin_window_id_1452468256",
                'tabs' => "dp,i:8,m:skoleni-ict/dp,i:34,m:skoleni-ict"
            ),
            (object) array(
                'index' => 0,
                'browser' => "Chrome",
                'name' => "admin_window_id_1452468128",
                'tabs' => "dp,i:1,m:skoleni-ict"
            ),
            (object) array(
                'index' => 2,
                'browser' => "Chrome",
                'name' => "admin_window_id_1452468512",
                'tabs' => "dp,i:16,m:skoleni-ict/dp,i:33,m:skoleni-ict/dp,i:19,m:skoleni-ict"
            ),
        );*/
        return $data;
    }

	protected function getExtJsBrowserName () {
		$userAgent = $_SERVER['HTTP_USER_AGENT'];
		$browserName = "Other";
		if (strpos($userAgent, "Chrome") !== FALSE) {
			$browserName = "Chrome";
		} else if (strpos($userAgent, "Safari") !== FALSE) {
			$browserName = "Safari";
		} else if (strpos($userAgent, "Opera") !== FALSE) {
			$browserName = "Opera";
		} else if (strpos($userAgent, "MSIE") !== FALSE || strpos($userAgent, "Trident") !== FALSE) {
			$browserName = "IE";
		} else if (strpos($userAgent, "Firefox") !== FALSE) {
			$browserName = "Firefox";
		}
		return $browserName;
	}

	public function ValidFileNameAction () {
		$filename = $this->GetParam('fileName', FALSE);
		if ($filename === NULL) $filename = '';
		$filename = base64_decode($filename);
		$result = (object) [
			'fileName'	=> PlatformHelpers\FileName::GetValidFileName($filename)
		];
		if ($this->request->HasParam('callback')) {
			$this->JsonpResponse($result);
		} else {
			$this->JsonResponse($result);
		}
	}

	public function NotFoundAction () {
		$this->ErrorAction();
	}

	public function ErrorAction () {
		$code = $this->response->GetCode();
		if ($code === 200) $code = 404;
		$message = $this->request->GetParam('message', 'a-zA-Z0-9_;, \\/\-\@\:\.');
		$message = preg_replace('#`([^`]*)`#', '<code>$1</code>', $message);
		$message = str_replace("\n", '<br />', $message);
		$this->view->Title = "Error $code";
		$this->view->Message = $message;
		$this->Render('error');
	}
}
