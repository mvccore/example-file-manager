Ext.define('App.view.files.windows.NewLink', {
	extend: 'Ext.window.Window',
	requires: [
		'Ext.window.MessageBox',
		//'Ext.ux.form.LocaleCombo'
	],
	modal: true,
	border: false,
	closable: false,
	_submitProcessing: false,
	_minWidth: 450,
	_maxWidth: 800,
	_allTabsNecessaryWidth: 0,
	_titles: {
		page: t('New page'),
		link: t('New link')
	},
	_textContent: {
		page: t('Enter title and end page address fragment'),
		link: t('Enter title and end page address fragment')
	},
	_loadingTexts: [
		t('Loading address fragment.'),
		t('Checking free adresses on id: {0}.')
	],
	_loadingCls: 'prompt-window-bottom-bar-loading',
	_tabTitles: {},
	_localizedFields: {},
	_parentId: 0,
	_langs: [],
	_type: '',
	$$controller: null,
	constructor: function (cfg) {
		this._parentId = cfg.parentId;
		this._langs = cfg.langs;
		this._type = cfg.type;
		this.$$controller = cfg.$$controller;
		this._maxWidth = window.innerWidth - 10;
		this.callParent(arguments);
	},
	initComponent: function () {
		this.title = this._titles[this._type];
		this.items = this._initContent();
		this.buttons = this._initButtons();
		this.callParent(arguments);
	},
	displayErrors: function (errors) {
		this._errorsPanel.removeAll();
		for (var i = 0, l = errors.length; i < l; i += 1) {
			this._errorsPanel.add({
				xtype: 'container',
				style: 'color:red;',
				html: errors[i]
			});
		}
		this._errorsPanel.show();
		this._submitProcessing = false;
		this._hideLoading();
	},
	_okHandler: function () {
		var localizedData = {},
			fieldValues = {},
			localizedForm;
		if (this._submitProcessing) {
			return;
		} else {
			this._submitProcessing = true;
			this._displayLoading(1);
		}
		for (var i = 0, l = this._localizedFormTabs.length; i < l; i += 1) {
			localizedForm = this._localizedFormTabs[i];
			localizedData[localizedForm.lang] = localizedForm.getForm().getFieldValues();;
		}
		this.$$controller.onNewDocumentWindowHandler(
			this, this._type, localizedData, this._alterLang.getValue()
		);
	},
	_initContent: function () {
		this._alterLang = Ext.create('Ext.ux.form.LocaleCombo', {
			langs: this._langs,
			translator: t,
			fieldLabel: t('Fill missing data by language'),
			width: 150
		});
		this._errorsPanel = Ext.create('Ext.panel.Panel', {
			cls: 'panel-layout-form-no-border-spacing',
			bodyStyle: 'padding-bottom:10px;',
			layout: 'form',
			width: '100%',
			border: false,
			items: ''
		});
		this._errorsPanel.hide();
		this._initContentTabTitlesAndAllTabsNecessaryWidth();
		this._localizedFormTabs = this._initLocalizedTabs();
		return Ext.create('Ext.panel.Panel', {
			title: this._textContent[this._type],
			border: false,
			bodyStyle: 'padding: 10px;',
			items: [
				Ext.create('Ext.panel.Panel', {
					cls: 'panel-layout-form-no-border-spacing',
					bodyStyle: 'padding-bottom: 10px;',
					layout: 'form',
					width: '100%',
					border: false,
					items: this._alterLang,
					listeners: {
						boxready: function (panel, w, h, eOpts) {
							var alterLangBodyElm = this._alterLang.bodyEl;
							alterLangBodyElm.setWidth(
								Math.max(alterLangBodyElm.getWidth() - 100, 150)
							);
						}.bind(this)
					}
				}),
				this._errorsPanel,
				Ext.create('Ext.tab.Panel', {
					items: this._localizedFormTabs
				})
			]
		});
	},
	_initContentTabTitlesAndAllTabsNecessaryWidth: function () {
		var i = 0, l = 0,
			title = '', 
			lang = '';
		this._allTabsNecessaryWidth = 10 + 8;
		for (var i = 0, l = this._langs.length; i < l; i += 1) {
			lang = this._langs[i];
			title = t(String.format('Language ({0})', lang));
			this._tabTitles[lang] = title;
			tabTitleWidth = 10 + 20 + 6 + (title.length * 6.8) + 10;
			this._allTabsNecessaryWidth += ((l - 1) * 4) + tabTitleWidth;
		}
		this._allTabsNecessaryWidth += 8 + 10;
		this.width = Math.min(
			Math.max(this._allTabsNecessaryWidth, this._minWidth),
			this._maxWidth
		);
	},
	_initLocalizedTabs: function () {
		var items = [];
		for (var i = 0, l = this._langs.length; i < l; i += 1) {
			items.push(this._initLocalizedTab(this._langs[i]));
		}
		return items;
	},
	_initLocalizedTab: function (lang) {
		var fields = {
			title: Ext.create('Ext.form.field.Text', {
				name: 'title',
				fieldLabel: t('Title'),
				listeners: {
					blur: this._initLocalizedTabOnTitleBlurHandler.bind(this, lang)
				}
			}),
			key: Ext.create('Ext.form.field.Text', {
				name: 'key',
				fieldLabel: t('Address segment')
			})
		};
		this._localizedFields[lang] = fields;
		return Ext.create('Ext.form.Panel', {
			lang: lang,
			title: this._tabTitles[lang],
			iconCls: String.format('lang-icon-{0}', lang),
			bodyStyle: 'padding: 10px;',
			defaults: {
				xtype: 'textfield',
				width: '100%',
				labelStyle: 'white-space:nowrap;'
			},
			items: [
				fields.title,
				fields.key
			],
			listeners: {
				boxready: function (panel, w, h, eOpts) {
					var fields = panel.getForm().getFields();
					fields.each(function (item, index, length) {
						item.bodyEl.setWidth(item.bodyEl.getWidth() - 40);
					});
				}.bind(this)
			},
		});
	},
	_initLocalizedTabOnTitleBlurHandler: function (lang, field, e, eOpts) {
		var keyField = this._localizedFields[lang].key,
			titleValue = field.getValue().trim(),
			keyValue = keyField.getValue().trim();
		if (titleValue.length > 0 && keyValue.length === 0) {
			this._displayLoading(0);
			App.instance.helpers.getValidFileName(titleValue, true, function (response) {
				keyValue = keyField.getValue().trim();
				if (keyValue.length === 0) keyField.setValue(response.fileName);
				this._hideLoading();
			}.bind(this));
		}
	},
	_initButtons: function () {
		this._loadingElm = Ext.create('Ext.toolbar.TextItem', {
			html: ''
		});
		return [this._loadingElm, '->', {
			text: t('OK'),
			handler: this._okHandler.bind(this)
		}, {
			text: t('Cancel'),
			handler: function () {
				if (this._submitProcessing) return;
				this.$$controller.destroy();
				this.close();
			}.bind(this)
		}];
	},
	_displayLoading: function (loadingTextIndex) {
		this._loadingElm.addCls(this._loadingCls);
		this._loadingElm.getEl().setHtml(
			String.format(this._loadingTexts[loadingTextIndex], this._parentId)
		);
	},
	_hideLoading: function () {
		this._loadingElm.removeCls(this._loadingCls);
		this._loadingElm.getEl().setHtml('');
	}
});
