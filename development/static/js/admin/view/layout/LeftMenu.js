Ext.define('App.view.layout.LeftMenu', {
	eextend: 'Ext.menu.Menu',

	initComponent: function () {
		this.items = [{
			xtype: 'menuitem',
			title: 'text menu item',
			handler: function () {
				console.log('item clicked', arguments);
			}
		}];
		this.callParent();
	}
});

