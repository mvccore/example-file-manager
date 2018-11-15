<?php

namespace App\Controllers;

class Base extends \MvcCore\Controller
{
	protected $cfg = NULL;
	protected $displayVisibleItemsOnly = NULL;

	protected $lang = NULL;
	protected $locale = NULL;

	public function Init() {
		parent::Init();
		if ($this->controllerName != 'auth' && $this->controllerName !== 'bg-task') {
			if ($this->user === NULL) {
				if ($this->ajax) {
					$this->response->SetHeader('X-MvcCore-Auth', 'required');
					$result = ['success'=>FALSE,'message'=>'Authentication required.',];
					if ($this->request->HasParam('callback')) {
						$this->JsonpResponse($result);
					} else {
						$this->JsonResponse($result);
					}
					return $this->Terminate();
				}
				return self::Redirect($this->Url('Auth:Index'));
			}
		}
		$this->cfg = & \App\Models\Configuration::GetSystem();
		$this->displayVisibleItemsOnly = $this->cfg->common->visibleOnly;
		$this->lang = $this->cfg->localization->lang;
		$this->locale = $this->cfg->localization->locale;
		\App\Models\Translator::SetLang($this->lang);
	}

	public function PreDispatch () {
		parent::PreDispatch();
		if ($this->viewEnabled) {
			$this->view->Title = self::Translate('MvcCore File Manager');
			$this->view->Localization = $this->lang . '-' . $this->locale;
			$this->_preDispatchSetUpBundles();
		}
	}

	public static function Translate ($key, $lang = NULL) {
		return \App\Models\Translator::Translate($key, $lang/* ?: $this->lang*/);
	}
	
	protected function & getSession () {
		$session = $this->GetSessionNamespace('opened_windows');
		$session->SetExpirationSeconds(60 * 60 * 24);
		return $session;
	}

	private function _preDispatchSetUpBundles () {
		\MvcCore\Ext\Views\Helpers\Assets::SetGlobalOptions([
			'cssMinify'	=> 1,
			'cssJoin'	=> 1,
			'jsMinify'	=> 1,
			'jsJoin'	=> 1,
		]);
		return;
		$static = self::$staticPath;
		$this->view->Css('fixedHead')
			->Append($static . '/css/resets.css');
		$this->view->Js('fixedHead')
			->Append($static . '/js/libs/Module.js');
		$this->view->Js('varFoot')
			->Append($static . '/js/Front.js');
	}
}
