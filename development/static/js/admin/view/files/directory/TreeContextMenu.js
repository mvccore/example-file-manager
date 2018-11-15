Ext.define('App.view.files.directory.TreeContextMenu', {
	extend: 'App.view.layout.ContextMenu',
	listeners: {
		hide: function (menu, eOpts) {
			menu.$$controller.destroy();
		}
	},
	initComponent: function () {
		var data = this.initialConfig.data,
			item = {};
		this.items = [].concat(
			this._initCmpntMenuNewDocs(),
			this._initCmpntMenuActiveDeactive(),
			this._initCmpntMenuActiveRenameRefreshDelete()
		);
		for (var i = 0, l = this.items.length; i < l; i += 1) {
			item = this.items[i];
			item.xtype = 'menuitem';
			item.iconCls = 'admin-tree-ctx-menu-icon admin-tree-ctx-menu-icon-' + item.iconCls;
		}
		this.callParent();
	},
	_initCmpntMenuNewDocs: function () {
		return [{
			text: t('New File'),
			iconCls: 'add-page',
			handler: this.$$controller.ctxMenuHandlerFileAdd.bind(this.$$controller)
		}, {
			text: t('New Directory'),
			iconCls: 'add-directory',
			handler: this.$$controller.ctxMenuHandlerDirectoryAdd.bind(this.$$controller)
		}, {
			text: t('New Link'),
			iconCls: 'add-link',
			handler: this.$$controller.ctxMenuHandlerLinkAdd.bind(this.$$controller)
		}];
	},
	_initCmpntMenuActiveDeactive: function () {
		var lang = '',
			activeState = false,
			result = [],
			activeStates = {},
			activateItems = [],
			deactivateItems = [];
		if (this.initialConfig.data.i == 1) return [];
		activeStates = this.initialConfig.data.activeStates;
		for (lang in activeStates) {
			activeState = activeStates[lang];
			if (activeState) {
				deactivateItems.push(this._completeLocalizedActivateDeactivateMenuSubItem(
					false, lang, this.$$controller.ctxMenuHandlerChangeActiveState
				));
			} else {
				activateItems.push(this._completeLocalizedActivateDeactivateMenuSubItem(
					true, lang, this.$$controller.ctxMenuHandlerChangeActiveState
				));
			}
		}
		if (activateItems.length > 0) {
			if (activateItems.length > 1) {
				activateItems.unshift(this._completeLocalizedActivateDeactivateMenuSubItem(
					true, 'all', this.$$controller.ctxMenuHandlerChangeActiveState
				));
			}
			result.push({
			text: t('Activate'),
				iconCls: 'activate',
				menu: activateItems
			});
		}
		if (deactivateItems.length > 0) {
			if (deactivateItems.length > 1) {
				deactivateItems.unshift(this._completeLocalizedActivateDeactivateMenuSubItem(
					false, 'all', this.$$controller.ctxMenuHandlerChangeActiveState
				));
			}
			result.push({
				text: t('Deactivate'),
				iconCls: 'deactivate',
				menu: deactivateItems
			});
		}
		return result;
	},
	_initCmpntMenuActiveRenameRefreshDelete: function () {
		var lang = '',
			data = this.initialConfig.data,
			langs = data.langs,
			result = [],
			renameLocalizedItems = [];
		// if document is not homepage - complete all localized rename items
		if (data.i > 1) {
			for (var i = 0, l = langs.length; i < l; i += 1) {
				lang = langs[i];
				renameLocalizedItems.push({
					text: String.format(t('Rename version: {0}'), t(String.format('Language ({0})', lang)).toLocaleLowerCase()),
					iconCls: 'admin-tree-ctx-menu-icon-lang lang-icon-' + lang,
					handler: this._completeLocalizedControllerHandler(
						this.$$controller.ctxMenuHandlerRename, lang
					)
				});
			};
			result.push({
				text: t('Rename'),
				iconCls: 'rename',
				hideOnClick: false,
				menu: renameLocalizedItems
			});
		}
		// if document has childs - add refresh item
		if (!data.leaf) {
			result.push({
				text: t('Refresh'),
				iconCls: 'refresh',
				handler: this.$$controller.ctxMenuHandlerRefresh.bind(this.$$controller)
			});
		}
		if (data.i > 1) {
			result.push({
				text: t('Remove'),
				iconCls: 'remove',
				handler: this.$$controller.ctxMenuHandlerRemove.bind(this.$$controller)
			});
		}
		return result;
	},
	_completeLocalizedActivateDeactivateMenuSubItem: function (activate, lang, handler) {
		var translatorFraze = activate ? 'Activate' : 'Deactivate';
		var activeStateCls = ' admin-tree-ctx-submenu-icon-' + (activate ? 'activate' : 'deactivate');
		translatorFraze += ' version';
		translatorFraze += ((lang == 'all') ? 's' : '') + ': {0}';
		if (lang != 'all') activeStateCls = '';
		return {
			text: String.format(t(translatorFraze), t(String.format('Language ({0})', lang)).toLocaleLowerCase()),
			iconCls: String.format('admin-tree-ctx-menu-icon-lang{0} lang-icon-{1}', activeStateCls, lang),
			handler: this._completeLocalizedControllerHandler(
				handler, activate, lang
			)
		}
	},
	_completeLocalizedControllerHandler: function (handler, activate, lang) {
		return function (item, eOpts) {
			handler.call(this.$$controller, activate, lang, item, eOpts);
		}.bind(this)
	}
});
