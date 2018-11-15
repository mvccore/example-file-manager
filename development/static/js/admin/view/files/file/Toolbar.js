Ext.define('App.view.files.file.Toolbar', {
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		//'Ext.ux.form.LocaleCombo',
		//'Ext.ux.form.LocalizedActiveStates',
		//'Ext.ux.form.LocalizedOpener'
	],
	border: false,
	cls: "main-toolbar",
	initComponent: function () {
		this._initButtons();
		this._initItems();
		this.callParent();
	},
	initValues: function (data) {
		this.setValues(data);
		//this.buttons.activeStates.on('change', this.setTabChanged.bind(this, true));
	},
	reinitValues: function (data) {
		this.setValues(data);
	},
	setValues: function (data) {
		/*-var activeStates = this._completeActiveStatesFromLocalizedData(data.localized),
			activeStatesBtn = this.buttons.activeStates;
		activeStatesBtn.setValue(activeStates);*/
	},
	setTabChanged: function (changed) {
		this.initialConfig.$$view.setTabChanged(changed);
	},
	/*_completeActiveStatesFromLocalizedData: function (localizedData) {
		var activeStatesBtn = this.buttons.activeStates,
			activeStates = {};
		for (var lang in localizedData) {
			activeStates[lang] = localizedData[lang].Active;
		}
		return activeStates;
	},*/
	_initButtons: function () {
		var data = this.initialConfig.data,
			controller = this.initialConfig.$$view.$$controller;

		this.buttons = {};

		this.buttons.save = new Ext.Button({
			cls: 'save',
			text: t('Save'),
			iconCls: 'fa files-toolbar-icon-save',
			listeners: {
				click: controller.handlerSave.bind(controller)
			}
		});
		
		this.buttons.reload = new Ext.Button({
			cls: 'reload',
			text: t('Reload'),
			iconCls: 'fa files-toolbar-icon-reload',
			listeners: {
				click: controller.handlerReload.bind(controller)
			}
		});
		this.buttons.remove = new Ext.Button({
			cls: 'delete',
			text: t('Delete'),
			iconCls: 'fa files-toolbar-icon-remove',
			listeners: {
				click: controller.handlerRemove.bind(controller)
			}
		});
		this.buttons.treeSelect = new Ext.Button({
			cls: 'tree-select',
			text: t('Show in tree'),
			iconCls: 'fa files-toolbar-icon-show-in-tree',
			listeners: {
				click: function () {
					controller.handlerTreeSelect(Function.EMPTY);
				}
			}
		});
	},
	_initItems: function () {
		var commonData = this.initialConfig.data.common;
		this.items = [
			this.buttons.save,
			'-',
			this.buttons.reload,
			this.buttons.treeSelect,
			'-',
			this.buttons.remove,
			'-',
			'<code>'+commonData.dirPath+'/'+commonData.baseName+'</code>'
		];
	}
});
