<?php

namespace App\Models\FileSystems;

class PlatformHelper extends \App\Models\Base
{
	const PLAFORM_WINDOWS = 'win';
	const PLAFORM_UNIX = 'unix';
	const PLAFORM_MAC = 'max';
	
	protected static $platform = NULL;
	protected static $bgJobs = [];

	public static function GetPlatform () {
		if (self::$platform === NULL) {
			if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
				self::$platform = self::PLAFORM_WINDOWS;
			} else if (strtoupper(PHP_OS) == "DARWIN") {
				self::$platform = self::PLAFORM_MAC;
			} else {
				self::$platform = self::PLAFORM_UNIX;
			}
		}
		return self::$platform;
	}

	/**
	 * @param string $cmd 
	 * @param string|NULL $dirPath 
	 * @return bool|string
	 */
	public static function System ($cmd, $dirPath = NULL) {
		if (!function_exists('system')) return FALSE;
		$dirPathPresented = $dirPath !== NULL && mb_strlen($dirPath) > 0;
		$cwd = '';
		if ($dirPathPresented) {
			$cwd = getcwd();
			chdir($dirPath);
		}
		ob_start();
		system($cmd);
		$sysOut = ob_get_clean();
		if ($dirPathPresented) chdir($cwd);
		return $sysOut;
	}

	/**
	 * @param string $cmd 
	 * @param string|NULL $dirPath 
	 * @return bool|string
	 */
	public static function Exec ($cmd, $dirPath = NULL) {
		if (!function_exists('exec')) return FALSE;
		$dirPathPresented = $dirPath !== NULL && mb_strlen($dirPath) > 0;
		$cwd = '';
		if ($dirPathPresented) {
			$cwd = getcwd();
			chdir($dirPath);
		}
		$sysOut = exec($cmd);
		if ($dirPathPresented) chdir($cwd);
		return $sysOut;
	}

	public static function AddBackgroundJob (callable $handler) {
		if (!self::$bgJobs) {
			self::$bgJobs[] = $handler;
			$bgJobs = & self::$bgJobs;
			\MvcCore\Application::GetInstance()->AddPostDispatchHandler(
				function (\MvcCore\IRequest & $req, \MvcCore\IResponse & $res) {
					if ($req->IsAjax()) return TRUE;
					// this closes connection but also kills any tracy debug output:
					$res->SetHeader('Connection', 'close');
					$res->SetHeader('Content-Length', strlen($res->GetBody()));
					return TRUE;
				}
			);
			\MvcCore\Application::GetInstance()->AddPostTerminateHandler(
				function (\MvcCore\IRequest & $req, & $res) use ($bgJobs) {
					if ($req->IsAjax()) return TRUE;
					// run background processes:
					register_shutdown_function(function() use ($bgJobs) {
						foreach ($bgJobs as $bgJob) {
							try {
								$bgJob();
							} catch (\Exception $e) {
								\MvcCore\Debug::Log($e);
							}
						}
					});
					return TRUE;
				}
			);
		} else {
			self::$bgJobs[] = $handler;
		}
	}
}
