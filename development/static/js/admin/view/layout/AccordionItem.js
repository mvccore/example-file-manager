Ext.define('App.view.layout.AccordionItem', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.accordionitem',
	requires: [
        'App.view.layout.accordiontree.Tree',
        'App.view.layout.accordiontree.TreePagingToolbar',
        'App.view.layout.accordiontree.TreeViewWithPaging'
	],
	layout: 'fit',
	scrollable: false, // tree panel has to be scrollable
	tools: [{
		type: "right",
		handler: function (extMouseEvent, btnDomElm, toolOwner, tool) {
			this.up('accordion').toRight(toolOwner);
		}
	}, {
		type: "left",
		handler: function (extMouseEvent, btnDomElm, toolOwner, tool) {
			this.up('accordion').toLeft(toolOwner);
		},
		hidden: true
	}]
});
