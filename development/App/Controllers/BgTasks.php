<?php

namespace App\Controllers;

class BgTasks extends Base
{
	public function Init () {
		parent::Init();
		if (!$this->request->IsCli()) $this->Terminate();
	}
	public function WinTimeZoneAction () {
		\App\Models\FileSystems\PlatformHelpers\TimeZone::GetSystemTimeZoneWindowsBgProcess();
		$this->Terminate();
	}
}
