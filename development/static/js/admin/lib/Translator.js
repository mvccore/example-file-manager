Ext.define('App.lib.Translator', {}); // dummy fn to load rest of the file properly

var Translator = $class({
	$static: {
		instance: null,
		setUsedKey: function (key) {
			if (!Translator.instance) {
				Translator.instance = new Translator();
			}
			Translator.instance.setUsedKey(key);
		}
	},
	$constructor: function () {
		this.usage = [];
		this.timeout = 15;
		this.id = 0;
	},
	$dynamic: {
		setUsedKey: function (key) {
			var item = {};
			item[key] = Date.unixTimestamp();
			this.usage.push(item);
			if (!this.id && Settings.URLS.USED_TRANSLATIONS_SYNC)
				this._timeoutSync();
		},
		_timeoutSync: function () {
			this.id = setTimeout(
				function () {
					this._sync();
				}.bind(this),
				this.timeout * 1000
			);
		},
		_sync: function () {
			if (this.usage.length > 0) {
				Ext.Ajax.request({
					url: Settings.URLS.USED_TRANSLATIONS_SYNC,
					method: 'POST',
					params: {
						usage: JSON.stringify(this.usage)
					},
					success: function (response, opts) {
						this.usage = [];
						this._timeoutSync();
					}.bind(this),
					failure: function (response, opts) {
						this.usage = [];
						this._timeoutSync();
					}.bind(this)
				});
			} else {
				this._timeoutSync();
			}
		}
	}
});

var t = function (key) {
	var result = '';
	Translator.setUsedKey(key);
	if (typeof (Translations[key]) != 'undefined') {
		result = Translations[key];
		if (String(result).trim() == '') result = key;
		return result;
	} else {
		return key;
	}
}
