// store to use it for versions tab or children tab in the future:
Ext.define('App.store.files.Directory', {
	extend: 'Ext.data.Store',
	model: 'App.model.files.Directory',
	proxy: {
		type: 'ajax',
		$configStrict: false,
		afterRequest: function (request, success) {
			this.fireEvent('afterload', this, request, success);
			return;
		},
		reader: {
			type: 'json',
			rootProperty: 'data',
			successProperty: 'success',
			messageProperty: 'message'
		},
		/*api: {
			create: '/admin/documents/create',
			read: '/admin/documents/read',
			update: '/admin/documents/update',
			destroy: '/admin/documents/delete',
		},*/
		// noCache: false, //to remove param "_dc"
		pageParam: false,
		startParam: false,
		limitParam: false
	},
	autoLoad: false,
	autoSync: false,
	listeners: {
		/*beforeload: function (store, operation, eOpts) {
			var data = operation.config.scope.data;
			operation.setParams({
				path: data.path,
				//module: data.m
			});
			return true;
		}*/
	}
});
