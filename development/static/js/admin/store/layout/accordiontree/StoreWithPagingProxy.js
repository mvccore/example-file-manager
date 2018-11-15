Ext.define('App.store.layout.accordiontree.StoreWithPagingProxy', {
	extend: 'Ext.data.proxy.Ajax',
	requires: [
		'App.view.layout.accordiontree.Tree'
	],
	// url: '', // url is assigned dynamicly from Main controller
	// noCache: false, //to remove param "_dc"
	reader: {
		type: 'json',
		totalProperty: 'total',
		rootProperty: 'nodes',
		successProperty: 'success'
	},
	extraParams: {
		limit: App.view.layout.accordiontree.Tree.ITEMS_PER_PAGE,
		offset: 0
	}
});
