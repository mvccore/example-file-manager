Ext.define('App.lib.Helpers', {
	config: {
		//loadingImg: null,
		//logoImg: null,
		xhrActive: 0,
		automaticRedirect: false,
		validFileNamesCache: {}
	},
	constructor: function () {
		//var adminLogoCont = Ext.get("admin-logo-cont");
		//this.config.logoImg = adminLogoCont.child('.admin-logo');
		//this.config.loadingImg = adminLogoCont.child('.ajax-loading');
	},
	initAjaxCommonStates: function () {
		Ext.Ajax.setDisableCaching(true);
		Ext.Ajax.setTimeout(900000);
		Ext.Ajax.setMethod('GET');
		Ext.Ajax.on('requestexception', function (conn, response, options) {
			console.log('xhr request failed');
			// do not remove notification, otherwise user is never informed about server exception (e.g. element cannot
			// be saved due to HTTP 500 Response)
			this.showNotification(
				'Error',
				'Error general',
				'error',
				this._formatErrorFromAjaxResponseAndOptions(response, options)
			);
			this.config.xhrActive -= 1;
			if (this.config.xhrActive < 1) 
				this._finishLoading();
		}.bind(this));
		Ext.Ajax.on('beforerequest', function () {
			if (this.config.xhrActive < 1) {
				this._startLoading();
			}
			this.config.xhrActive += 1;
		}.bind(this));
		Ext.Ajax.on('requestcomplete', function (conn, response, options) {
			this.config.xhrActive -= 1;
			if (this.config.xhrActive < 1) 
				this._finishLoading();
			// redirect to login-page if session is expired
			if (typeof response.getResponseHeader == 'function') {
				var latestXhr = Ext.Ajax.getLatest();
				if (latestXhr && latestXhr.xhr) {
					var mvcCoreAuth = latestXhr.xhr.getResponseHeader('X-MvcCore-Auth');
					if (typeof (mvcCoreAuth) == 'string' && mvcCoreAuth == 'required') {
						this.config.automaticRedirect = true;
						location.replace(Settings.URLS.AUTH_FORM);
					}
				}
			}
		}.bind(this));
		return this;
	},
	initWindowBeforeUnload: function () {
		if (!Settings.ALERT_ON_APP_CLOSE) return;
		window.onbeforeunload = function () {
			if (this.config.automaticRedirect) return;
			// check for opened tabs and if the user has configured the warnings
			var mainTabs = App.instance.getController('layout.Main').getMainTabs();
			if (mainTabs && mainTabs.items.getCount() > 0) {
				return t("Do you really want to close administration?");
			}
		}.bind(this);
		return this;
	},
	initSystemKeyStrokes: function () {
		this._systemKeystrokesMap = new Ext.util.KeyMap({
			target: window,
			binding: [{
				key: "s",
				ctrl: true,
				shift: false,
				fn: this._handlerSystemKeystrokeSave.bind(this)
			}]
		});
		return this;
	},
	_handlerSystemKeystrokeSave: function (keyCode, e) {
		var activeTabCtrl;
		e.stopEvent();
		activeTabCtrl = top.App.instance.getController('layout.Main').getActiveTabController();
		if (activeTabCtrl) {
			activeTabCtrl.handlerSave();
		}
	},
	getValidFileName: function (fileName, async, callback) {
		var response = {},
			data = {},
			requestConfig = {};
		if (this.config.validFileNamesCache[fileName]) {
			return this.config.validFileNamesCache[fileName];
		}
		requestConfig = {
			async: async,
			url: Settings.URLS.VALID_FILENAME,
			method: 'POST',
			params: {
				fileName: fileName
			}
		};
		if (async) {
			requestConfig.success = function (xhr, opts) {
				var response = Ext.decode(xhr.responseText);
				callback(response);
			};
			Ext.Ajax.request(requestConfig);
			return '';
		} else {
			response = Ext.Ajax.request(requestConfig);
			data = Ext.decode(response.responseText);
			this.config.validFileNamesCache[fileName] = data.fileName;
			return data.fileName;
		}
	},
	_startLoading: function () {
		//this.config.logoImg.addCls('hidden');
		//this.config.loadingImg.removeCls('hidden');
	},
	_finishLoading: function () {
		//this.config.loadingImg.addCls('hidden');
		//this.config.logoImg.removeCls('hidden');
	},
	_formatErrorFromAjaxResponseAndOptions: function (response, options)
	{
		var errorMessage = '';
		try {
			errorMessage = "Status: " + response.status + " | " + response.statusText + "\n";
			errorMessage += "URL: " + options.url + "\n";
			if (options["params"]) {
				errorMessage += "Params:\n";
				Ext.iterate(options.params, function (key, value) {
					errorMessage += ("-> " + key + ": " + value + "\n");
				});
			}
			if (options["method"]) {
				errorMessage += "Method: " + options.method + "\n";
			}
			errorMessage += "Message: \n" + response.responseText;
		} catch (e) {
			errorMessage += "\n\n";
			errorMessage = response.responseText;
		}
		return errorMessage;
	},
	showNotification: function (title, text, type, errorText, hideDelay) {
		// icon types: info,error,success
		if (type == "error"){
			if (RealTypeOf(errorText) != 'Null' && RealTypeOf(errorText) != 'Undefined') {
				if (text.length > 0) {
					text = text + '<br /><hr /><br />';
				}
				text += '<pre style="font-size:11px;word-wrap: break-word;">'
					+ String(errorText).stripTags('b,strong,i,em,br') +
				"</pre>";
			}
			var errWin = new Ext.Window({
				modal: true,
				iconCls: "icon-notification-error",
				title: title,
				width: 700,
				height: 500,
				html: text,
				autoScroll: true,
				bodyStyle: "padding: 10px; background:#fff;",
				buttonAlign: "center",
				shadow: false,
				closable: false,
				buttons: [{
					text: "OK",
					handler: function () {
						errWin.close();
					}
				}]
			});
			errWin.show();
		} else {
			var notification = Ext.create('Ext.window.Toast', {
				iconCls: 'icon-notification-' + type,
				title: title,
				html: text,
				autoShow: true,
				autoDestroy: true,
				hideDelay:  hideDelay || 1000
			});
			notification.show(document);
		}
	},
	getClassDefinitionByFullName: function (fullName) {
		var explName = fullName.split('.'),
			current = window,
			result = null,
			i = 0;
		while (i < explName.length) {
			if (typeof (current[explName[i]]) != 'undefined') {
				current = current[explName[i]];
				result = current;
				i++;
			} else {
				result = null;
				break;
			}
		}
		if (result === null) throw new Error("Class '" + fullName + "' doesn't exist.");
		return result;
	},
	getViewClassFromLoadedTabController: function (ctrlClassStr, index) {
		var ctrlClassDefinition = this.getClassDefinitionByFullName(ctrlClassStr),
			ctrlViewsArr = ctrlClassDefinition.prototype.views || [],
			viewClassStr = '',
			index = (typeof(index) == 'number') ? index : 0;
		if (ctrlViewsArr.length === 0) {
			throw new Error("Class '" + ctrlClassStr + "' has no view defined.");
		} else {
			viewClassStr = ctrlViewsArr[index];
		}
		return viewClassStr;
	}
});
