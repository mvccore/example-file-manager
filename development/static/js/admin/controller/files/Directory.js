Ext.define('App.controller.files.Directory', {
	extend: 'App.controller.files.Base',
	requires: [
		'App.controller.layout.Tab',
		'App.model.files.Directory',
		'App.store.files.Directory'
	],
	views: [
		'App.view.files.Directory',
		'App.view.files.directory.windows.Remove'
	],
	models: ['App.model.files.Directory'],
	statics: {
		// TODO
		onFileRemovedHandler: function (removedFullPaths, tree, record) {
			var removedFullPath = '',
				uniqueData = {},
				removedDocumentOpened = false,
				mainController = App.instance.getController('layout.Main'),
				mainTabs = mainController.getMainTabs(),
				tabController, currentTab;
			record.remove();
			for (var i = 0, l = removedFullPaths.length; i < l; i += 1) {
				removedFullPath = removedFullPaths[i];
				uniqueData = { fullPath: removedFullPath };
				removedDocumentOpened = mainController.isTabRegistered(uniqueData);
				if (removedDocumentOpened) {
					tabController = mainController.getControllerByUniqueData(uniqueData);
					currentTab = tabController.currentTab;
					tabController.onClose();
					mainTabs.remove(currentTab, true/* autoDestroy */);
					Ext.destroy(tabController);
				}
			}
		}
	},
	// TODO
	handlerRemove: function () {
		var commonData = this.data.common;
		Ext.create(this.views[1], {
			callback: function (yesOrNo, undef, win) {
				if (yesOrNo == 'yes') {
					this.model.remove(
						this.data.common,
						function (removedIds) {
							// remove tree node
							var treeStore = this._getNavigationTree().getStore();
							var node = treeStore.getById(this.data.system.treeId);
							if (RealTypeOf(node) != 'Null') node.remove();
							// close and remove current tab
							var mainTabs = App.instance.getController('layout.Main').getMainTabs();
							this.onClose();
							mainTabs.remove(this.currentTab, true/* autoDestroy */);
							Ext.destroy(this);
						}.bind(this)
					);
				}
			}.bind(this),
			type: commonData.Type
		}).confirm();
	},
	// TODO
	onParentAddressesChanged: function (newAddresses) {
		return;// TODO
		this.$$view.onParentAddressesChanged(newAddresses);
	},
	// TODO
	onParentTreePathChanged: function (newTreePath) {
		return;// TODO
		var systemData = this.model.getData().system;
		systemData.treeIdPath = newTreePath;
		this.model.set('system', systemData);
	},
});
