Ext.define('App.controller.layout.LeftMenu', {
	extend: 'Ext.app.Controller',
	// views: ['App.view.layout.LeftMenu'],
	refs: [
        { ref: 'logout', selector: '#admin-menu-logout' }
	],
	config: {
		naviContId: 'admin-navigation',
		naviBaseItemsSel: 'ul li.admin-menu-{0}',
		naviBaseItemsNames: 'file extras marketing settings logout'.split(' ')
	},
	init: function () {
		this.callParent();
	},
	onLaunch: function () {
		this._initEvents();
		this.callParent();
	},
	_initEvents: function () {
		var config = this.config,
			$baseElm = Ext.get(config.naviContId),
			naviBaseItemsSel = config.naviBaseItemsSel,
			naviBaseItemsNames = config.naviBaseItemsNames,
			naviBaseItemName = '',
			handlerName = '',
			$baseItem;
		for (var i = 0, l = naviBaseItemsNames.length; i < l; i += 1) {
			naviBaseItemName = naviBaseItemsNames[i];
			handlerName = '_handler' + naviBaseItemName.substr(0, 1).toUpperCase() + naviBaseItemName.substr(1);
			$baseItem = $baseElm.child(String.format(naviBaseItemsSel, naviBaseItemName));
			$baseItem.on('click', this[handlerName].bind(this));
		}
	},
	_handlerFile: function () {

	},
	_handlerExtras: function () {

	},
	_handlerMarketing: function () {

	},
	_handlerSettings: function () {
		location.href = Settings.URLS.SETTINGS_TEMP;
	},
	_handlerLogout: function () {
		Ext.Ajax.request({
			url: Settings.URLS.LOGOUT,
			method: 'POST',
			success: function (response, conn, options, eOpts) {
				var data = Ext.JSON.decode(response.responseText);
				if (data.success) {
					location.href = data.location;
				}
			}.bind(this)
		});
	}
});