Ext.Loader.setConfig({
	enabled: true,
	disableCaching: !Settings.DEBUG
});

Ext.Loader.setPath('App.lib', 'static/js/admin/lib');
Ext.Loader.setPath('Ext.ux', 'static/js/libs/ext-6.0.0/packages/ux');

Ext.application({
	name: 'App',
	appProperty: 'instance',
	autoCreateViewport: true,
	appFolder: 'static/js/admin',
	requires: [
		'App.lib.Translator',
		'App.lib.Configuration',
		'App.lib.Helpers',
		'Ext.ux.TabCloseMenu'
	],
	controllers: ['layout.Main'],
	launch: function () {
		var app = App.instance;
		app.configuration = Ext.create('App.lib.Configuration');
		app.errorLoger = new Module();
		app.helpers = Ext.create('App.lib.Helpers')
			.initAjaxCommonStates()
			.initWindowBeforeUnload()
			.initSystemKeyStrokes();
	}
});
