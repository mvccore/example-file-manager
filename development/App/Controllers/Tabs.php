<?php

namespace App\Controllers;

class Tabs extends Base
{
	public function SyncAction () {
        $window = $this->GetParam("window", "a-zA-Z_0-9");
		$browser = $this->GetParam("browser", "a-zA-Z_0-9\-");
		$tabs = $this->GetParam("tabs", "a-zA-Z0-9_\-\:\/\,");
		$index = $this->GetParam("index", "0-9", 0, 'int');

        $data = $this->setUpOpenedWindowDataForCurrentUser($browser, $window, $tabs, $index);
		
		$result = array('success' => TRUE, 'openedWindows' => $data);
		if ($this->request->HasParam('callback')) {
			$this->JsonpResponse($result);
		} else {
			$this->JsonResponse($result);
		}
    }

	protected function setUpOpenedWindowDataForCurrentUser ($browser, $window, $tabs, $index) {
		$session = $this->getSession();
        $data = $session->data ?: [];
        $openedWindowDataStored = FALSE;
        if (count($data) > 0) {
            foreach ($data as $item) {
				if ($item->browser == $browser && $item->name == $window) {
					$item->index = $index;
					$item->tabs = $tabs;
					$openedWindowDataStored = TRUE;
					break;
				}
			}
        }
        if (!$openedWindowDataStored) {
			$data[] = (object) [
				'index'     => $index,
				'tabs'      => $tabs,
				'browser'   => $browser,
				'name'      => $window,
			];
		}
        $session->data = $data;
        return $data;
    }
}
