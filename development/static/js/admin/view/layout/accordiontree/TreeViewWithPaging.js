Ext.define('App.view.layout.accordiontree.TreeViewWithPaging', {
	extend: 'Ext.tree.View',
	alias: 'widget.accordiontreeview',
	requires: [
		'App.view.layout.accordiontree.TreePagingToolbar'
	],
	listeners: {
		refresh: function () {
			this.updatePaging();
		}
	},
	queue: {},
	renderRow: function (record, rowIdx, out) {
		var me = this;
		if (record.needsPaging) {
			me.queue[record.id] = record;
		}
		me.superclass.renderRow.call(this, record, rowIdx, out);
		if (record.needsPaging && typeof record.ptp == 'undefined') {
			this.doUpdatePaging(record);
		}
		this.fireEvent('itemafterrender', record, rowIdx, out);
	},
	doUpdatePaging: function (node) {
		console.log("create toolbar for " + node.id + " " + node.data.expanded);
		if (node.data.expanded) {
			node.ptb = ptb = Ext.create('App.view.layout.accordiontree.TreePagingToolbar', {
				node: node,
				width: 170
			});
			node.ptb.node = node;
			var tree = node.getOwnerTree();
			var view = tree.getView();
			var nodeEl = Ext.fly(view.getNodeByRecord(node));
			if (!nodeEl) {
				//console.log("Could not resolve node " + node.id);
				return;
			}
			nodeEl = nodeEl.getFirstChild();
			nodeEl = nodeEl.query('.x-tree-node-text');
			nodeEl = nodeEl[0];
			var el = nodeEl;
			//el.addCls('x-grid-header-inner');
			el = Ext.DomHelper.insertAfter(el, {
				tag: 'span',
				'class': 'tree-paging-toolbar'
			}, true);
			el.addListener('click', function (e) {
				e.stopEvent();
			});
			ptb.render(el);
			tree.updateLayout();
		}
	},
	updatePaging: function () {
		var me = this;
		var queue = me.queue;
		var names = Object.getOwnPropertyNames(queue);
		for (i = 0, l = names.length; i < l; i += 1) {
			var node = queue[names[i]];
			this.doUpdatePaging(node);
		}
		me.queue = {};
	}
});
