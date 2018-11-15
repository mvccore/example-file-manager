Ext.define('App.controller.files.file.TreeMgr', {
	extend: 'App.controller.files.TreeMgr',
	requires: [
		//'Ext.ux.form.LocaleCombo'
	],
	views: [
		/*0*/'App.view.files.file.TreeContextMenu',
		/*1*/'App.view.files.file.windows.Rename',
		/*2*/'App.view.files.file.windows.Remove',
		/*3*/'App.view.files.file.windows.New'
	],
	models: ['App.model.files.File'],
	initModel: function () {
		this.model = this.getModel(this.models[0]).create(this.$treeData.id);
		this.model.set({ common: this.$treeData });
	},
	onItemContextMenu: function () {
		// debug
		// this.ctxMenuHandlerPageAdd(this.$$view.items.items[0], {});
	},
	onBeforeItemMove: function () {
		var args = this.$eventArgs,
			oldPrnt = args.oldParent,
			newPrnt = args.newParent,
			node = args.node,
			keyIsAllowed = {},
			keyCheckResult = {};
		// check if draged node is root node - root node draging is not allowed
		if (oldPrnt.id == 'root') return false;
		// check if old and new parent has the same module, draging between modules is not allowed
		if (oldPrnt.data.m != newPrnt.data.m) return false;
		// check if there is between new neighbours any node with the same name
		keyCheckResult = this.$checkIfKeyExistInLevel(newPrnt, node.data.text, node.data.id, false);
		if (!keyCheckResult.success) return false;
		// check if document has not any system name for base level
		keyIsAllowed = this.$isKeyAllowed(newPrnt.data.i, node.data.text);
		if (!keyIsAllowed.success) {
			Ext.MessageBox.alert(keyIsAllowed.message, keyIsAllowed.message);
			return false;
		}
		// TODO: add user permitions
		return true;
	},
	onItemMove: function () {
		var args = this.$eventArgs,
			oldPrnt = args.oldParent,
			newPrnt = args.newParent,
			index = args.index,
			tree = args.tree,
			node = args.node;
		tree.view.loadMask.show();
		this.model.move({
			parentId: newPrnt.data.i,
			index: index
		}, function (responseData) {
			this._onItemMoveResponseHandler(responseData, tree, oldPrnt, newPrnt, node);
		}.bind(this));
	},
	_onItemMoveResponseHandler: function (responseData, tree, oldPrnt, newPrnt, node) {
		var data = node.data,
			module = data.m,
			detailMgr = data.detailMgr;
		if (responseData.success) {
			this._callDetailMgrParentStaticMethod(
				detailMgr,
				'processOpenedDocsAndUpdateAddressesIfNecessary',
				[responseData.changedDocumentsAddresses, module]
			);
			this._callDetailMgrParentStaticMethod(
				detailMgr,
				'processOpenedDocsAndUpdateTreePathsIfNecessary',
				[responseData.changedDocumentsTreePaths, module]
			);
		} else {
			App.instance.helpers.showNotification(t("Error"), t("Can't move document."), 'error', responseData.message);
			this.$refreshTreeNode(oldPrnt, Function.EMPTY);
			this.$refreshTreeNode(newPrnt, Function.EMPTY);
		}
		tree.view.loadMask.hide();
		this.destroy();
	},
	ctxMenuHandlerFileAdd: function (item, eOpts) {
		var data = this.$eventArgs.record.data,
			newWindow = Ext.create(this.views[3], {
				$$controller: this,
				parentFullPath: data.fullPath,
				type: 'file'
			})
		;
		this.destroyView();
		newWindow.show();
	},
	ctxMenuHandlerDirectoryAdd: function (item, eOpts) {
		var data = this.$eventArgs.record.data,
			newWindow = Ext.create(this.views[4], {
				$$controller: this,
				parentFullPath: data.fullPath,
				type: 'directory'
			})
		;
		this.destroyView();
		newWindow.show();
	},
	ctxMenuHandlerLinkAdd: function (item, eOpts) {
		var data = this.$eventArgs.record.data,
			newWindow = Ext.create(this.views[5], {
				$$controller: this,
				parentFullPath: data.fullPath,
				type: 'link'
			})
		;
		this.destroyView();
		newWindow.show();
	},
	onNewDocumentWindowHandler: function (newDocWindow, type, localizedData, alterLang) {
		var requiredAndAllowedResult = this._newDocumentHandlerCheckRequiredAndAllowed(localizedData, alterLang);
		if (!requiredAndAllowedResult.success) {
			newDocWindow.displayErrors(requiredAndAllowedResult.errors);
			return false;
		}
		this.model.create(
			this._completeNewDocumentModelData(type, localizedData, alterLang),
			this._documentCreationResponseHandler.bind(this, newDocWindow)
		);
	},
	_documentCreationResponseHandler: function (newDocWindow, response) {
		var errors = [],
			responseErrRec = {};
		if (response.created) {
			this.onDocumentCreatedHandler(response.treeData);
			newDocWindow.close();
		} else {
			for (var lang in response.errors) {
				responseErrRec = response.errors[lang];
				errors.push(
					t('There is document with the same address in database already. Enter different address segment.') +
					String.format(
						' (language: {0}, id: {1}, address: "{2}")',
						lang, responseErrRec.id, responseErrRec.address
					)
				);
			}
			newDocWindow.displayErrors(errors);
		}
	},
	_newDocumentHandlerCheckRequiredAndAllowed: function (localizedData, alterLang) {
		var args = this.$eventArgs,
			parentNodeData = args.record.data,
			fieldValues = {},
			errors = [],
			allRequiredValues = true,
			allKeysAllowed = true,
			keyIsAllowed = {},
			keyValue = '',
			defaultKey = '';
		alterLang = RealTypeOf(alterLang) == 'Null' ? '' : alterLang;
		defaultKey = (alterLang.length > 0) ? localizedData[alterLang].key.trim() : '';
		for (var lang in localizedData) {
			fieldValues = localizedData[lang];
			keyValue = fieldValues.key.trim();
			if (
				(alterLang == '' && keyValue.length === 0) ||
				(alterLang == lang && keyValue.length === 0)
			) {
				errors.push(t('Address segment is required.') + String.format(' (language: {0})', lang));
				allRequiredValues = false;
			}
			keyIsAllowed = this.$isKeyAllowed(parentNodeData.i, (keyValue.length === 0) ? defaultKey : keyValue);
			if (!keyIsAllowed.success) {
				errors.push(keyIsAllowed.message + String.format(' (language: {0})', lang));
				allKeysAllowed = false;
			}
		}
		return {
			success: allRequiredValues && allKeysAllowed,
			errors: errors
		}
	},
	_completeNewDocumentModelData: function (type, localizedData, alterLang) {
		var args = this.$eventArgs,
			parentNodeData = args.record.data,
			data = {},
			titleValue = '',
			keyValue = '',
			titleDefault = '',
			keyDefault = '';
		alterLang = RealTypeOf(alterLang) == 'Null' ? '' : alterLang;
		keyDefault = (alterLang.length > 0) ? localizedData[alterLang].key.trim() : '';
		titleDefault = (alterLang.length > 0) ? localizedData[alterLang].title.trim() : '';
		for (var lang in localizedData) {
			fieldValues = localizedData[lang];
			titleValue = fieldValues.title.trim();
			keyValue = fieldValues.key.trim();
			data[lang] = {
				title: (titleValue.length === 0) ? titleDefault : titleValue,
				key: (keyValue.length === 0) ? keyDefault : keyValue
			};
		}
		return {
			id: parentNodeData.i,
			module: parentNodeData.m,
			type: type,
			data: data,
		};
	},
	onDocumentCreatedHandler: function (newDocTreeData) {
		var record = this.$eventArgs.record,
			ownerTree = record.getOwnerTree(),
			newNode;
		if (!record.data.expanded) {
			this.$refreshTreeNode(record, function (records, operation, boolean) {
				var rec = {};
				for (var i = 0, l = records.length; i < l; i += 1) {
					rec = records[i];
					if (rec.data.id == newDocTreeData.id) {
						newNode = rec;
						break;
					}
				}
				this._selectAndClickOnLoadedTreeNodeItem(ownerTree, newNode);
			}.bind(this));
		} else {
			newNode = record.insertChild(newDocTreeData.sequence, newDocTreeData);
			this._selectAndClickOnLoadedTreeNodeItem(ownerTree, newNode);
		}
	},
	_selectAndClickOnLoadedTreeNodeItem: function (ownerTree, newNode) {
		var treePathItems = [],
			currentNode = newNode;
		while (true) {
			treePathItems.push(currentNode.id);
			if (currentNode.id == 'root') break;
			currentNode = currentNode.parentNode;
		}
		treePathItems.reverse();
		ownerTree.selectPath(
			treePathItems.join('/'), 'id', '/',
			function (success, /*last selected node record*/lastNode, node) {
				ownerTree.fireEventArgs('itemclick', [ownerTree, newNode]);
			}.bind(this)
		);
	},
	ctxMenuHandlerChangeActiveState: function (newActiveState, lang, item, eOpts) {
		var args = this.$eventArgs,
			tree = args.tree,
			record = args.record,
			activeStates = record.get('activeStates'),
			aLang = '';
		if (lang == 'all') {
			for (aLang in activeStates) {
				activeStates[aLang] = newActiveState;
			}
		} else {
			activeStates[lang] = newActiveState;
		}
		record.set('activeStates', activeStates);
		tree.loadMask.show();
		this.model.changeActiveState({
			lang: lang,
			newActiveState: newActiveState
		}, function (responseData) {
			this._onItemChangeActiveStateResponseHandler(responseData, newActiveState, lang, tree, record);
		}.bind(this));
	},
	_onItemChangeActiveStateResponseHandler: function (responseData, newActiveState, lang, tree, record) {
		var errorMsg = newActiveState ? t("Can't activate document.") : t("Can't deactivate document."),
			nodeElmCont = Ext.fly(tree.getNodeByRecord(record)),
			treeItemElm = nodeElmCont.down('.document-tree-item'),
			mainController = App.instance.getController('layout.Main'),
			movedDocumentOpened = false,
			uniqueData = {},
			tabController;
		if (responseData.success) {
			treeItemElm.removeCls('document-active-inactive').removeCls('document-all-inactive');
			treeItemElm.addCls(responseData.newClass);
			record.set('cls', responseData.newClass);
			// check if there are any opened tabs with this activated document, if there is, update active state controls
			uniqueData = { i: record.data.i, m: record.data.m };
			movedDocumentOpened = mainController.isTabRegistered(uniqueData);
			if (movedDocumentOpened) {
				tabController = mainController.getControllerByUniqueData(uniqueData);
				tabController.onActiveStateChanged(record.get('activeStates'));
			}
		} else {
			App.instance.helpers.showNotification(t("Error"), errorMsg, "error", responseData.message);
			this.$refreshTreeNode(record.parentNode, Function.EMPTY);
		}
		tree.loadMask.hide();
		this.destroy();
	},
	ctxMenuHandlerRename: function (lang, item, eOpts) {
		var args = this.$eventArgs,
			record = args.record,
			keys = record.data.keys,
			renameWindow = Ext.create(this.views[1], {
				lang: lang,
				$$controller: this,
				oldKey: (typeof (keys[lang]) != 'undefined') ? keys[lang] : record.data.text
			})
		;
		this.destroyView();
		renameWindow.prompt();
	},
	onItemRenameWindowHandler: function (lang, okOrCancel, newKey) {
		var args = this.$eventArgs,
			record = args.record,
			tree = args.tree,
			keyIsAllowed = false,
			recordData = record.data,
			parentNode = record.parentNode,
			docKeys = recordData.keys,
			keyCheckResult = this.$checkIfKeyExistInLevel(
				parentNode,
				newKey,
				recordData.id,
				true
			)
		;
		newKey = keyCheckResult.key;
		keyIsAllowed = this.$isKeyAllowed(parentNode.data.i, newKey);
		if (okOrCancel != 'ok' || !keyCheckResult.success || !keyIsAllowed.success) {
			if (!keyIsAllowed.success) Ext.MessageBox.alert(keyIsAllowed.message, keyIsAllowed.message);
			this.destroy();
			return;
		}
		docKeys[lang] = newKey;
		record.set('keys', docKeys);
		if (recordData.lang == lang) {
			record.set('text', newKey);
		}
		tree.loadMask.show();
		this.model.rename({
			key: newKey,
			lang: lang
		}, function (responseData) {
			this._onItemRenameResponseHandler(responseData, tree, record);
		}.bind(this));
	},
	_onItemRenameResponseHandler: function (responseData, tree, record) {
		var uniqueData = {},
			movedDocumentOpened = false,
			mainController,
			tabController;
		if (responseData.success) {
			this.$refreshTreeNode(record, Function.EMPTY);
			// check if there are any opened tabs with this relocated document, if there is, update it's path
			this._callDetailMgrParentStaticMethod(
				record.data.detailMgr,
				'processOpenedDocsAndUpdateAddressesIfNecessary',
				[responseData.changedDocumentsAddresses, record.data.m]
			);
		} else {
			App.instance.helpers.showNotification(t("Error"), t("Can't rename document."), "error", responseData.message);
			this.$refreshTreeNode(record.parentNode, Function.EMPTY);
		}
		tree.loadMask.hide();
		this.destroy();
	},
	ctxMenuHandlerRefresh: function (item, eOpts) {
		this.$refreshTreeNode(this.$eventArgs.record, Function.EMPTY);
		this.destroy();
	},
	ctxMenuHandlerRemove: function (item, eOpts) {
		var record = this.$eventArgs.record,
			removeWindow = Ext.create(this.views[2], {
				callback: function (yesOrNo, undef, win) {
					if (yesOrNo == 'yes') this.onRemoveDocumentWindowHandler();
					if (yesOrNo == 'no') this.destroy();
				}.bind(this),
				type: record.data.type
			})
		;
		this.destroyView();
		removeWindow.confirm();
	},
	onRemoveDocumentWindowHandler: function () {
		var args = this.$eventArgs,
			tree = args.tree,
			record = args.record,
			data = record.data;
		this.model.remove({
			id: data.i,
			module: data.m
		}, function (removedIds) {
			this._callDetailMgrParentStaticMethod(
				data.detailMgr,
				'onDocumentRemovedHandler',
				[removedIds, tree, record, data.m]
			);
		}.bind(this));
	},
	_callDetailMgrParentStaticMethod: function (detailMgrClsssName, staticMethodName, args) {
		Ext.require(
			[detailMgrClsssName],
			function () {
				var detailMgrClassDefinition = App.instance.helpers.getClassDefinitionByFullName(detailMgrClsssName),
					detailMgrParentClassDefinition = detailMgrClassDefinition.superclass.self,
					staticMethod = detailMgrParentClassDefinition[staticMethodName];
				staticMethod.apply(detailMgrParentClassDefinition, args);
			}.bind(this)
		);
	}
});
