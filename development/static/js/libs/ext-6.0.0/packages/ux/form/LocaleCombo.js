Ext.define('Ext.ux.form.LocaleCombo', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.localecombo',
	multiSelect: false,
	//forceSelection: true,
	editable: false,
	listConfig: {
		getInnerTpl: function () {
			return '<div class="x-combo-list-item x-locale-combo-item">' +
				'<span class="x-locale-combo-item-flag {cls}"></span>' +
				'<span class="x-locale-combo-item-value">{value}</span>' +
			'</div>';
		}
	},
	triggerAction: 'all',
	/*store: Ext.create('Ext.data.JsonStore', {
		fields: ['key', 'value'],
		data: [
			{ key: 'en', value: 'English' }
			...
		]
	}),*/
	queryMode: 'local',
	valueField: 'key',
	displayField: 'value',
	emptyText: 'Select locale',
	value: '',
	_containerCls: 'x-locale-combo',
	_localeClsTpl: 'lang-icon-{0}',
	_translator: function (key) { return key; },
	_renderStatus: false,
	initComponent: function () {
		var valuesArr = [],
			initialConfig = this.initialConfig,
			translator = initialConfig.translator,
			value = initialConfig.value,
			langs = initialConfig.langs || [],
			lang = '';
		if (typeof (translator) != 'undefined') this._translator = translator;
		this.emptyText = this._translator(this.emptyText);
		this.store = Ext.create('Ext.data.JsonStore', {
			fields: ['key', 'value', 'cls']
		});
		for (var i = 0, l = langs.length; i < l; i += 1) {
			lang = langs[i];
			this.store.add({
				key: lang,
				value: this._translator(String.format('Language ({0})', lang)),
				cls: String.format(this._localeClsTpl, lang)
			});
		}
		this.on('beforeselect', this._beforeSelectHandler.bind(this));
		this.callParent(arguments);
	},
	isValid: function () {
		var initCfg = this.initialConfig,
			required = typeof (initCfg.allowBlank) == 'boolean' && !initCfg.allowBlank;
		return required && this.value.length === 0 ? false : true;
	},
	listeners: {
		afterrender: function (combo, eOpts) {
			if (combo._renderStatus) return;
			var comboElm = combo.bodyEl,
				currentValue = combo.getValue(),
				currentLangCls = '';
			currentValue = (typeof(currentValue) == 'string' && currentValue.length > 0) ? currentValue : 'empty';
			currentLangCls = String.format(this._localeClsTpl, currentValue);
			comboElm
				.addCls(currentLangCls)
				.addCls(combo._containerCls);
			combo._renderStatus = true;
		}
	},
	_beforeSelectHandler: function (combo, record, index, eOpts) {
		var oldValue = combo.getValue(),
			newValue = record.data.key,
			oldCls = String.format(this._localeClsTpl, oldValue),
			newCls = record.data.cls,
			comboElm = combo.bodyEl;
		comboElm
			.removeCls(String.format(this._localeClsTpl, 'empty'))
			.removeCls(oldCls)
			.addCls(newCls);
	},
});