Ext.define('App.controller.layout.TreeMgr', {
	extend: 'Ext.app.Controller',
	$layoutController: null,
	$treeData: {},
	$eventArgs: {},
	init: function (layoutController, treeData) {
		this.$layoutController = layoutController;
		this.$treeData = treeData;
		this.initModel();
		this.$initEvents();
		this.callParent();
	},
	initModel: function () {/* rewrited in extended class */ },
	/*onLaunch: function () {
		this.callParent();
	},*/
	destroy: function () {
		Ext.tip.QuickTipManager.enable();
		this.destroyView();
		delete this.$layoutController.treeControllers[this.$treeData.id];
		this.callParent();
	},
	destroyView: function () {
		if (this.$$view) {
			Ext.destroy(this.$$view);
			delete this.$$view;
		}
	},
	$initEvents: function () {
		this.on('itemcontextmenu', function (tree, record, item, index, e, eOpts, treeListeners) {
			Ext.tip.QuickTipManager.disable();
			this.$eventArgs = {
				tree: tree,
				record: record,
				item: item,
				index: index,
				e: e,
				eOpts: eOpts,
				treeListeners: treeListeners
			};
			return this.onItemContextMenu();
		}, this);
		this.on('beforeitemmove', function (node, oldParent, newParent, index, eOpts, treeListeners) {
			this.$eventArgs = {
				tree: node.getOwnerTree(),
				node: node,
				oldParent: oldParent,
				newParent: newParent,
				index: index,
				eOpts: eOpts,
				treeListeners: treeListeners
			};
			var beforeMoveResult = this.onBeforeItemMove();
			if (!beforeMoveResult) this.destroy();
			return beforeMoveResult;
		}, this);
		this.on('itemmove', function (node, oldParent, newParent, index, eOpts) {
			this.$eventArgs = {
				tree: node.getOwnerTree(),
				node: node,
				oldParent: oldParent,
				newParent: newParent,
				index: index,
				eOpts: eOpts
			};
			return this.onItemMove();
		}, this);
	},
	$checkIfKeyExistInLevel: function (parentNode, key, id, renaming) {
		var success = true,
			parentChilds = parentNode.childNodes,
			childData = {};
		if (renaming) key = App.instance.helpers.getValidFileName(key, false, Function.EMPTY); // if renaming is false - then there is moving only
		for (var i = 0, l = parentChilds.length; i < l; i += 1) {
			childData = parentChilds[i].data;
			if (childData.text == key && (id.length === 0 || (id.length > 0 && childData.id != id))) {
				Ext.MessageBox.alert(
					t('Edit address'),
                    t('The last document address part is already in use in this level, please change last document address part or move document to different place.')
				);
				success = false;
			}
		}
		return {
			success: success,
			key: key
		}
	},
	$isKeyAllowed: function (parentNodeId, key) {
		var disallowedKeys = {
			admin: true,
			install: true,
			api: true,
			webservice: true, 
			plugin: true
		};
		if (parentNodeId === 1) {
			if (disallowedKeys[key]) {
				return {
					success: false,
					message: t('Document address is not allowed.')
				};
			}
		}
		return {
			success: true,
			message: ''
		};
	},
	$refreshTreeNode: function (record, callback) {
		var ownerTree = record.getOwnerTree();
		record.data.expanded = true;
		ownerTree.getStore().load({
			node: record,
			callback: callback
		});
	}
});
