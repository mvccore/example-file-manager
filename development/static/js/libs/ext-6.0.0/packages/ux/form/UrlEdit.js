Ext.define('Ext.ux.form.UrlEdit', {
	extend: 'Ext.form.FieldContainer',
	alias: 'widget.urledit',
	layout: 'hbox',
	_allowedChars: 'a-zA-Z0-9\\-\\.\\+\\$\\!\\~\\[\\]\\(\\)\\{\\}\\%\\*_',
	_filterAllowedCharsRegExp: null,
	_filterNotAllowedCharsRegExp: null,
	_url: '',
	_beginText: '/',
	_endText: '',
	_notAllowedChars: '',
	_renderStatus: false,
	initComponent: function () {
		this._initComponentLocalVars();
		this._initComponentItems();
		this.items = [
			this._beginDisplayField,
			this._endTextField
		];
		this.on('added', function (urlEdit, eOpts) {
			this._beginDisplayField.setRawValue(this._beginText);
			this._endTextField.setRawValue(this._endText);
		}.bind(this));
		this.on('boxready', function (urlEdit, eOpts) {
			this._beginDisplayField.setRawValue(this._beginText);
			this._endTextField.setRawValue(this._endText);
			this._renderStatus = true;
			this._resizeElements();
		}.bind(this));
		this.callParent(arguments);
	},
	_initComponentLocalVars: function () {
		var initCfg = this.initialConfig;
		this._filterAllowedCharsRegExp = new RegExp('[' + this._allowedChars + ']', 'g');
		this._filterNotAllowedCharsRegExp = new RegExp('[^' + this._allowedChars + ']', 'g');
		if (typeof (initCfg.value) != 'undefined') {
			this._parseValueForControls(initCfg.value);
		}
	},
	_initComponentItems: function () {
		var cfg = {},
			initCfg = this.initialConfig;
		this._beginDisplayField = Ext.create('Ext.form.DisplayField', {
			value: this._beginText,
			style: {
				color: '#666',
				'padding-left': '10px',
				'padding-right': '10px'
			}
		});
		cfg = {
			title: initCfg.title,
			name: initCfg.name,
			getValue: this.getValue.bind(this),
			setValue: this.setValue.bind(this),
			onParentUpdate: this._onParentUpdate.bind(this),
			disabled: initCfg.disabled,
			value: this._endText,
			isValid: this.isValid.bind(this),
			validateOnChange: true,
			validation: true,
			validator: this._validatorHandler.bind(this)
		};
		if (typeof (initCfg.allowBlank) == 'boolean') {
			cfg.allowBlank = initCfg.allowBlank;
		}
		if (typeof (initCfg.fieldLabel) == 'string') {
			cfg.fieldLabel = initCfg.fieldLabel;
			cfg.hideLabel = true;
		}
		this._endTextField = Ext.create('Ext.form.TextField', cfg);
	},
	isValid: function () {
		var initCfg = this.initialConfig,
			required = typeof (initCfg.allowBlank) == 'boolean' && !initCfg.allowBlank,
			invalidCls = 'x-form-trigger-wrap-invalid',
			clsMethod = '',
			result = false,
			borderElm;
		this.getValue();
		result = ((required && this._endText.length === 0) || (this._notAllowedChars.length > 0)) ? false : true;
		if (this._renderStatus) {
			borderElm = this._endTextField.inputEl.up('div').up('div');
			clsMethod = result ? 'removeCls' : 'addCls';
			borderElm[clsMethod](invalidCls);
		}
		return result;
	},
	_validatorHandler: function (val) {
		var initCfg = this.initialConfig;
		this.getValue();
		if (this._notAllowedChars.length > 0) {
			return String.format(
				"Url can contain only characters: '{0}'", 
				this._allowedChars.replace(/\\/g, '')
			);
		} else if (typeof (initCfg.allowBlank) == 'boolean' && !initCfg.allowBlank && this._endText.length === 0) {
			return "This field is required";
		} else {
			return true;
		}
	},
	_resizeElements: function () {
		if (!this._renderStatus) return;
		var maxWidth = this.getWidth();
		var labelWidth = this.labelEl.getWidth();
		var textWidth = this._beginDisplayField.getWidth();
		var inputWidth = this._endTextField.getWidth();
		if (typeof(this.initialConfig.width) != 'undefined') {
			maxWidth = this.initialConfig.width;
		}
		this._endTextField.setWidth(maxWidth - labelWidth - textWidth);
	},
	setValue: function (url) {
		this._parseValueForControls(url);
		if (!this._renderStatus) return;
		this._beginDisplayField.setRawValue(this._beginText);
		this._endTextField.setRawValue(this._endText);
		this._resizeElements();
		return true;
	},
	getValue: function () {
		if (this._renderStatus) {
			this._beginText = this._beginDisplayField.getRawValue();
			this._endText = this._endTextField.getRawValue();
			this._notAllowedChars = this._endText.replace(this._filterAllowedCharsRegExp, '');
			this._endText = this._endText.replace(this._filterNotAllowedCharsRegExp, '');
			this._url = this._beginText + this._endText;
		}
		return this._url;
	},
	_onParentUpdate: function (url) {
		url = typeof (url) == 'string' ? url : '';
		var lastSlashPos = lastSlashPos = url.lastIndexOf('/');
		if (lastSlashPos > -1) {
			this._beginText = url.substr(0, lastSlashPos + 1);
		} else {
			this._beginText = '/';
		}
		this._beginDisplayField.setRawValue(this._beginText);
		this._resizeElements();
		return true;
	},
	_parseValueForControls: function (url) {
		var lastSlashPos = 0;
		this._url = typeof(url) == 'string' ? url : '';
		if (this._url) {
			lastSlashPos = this._url.lastIndexOf('/');
			if (lastSlashPos > -1) {
				this._beginText = this._url.substr(0, lastSlashPos + 1);
				this._endText = this._url.substr(lastSlashPos + 1);
			} else {
				this._beginText = '/';
				this._endText = this._url;
			}
			this._endText = this._endText.replace(this._filterNotAllowedCharsRegExp, '');
		} else {
			this._beginText = '/';
			this._endText = '';
		}
	}
})