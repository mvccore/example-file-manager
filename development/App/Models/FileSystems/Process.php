<?php

namespace App\Models\FileSystems;

class Process extends \App\Models\Base {
	public static function SearchInRunningProcessesWindows ($processName) {
		$result = [];
		if (PlatformHelper::GetPlatform() == PlatformHelper::PLAFORM_WINDOWS) {
			$wmi = new \COM('winmgmts://');
			$processes = $wmi->ExecQuery("SELECT * FROM Win32_Process WHERE Name = '$processName'");
			foreach ($processes as $process){
				$commandLine = $process->CommandLine;
				$processId = $process->ProcessId;
				$result[] = $process;
				/*if (true) {
					break;
				}*/
			}
		} else {
			// TODO
		}
		return $result;
	}
}