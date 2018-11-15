Ext.define('App.view.layout.accordiontree.Tree', {
	extend: 'Ext.tree.Panel',
	requires: [
        'Ext.tree.*',
        'Ext.data.*',
        'App.view.layout.accordiontree.TreePagingToolbar',
        'App.view.layout.accordiontree.TreeViewWithPaging'
	],
	statics: {
		ITEMS_PER_PAGE: Settings.TREE.ITEMS_PER_PAGE
	},
	layout: 'fit',
	rootVisible: false,
    autoScroll: true,
    border: false,
    forceFit: true,
    bodyBorder: false,
	manageHeight: true,
	viewConfig: {
		plugins: {
			ptype: 'treeviewdragdrop',
			containerScroll: true
		},
		listeners: {
			nodedragover: function (targetNode, position, dragData, e, eOpts) {
				var node = dragData.records[0];
				// check for permission
				try {
					return true;
					// if (node.data.permissions.settings) return true;
				} catch (e) {
					console.log(e);
				}
				return false;
			}
		},
		xtype: 'accordiontreeview'
	}
});
