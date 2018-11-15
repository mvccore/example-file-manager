Ext.define('App.view.layout.SidePanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.sidepanel',
	/*requires: [
        'App.view.layout.MainSearch',
        'App.view.layout.Accordion',
        'App.view.layout.AccordionItem',
        'App.view.layout.accordiontree.Tree',
        'App.view.layout.accordiontree.TreePagingToolbar',
        'App.view.layout.accordiontree.TreeViewWithPaging'
	],*/
	layout: 'border',
	cls: "side-panel",
	width: 300,
	minWidth: 100,
	maxWidth: 500,
	collapsible: true,  // kliknutí pro schování
	split: true,        // natahování myší
	animCollapse: false,
	border: false,
	header: true
});

