<?php

namespace App\Models\FileSystems\PlatformHelpers;

class Drives extends \App\Models\FileSystems\PlatformHelper
{
	protected static $drives = NULL;

	public static function GetDrives () {
		if (self::$drives === NULL) {
			$platform = self::GetPlatform();
			if ($platform == self::PLAFORM_UNIX) {
				self::$drives = self::getDrivesUnix();
			} else if ($platform == self::PLAFORM_WINDOWS) {
				self::$drives = self::getDrivesWindows();
			} else if ($platform == self::PLAFORM_MAC) {
				self::$drives = self::getDrivesMac();
			} else {
				self::$drives = [];
			}
		}
		return self::$drives;
	}

	protected static function getDrivesUnix () {
		$drives = ['/'];

		
		return $drives;
	}

	protected static function getDrivesWindows () {
		$drives = [];
		$sysOut = self::System('for /f "skip=1 delims=" %x in (\'wmic logicaldisk get caption\') do @echo.%x', NULL);
		if ($sysOut !== FALSE) {
			$sysOutLines = explode(PHP_EOL, $sysOut);
			foreach ($sysOutLines as $sysOutLine) 
				if ($trimmedLine = trim($sysOutLine))
					$drives[] = $trimmedLine;
		} else {
			$drives[] = 'C:';
		}
		return $drives;
	}
	private static function _getDriveWindowsCom () {
		// TODO: check if 'COM' class exists first
		$fso = new \COM('Scripting.FileSystemObject'); 
		$D = $fso->Drives; 
		$type = array("Unknown","Removable","Fixed","Network","CD-ROM","RAM Disk"); 
		foreach($D as $d ){ 
			$dO = $fso->GetDrive($d); 
			$s = ""; 
			if($dO->DriveType == 3){ 
				$n = $dO->Sharename; 
			}else if($dO->IsReady){ 
				$n = $dO->VolumeName; 
				$s = self::_file_size($dO->FreeSpace) . " free of: " . self::_file_size($dO->TotalSize); 
			}else{ 
				$n = "[Drive not ready]"; 
			} 
			echo "Drive " . $dO->DriveLetter . ": - " . $type[$dO->DriveType] . " - " . $n . " - " . $s . "<br>"; 
		}
	}
	
	private static function _file_size($size)  { 
		$filesizename = array(" Bytes", " KB", " MB", " GB", " TB", " PB", " EB", " ZB", " YB"); 
		return $size ? round($size/pow(1024, ($i = floor(log($size, 1024)))), 2) . $filesizename[$i] : '0 Bytes'; 
	}

	protected static function getDrivesMac () {
		$drives = [];
		$sysOut = self::System('mount', NULL);
		if ($sysOut !== FALSE) {
			if (preg_match_all('/(.+)\s+on\s+(.+)\s+\((\w+).*\)\n/i', $sysOut, $m, PREG_SET_ORDER) == 0)
				return $drives;
			foreach ($m as $mount) {
				$drives[] = $mount[1];
			}
		} else {
			$drives[] = '/';
		}
		return $drives;
	}
}
