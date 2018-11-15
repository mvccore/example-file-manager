<?php

namespace App;

class Bootstrap
{
	public static function Init () {
		$app = \MvcCore\Application::GetInstance();

		// Patch core to use extended debug class:
		if (class_exists('MvcCore\Ext\Debugs\Tracy')) {
			$app->SetDebugClass('MvcCore\Ext\Debugs\Tracy');
			\MvcCore\Ext\Debugs\Tracy::$Editor = 'MSVS2017';
		}

		$cfgAuth = \App\Models\Configuration::GetSystem()->auth;
		$auth = & \MvcCore\Ext\Auths\Basic::GetInstance();
		$auth->SetPasswordHashSalt($cfgAuth->passwordHashSalt);
		if (isset($cfgAuth->expirationSeconds)) 
			$auth->SetExpirationSeconds($cfgAuth->expirationSeconds);
		if ($cfgAuth->userClass) 
			$auth->SetUserClass($cfgAuth->userClass);
		if ($cfgAuth->usersTable) 
			$auth->SetTableStructureForDbUsers(
				isset($cfgAuth->usersTable->name) 
					? $cfgAuth->usersTable->name
					: NULL, 
				(array) $cfgAuth->usersTable
			);
		//die(\MvcCore\Ext\Auths\Basics\User::EncodePasswordToHash(''));
	}
}
