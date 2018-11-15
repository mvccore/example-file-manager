<?php

namespace App\Models\FileSystems;

interface ITreeItem
{
	public function __construct (\SplfileInfo $spl, $rootItemId = NULL);
    public function GetTreeText ();
    public function GetTreeId ();
    public function GetRootId ();
	public function GetFullPath ();
	public function GetTreeMetaData ();
    public function HasChildren ();
	public function GetErrors ();
	public function GetChildren ($visibleOnly = FALSE, $sortProperty = 'baseName', $sortDirection = 'ASC');
}
