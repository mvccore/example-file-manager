Ext.define('App.view.layout.ContextMenu', {
	extend: 'Ext.menu.Menu',
	initComponent: function () {
		this.items = this.completeFocusHandlersForMenuItems(this.items);
		this.callParent();
	},
	completeFocusHandlersForMenuItems: function (items) {
		var item = {},
			handler = function () { };
		for (var i = 0, l = items.length; i < l; i += 1) {
			item = items[i];
			item.hideOnClick = false;
			if (item.handler) {
				item.listeners = this._completeFocusHandlersForMenuItemClick(item.handler);
				delete item.handler;
			}
			if (item.menu && item.menu.length > 0) {
				item.menu = this.completeFocusHandlersForMenuItems(item.menu);
			}
		}
		return items;
	},
	_completeFocusHandlersForMenuItemClick: function (handler) {
		return {
			click: function (item, e, eOpts) {
				handler(item, eOpts);
				this.$$controller.destroy();
			}.bind(this)
		};
	}
});