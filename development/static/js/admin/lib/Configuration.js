Ext.define('App.lib.Configuration', {
	config : {
		tabKeysControllers: {
			'ff': 'App.controller.files.File',
			'fl': 'App.controller.files.Link',
			'fd': 'App.controller.files.Directory',
			'dp': 'App.controller.documents.Page',
			'dl': 'App.controller.documents.Link',
			'ai': 'App.controller.assets.Image',
			'af': 'App.controller.assets.Folder',
			'of': 'App.controller.objects.Folder',
		},
		controllersTabKeys: {
			// initialized in constructor
		}
	},
	constructor: function () {
		var tabKeysControllers = this.config.tabKeysControllers,
			controllersTabKeys = this.config.controllersTabKeys;
		for (tabKey in tabKeysControllers) {
			tabKeyController = tabKeysControllers[tabKey];
			controllersTabKeys[tabKeyController] = tabKey;
		}
	},
	getControllerClassStringByTabKey: function (tabKey)
	{
		var tabKeysControllers = this.config.tabKeysControllers;
		if (!/^([a-z]*)$/g.test(tabKey)) {
			throw new Error("Tab key: '" + tabKey + "' in wrong format, only characters ([a-z]*) allowed.");
		}
		if (!tabKeysControllers[tabKey]) {
			throw new Error("No controller class defined for tab key: '" + tabKey + "' in 'App.controller.Configuration.config.tabKeysControllers'.");
		}
		return tabKeysControllers[tabKey];
	},
	getTabKeyByControllerClassString: function (ctrlClassString) {
		var controllersTabKeys = this.config.controllersTabKeys;
		if (!controllersTabKeys[ctrlClassString]) {
			throw new Error("Controller class: '" + ctrlClassString + "' not defined in 'App.controller.Configuration.config.tabKeysControllers'.");
		}
		return controllersTabKeys[ctrlClassString];
	}
});
