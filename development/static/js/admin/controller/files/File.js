Ext.define('App.controller.files.File', {
	extend: 'App.controller.files.Base',
	requires: [
		'App.controller.layout.Tab',
		'App.model.files.File',
	],
	views: [
		'App.view.files.File',
		'App.view.files.file.windows.Remove',
		'App.view.files.file.windows.ReloadUnsavedChanges'
	],
	models: ['App.model.files.File'],
	handlerSave: function () {
		var submitResult = this.$$view.submitValues();
		if (!submitResult.success) {
			this.$handlerSaveDisplaySubmitErrors(submitResult.errors);
		} else {
			if (this.getTabChanged()) {
				this.setTabChanged(false);
				var oldDirPath = this.model.data.common.dirPath;
				var oldBaseName = this.model.data.common.baseName;
				var oldTreeId = this.model.data.system.treeId;
				var oldAttrs = this.model.data.common.attrs;
				this.model.update(
					submitResult.data,
					this._handlerSaveResponse.bind(
						this, oldDirPath, oldBaseName, oldTreeId, oldAttrs
					)
				);
			} else {
				App.instance.helpers.showNotification(
					t('Info'), t('No changes made.'), 'info'
				);
			}
		}
	},
	handlerRemove: function () {
		var commonData = this.data.common;
		Ext.create(this.views[1], {
			callback: function (yesOrNo, undef, win) {
				if (yesOrNo == 'yes') {
					this.model.remove(
						this.data.common,
						function (removedIds) {
							// remove tree node
							var treeStore = this.$getNavigationTree().getStore();
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
	_handlerSaveResponse: function (oldDirPath, oldBaseName, oldTreeId, oldAttrs, response) {
		var helpers = App.instance.helpers;
		if (response.success) {
			this._handlerSaveResponseUpdateTabContent(response);
			var changedDir = oldDirPath !== this.model.data.common.dirPath;
			var changedName = oldBaseName !== this.model.data.common.baseName;
			var changedAttrs = oldAttrs !== this.model.data.common.attrs;
			if (changedDir || changedName || changedAttrs)
				this._handlerSaveResponseUpdateTreeAndReRegisterTab(
					changedDir, changedName, changedAttrs, oldTreeId
				);
			helpers.showNotification(
				t('Save'), t('File has been successfully saved'), 'success'
			);
		} else if (response.sendContentAgain) {
			var submitResult = this.$$view.submitValues();
			submitResult.data.common.content = this.model.data.common.content;
			this.model.update(
				submitResult.data,
				this._handlerSaveResponse.bind(
					this, oldDirPath, oldBaseName, oldTreeId, oldAttrs
				)
			);
		} else {
			this.setTabChanged(true);
			helpers.showNotification(
				t('Error'), t('Error by saving the file.'), 'error',
				response.message
			);
		}
	},
	_handlerSaveResponseUpdateTabContent: function (response) {
		var newTitle = this.$getModelTitleRecord();
		// set up new tab title if old title is different
		if (this.getTitle() != newTitle) 
			this.setTitle(newTitle);
		this.$$view.onSaved(response);
		this.setTabChanged(false);
	},
	_handlerSaveResponseUpdateTreeAndReRegisterTab: function (changedDir, changedName, changedAttrs, oldTreeId) {
		var navigationTree = this.$getNavigationTree();
		var systemData = this.model.data.system;
		if (changedDir) {
			// remove old tree node
			var node = navigationTree.getStore().getById(oldTreeId);
			if (RealTypeOf(node) != 'Null') node.remove();
			// try to target new directory path and reload it
			var treeIdPath = systemData.treeIdPath;
			var lastSlashPos = treeIdPath.lastIndexOf('/');
			if (lastSlashPos > -1) treeIdPath = treeIdPath.substr(0, lastSlashPos);
			navigationTree.selectPath(
				'root/' + treeIdPath, 'id', '/', // treeIdPath, field, separator
				function (success, lastSelectedNodeRecord, node) {
					lastSelectedNodeRecord.data.expanded = true;
					if (success) 
						navigationTree.getStore().load({
							node: lastSelectedNodeRecord,
							callback: Function.EMPTY
						});
				}.bind(this)
			);
		} else if (changedName || changedAttrs) {
			// reinitialize tree record with new data
			var treeNode = navigationTree.getStore().getNodeById(oldTreeId);
			if (RealTypeOf(treeNode) != 'Null') {
				treeNode.set('id', systemData.treeId);
				treeNode.set('fullPath', this.model.data.common.fullPath);
				treeNode.set('text', systemData.treeNodeText);
				treeNode.set('cls', systemData.treeNodeCls);
				treeNode.set('qtip', systemData.treeQtip);
			}
		}
		// re-register tab when full path changed
		var mainCtrl = this.$getMainController();
		mainCtrl.unregisterTab({ id: oldTreeId });
		var newUniqueData = {
			id: systemData.treeId
		};
		this.setUniqueData(newUniqueData);
		mainCtrl.registerTab(newUniqueData, this);
	}
});
