var Module = $class({
	$extends: null,
	$static: {
		ERROR_LOG_ROUTE: 'admin/log-js-error',
		ERROR_LOG_METHOD: 'POST',
		_instance: null,
		GetInstance: function () {
			return Module._instance;
		}
	},
	$constructor: function () {
		Module._instance = this;
		this._initErrorLogging();
	},
	$dynamic: {
		_errorLogEnabled: false,
		_errorLogFingerPrints: {},
		ErrorLogEnable: function ()
		{
			this._errorLogEnabled = true;
		},
		ErrorLogDisable: function () {
			this._errorLogEnabled = false;
		},
		_initErrorLogging: function () {
			// return; // comment this line to show uncatched errors in browser console
			window.onerror = function (message, file, line, column, exception) {
				var stack = '',
					errorFingerPrint = '';
				
				if (!this._errorLogEnabled) return;
				errorFingerPrint = this._convertStringToHexadecimalValue(file) + '_' + String(line);
				if (typeof(this._errorLogFingerPrints[errorFingerPrint]) != 'undefined') return;

				this._errorLogFingerPrints[errorFingerPrint] = message;
				if (exception instanceof Error && exception.stack) stack = exception.stack.toString();

				this._sendErrorData({
					message: message,
					uri: location.href,
					file: file,
					line: line,
					column: column,
					stack: stack,
					browser: navigator.userAgent,
					platform: navigator.platform
				});
			}.bind(this)
		},
		_convertStringToHexadecimalValue: function (input) {
			var inputStr = String(input),
			chars = '0123456789ABCDEF',
			output = '',
			x;
			for (var i = 0; i < inputStr.length; i++) {
				x = inputStr.charCodeAt(i);
				output += chars.charAt((x >>> 4) & 0x0F) + chars.charAt(x & 0x0F);
			}
			return output;
		},
		_sendErrorData: function (data)
		{
			if (typeof(jDiet) != 'undefined') {
				jDiet.ajax({
					uri: Module.ERROR_LOG_ROUTE,
					method: Module.ERROR_LOG_METHOD,
					data: data
				});
			} else if (typeof(Ext) != 'undefined') {
				Ext.Ajax.request({
					url: Module.ERROR_LOG_ROUTE,
					method: Module.ERROR_LOG_METHOD,
					data: data
				});
			}
			//log(data);
		}
	}
});