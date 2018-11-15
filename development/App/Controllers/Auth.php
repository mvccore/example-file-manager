<?php

namespace App\Controllers;

use \App\Models,
	\MvcCore\Ext\Form,
	\MvcCore\Ext\Forms\Fields;

class Auth extends Base
{
	protected $layout = 'auth';

	/**
	 * Render homepage with signin form.
	 * If user is already authenticated, redirect user to albums list.
	 * @return void
	 */
	public function IndexAction () {
		if ($this->user !== NULL) 
			return self::Redirect($this->Url('Index:Index'));
		$this->view->SignInForm = \MvcCore\Ext\Auths\Basic::GetInstance()
			->GetSignInForm()
			//->AddCssClasses('theme')
			->SetValues([// set signed in url to index by default:
				'successUrl' => $this->Url('Index:Index', ['absolute' => TRUE]),
			]);
		if ($this->cfg->auth->type == 'config' && count($this->cfg->users) === 1) 
			$this->view->Message = "Use empty password for first login.";
	}
}
