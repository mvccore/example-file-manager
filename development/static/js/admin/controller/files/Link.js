Ext.define('App.controller.files.Link', {
	extend: 'App.controller.files.Base',
	requires: [
		'App.controller.layout.Tab',
		'App.model.files.Base',
		'App.store.files.Base'
	],
	views: [
		'App.view.files.Link',
		'App.view.files.windows.Remove',
		'App.view.files.windows.ReloadUnsavedChanges'
	],
	models: ['App.model.files.Base'],
	$getModelTitleRecord: function () {
		return this.model.data.common.baseName;
		//return this.model.getBestMatchLocalizedDataForAdmin().NavigationTitle;
	}
});
