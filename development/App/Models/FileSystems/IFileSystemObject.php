<?php

namespace App\Models\FileSystems;

interface IFileSystemObject
{
	public function __construct (\SplfileInfo $spl, $rootItemId = NULL);
	public function GetBaseName ();
	public function GetDirPath ();
	public function GetFullPath ();
	public function GetHidden ();
	public function SetHidden ($hidden);
	public function GetMimeType ();
	public function GetTimeLastChange ();
}
