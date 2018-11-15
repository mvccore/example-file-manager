Ext.define('Ext.ux.form.LocalizedActiveStates', {
	extend: 'Ext.button.Button',
	alias: 'widget.localizedactivestates',
	scale: 'small',
	text: 'Activate/deactivate',
	cls: 'localized-active-states',
	_iconClsBase: 'localized-active-states',
	_iconClasses: {
		allActive:			'localized-active-states-all-active',
		activeAndInactive:	'localized-active-states-active-and-inactive',
		allInactive:		'localized-active-states-all-inactive',
		checked:			'localized-active-states-checked',
		unchecked:			'localized-active-states-unchecked',
		itemBase:			'localized-active-state-item',
		itemBaseLocalized:	'lang-icon-{0}',
		itemIconFullActive: 'localized-active-state-full-active',
		itemIconHalfActive: 'localized-active-state-half-active',
		itemIconInactive:	'localized-active-state-inactive',
		itemFullActive:		'x-btn-full-active',
		itemHalfActive:		'x-btn-half-active'
	},
	_activeStates: {},
	_translator: function (key) { return key; },
	initComponent: function () {
		var lang = '',
			initialConfig = this.initialConfig,
			translator = initialConfig.translator,
			activeStates = {};
		this._activeStates = {};
		if (typeof (translator) != 'undefined') this._translator = translator;
		this.text = this._translator(this.text);
		if (typeof (initialConfig.activeStates) != 'undefined') {
			activeStates = initialConfig.activeStates;
			for (lang in activeStates) {
				this._activeStates[lang] = Boolean(activeStates[lang]);
			}
		}
		this.menu = this._initComponentBaseItems();
		this._setUpBaseBtnIconCls();
		this.callParent(arguments);
	},
	setValue: function (activeStates) {
		var lang = '',
			newItems = [];
		this._activeStates = {};
		for (lang in activeStates) {
			this._activeStates[lang] = Boolean(activeStates[lang]);
		}
		this._clearAllLocalizedItems();
		if (this._btnGroup) this._btnGroup.add(
			this._completeBtnGroupLangItems()
		);
		this._setUpBaseBtnIconCls();
	},
	getValue: function (activeStates) {
		return this._activeStates;
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
			active = true,
			counter = 0,
			length = 0;
		for (var lang in this._activeStates) {
			active = this._activeStates[lang];
			result.push(
				this._completeBtnGroupLangItem(lang, active ? 1 : -1)
			);
			if (active) counter += 1;
			length += 1;
		}
		if (length > 1) {
			result.unshift(this._completeBtnGroupLangItem(
				'all', counter == length ? 1 : (counter > 0 ? 0 : -1)
			));
		}
		return result;
	},
	_completeBtnGroupLangItem: function (lang, active) {
		var langText = this._translator(String.format('Language ({0})', lang)),
			className = [
				this._iconClasses.itemBase,
				String.format(this._iconClasses.itemBaseLocalized, lang),
				this._completeItemClsByActiveState(active)
			],
			iconClass = this._completeCheckBoxIconClsByActiveState(active);
		return {
			text: langText,
			cls: className.join(' '),
			iconCls: iconClass,
			listeners: {
				click: function (btn, e, eOpts) {
					this._handlerLangMenuItemClick(lang, btn, e, eOpts);
				}.bind(this)
			}
		};
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
		var active = 0,
			activeStatesLength = 0,
			activesCounter = 0,
			itemsCounter = 1,
			lang = '',
			btn;
		for (lang in this._activeStates) {
			activeStatesLength += 1;
			if (this._activeStates[lang]) activesCounter += 1;
		}
		if (activesCounter === 0) {
			active = 1;
		} else if (activesCounter == activeStatesLength) {
			active = -1;
		} else {
			active = 1;
		}
		for (lang in this._activeStates) {
			this._activeStates[lang] = active == 1 ? true : false;
			btn = this._btnGroup.items.getAt(itemsCounter);
			this._setUpNormalItem(btn, active);
			itemsCounter += 1;
		}
		this._setUpBaseBtnIconCls();
		btn = this._btnGroup.items.getAt(0);
		this._setUpNormalItem(btn, active);
		this.fireEventArgs('change', [].slice.apply(arguments));
	},
	_handlerLangMenuItemClickNormalLangValue: function (lang, btn, e, eOpts) {
		var active = 0,
			activeStatesLength = 0,
			activesCounter = 0;
		this._activeStates[lang] = !this._activeStates[lang];
		active = this._activeStates[lang] ? 1 : -1;
		this._setUpBaseBtnIconCls();
		this._setUpNormalItem(btn, active);
		for (lang in this._activeStates) {
			activeStatesLength += 1;
			if (this._activeStates[lang]) activesCounter += 1;
		}
		if (activesCounter === 0) {
			active = -1;
		} else if (activesCounter == activeStatesLength) {
			active = 1;
		} else {
			active = 0;
		}
		this._setUpNormalItem(this._btnGroup.items.getAt(0), active);
		this.fireEventArgs('change', [].slice.apply(arguments));
	},
	_setUpNormalItem: function (btn, active) {
		btn
			.removeCls(this._iconClasses.itemHalfActive)
			.removeCls(this._iconClasses.itemFullActive);
		btn.addCls(
			this._completeItemClsByActiveState(active)
		);
		btn.setIconCls(
			this._completeCheckBoxIconClsByActiveState(active)
		);
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
	},
	_setUpBaseBtnIconCls: function () {
		var iconClsItems = [this._iconClsBase],
			activeStatesLength = 0,
			activesCounter = 0;
		for (var lang in this._activeStates) {
			activeStatesLength += 1;
			if (this._activeStates[lang]) activesCounter += 1;
		}
		if (activesCounter === 0) {
			iconClsItems.push(this._iconClasses.allInactive);
		} else if (activesCounter == activeStatesLength) {
			iconClsItems.push(this._iconClasses.allActive);
		} else {
			iconClsItems.push(this._iconClasses.activeAndInactive);
		}
		this.setIconCls(iconClsItems.join(' '));
	},
	_completeItemClsByActiveState: function (active) {
		if (active == -1) {
			return '';
		} else if (active === 0) {
			return this._iconClasses.itemHalfActive;
		} else if (active == 1) {
			return this._iconClasses.itemFullActive;
		}
	},
	_completeCheckBoxIconClsByActiveState: function (active) {
		if (active == -1) {
			return this._iconClasses.itemIconInactive;
		} else if (active === 0) {
			return this._iconClasses.itemIconHalfActive;
		} else if (active == 1) {
			return this._iconClasses.itemIconFullActive;
		}
	}
});