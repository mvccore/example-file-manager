Ext.define('Ext.ux.form.LocalizedOpener', {
	extend: 'Ext.button.Button',
	alias: 'widget.localizedopener',
	text: 'Open',
	// cls: 'localized-opener',
	// scale: 'small',
	_iconClasses: {
		itemBase:			'localized-opener-item',
		itemBaseLocalized:	'lang-icon-{0}'
	},
	_absoluteUrls: {},
	_translator: function (key) { return key; },
	initComponent: function () {
		var lang = '',
			initialConfig = this.initialConfig,
			translator = initialConfig.translator,
			absoluteUrls = {};
		this._absoluteUrls = {};
		if (typeof (translator) != 'undefined') this._translator = translator;
		this.text = this._translator(this.text);
		if (typeof (initialConfig.absoluteUrls) != 'undefined') {
			absoluteUrls = initialConfig.absoluteUrls;
			for (lang in absoluteUrls) {
				this._absoluteUrls[lang] = String(absoluteUrls[lang]);
			}
		}
		this.menu = this._initComponentBaseItems();
		this.callParent(arguments);
	},
	setValue: function (absoluteUrls) {
		var lang = '',
			newItems = [];
		this._absoluteUrls = {};
		for (lang in absoluteUrls) {
			this._absoluteUrls[lang] = String(absoluteUrls[lang]);
		}
		this._clearAllLocalizedItems();
		if (this._btnGroup) this._btnGroup.add(
			this._completeBtnGroupLangItems()
		);
	},
	_initComponentBaseItems: function () {
		this._btnGroup = Ext.create('Ext.container.ButtonGroup', {
			layout: {
				type: 'table',
				align: 'left',
				tableAttrs: {
					style: {
						width: '100%',
						'border-spacing': 0
					}
				}
			},
			columns: 1,
			bodyPadding: 0,
			style: {
				padding: 0,
				border: 0
			},
			cls: this.cls,
			defaults: {
				xtype: 'button',
				scale: 'small',
				iconAlign: 'left',
				textAlign: 'left',
				border: 0,
				width: '100%'
			},
			items: this._completeBtnGroupLangItems()
		});
		return {
			xtype: 'menu',
			plain: true,
			listeners: {
				boxready: this._handlerBaseMenuBoxReady.bind(this)
			},
			items: this._btnGroup
		}
	},
	_completeBtnGroupLangItems: function () {
		var result = [],
			counter = 0;
		for (var lang in this._absoluteUrls) {
			result.push(
				this._completeBtnGroupLangItem(lang)
			);
			counter += 1;
		}
		if (counter > 1) {
			result.unshift(this._completeBtnGroupLangItem('all'));
		}
		return result;
	},
	_completeBtnGroupLangItem: function (lang) {
		var result = {
			text: this._translator(String.format('Language ({0})', lang)),
			cls: this._iconClasses.itemBase,
			listeners: {
				click: function (btn, e, eOpts) {
					this._handlerLangMenuItemClick(lang, btn, e, eOpts);
				}.bind(this)
			}
		};
		if (lang != 'all') {
			result.iconCls = String.format(this._iconClasses.itemBaseLocalized, lang);
		}
		return result;
	},
	_handlerBaseMenuBoxReady: function (menu, width, height, eOpts) {
		var w = Math.max(this.getWidth(), width),
			items = menu.items.items;
		menu.setWidth(w - 1);
		for (var i = 0, l = items.length; i < l; i += 1) {
			items[i].setWidth(w - 1);
		}
	},
	_handlerLangMenuItemClick: function (lang, btn, e, eOpts) {
		if (lang == 'all') {
			this._handlerLangMenuItemAllLangsValue(btn, e, eOpts);
		} else {
			this._handlerLangMenuItemClickNormalLangValue(lang, btn, e, eOpts);
		}
	},
	_handlerLangMenuItemAllLangsValue: function (btn, e, eOpts) {
		for (var lang in this._absoluteUrls) {
			top.window.open(this._absoluteUrls[lang], '_blank');
		}
	},
	_handlerLangMenuItemClickNormalLangValue: function (lang, btn, e, eOpts) {
		top.window.open(this._absoluteUrls[lang], '_blank');
	},
	_clearAllLocalizedItems: function () {
		var item,
			btnGrp = this._btnGroup,
			items;
		if (!btnGrp) return;
		items = this._btnGroup.items;
		if (!items) return;
		while (item = items.first()) {
			btnGrp.remove(item, true);
		}
	}
});