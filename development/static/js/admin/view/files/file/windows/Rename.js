Ext.define('App.view.files.file.windows.Rename', {
	extend: 'Ext.window.MessageBox',
	title: t('Rename a file'),
	message: t('Please enter a new file name'),
	prompt: function () {
		var initialConfig = this.initialConfig,
			lang = initialConfig.lang,
			controller = initialConfig.$$controller,
			oldKey = initialConfig.oldKey;
		this.callParent([
			this.title,
			this.message,
			function (okOrCancel, newKey) {
				controller.onItemRenameWindowHandler(lang, okOrCancel, newKey);
			},
			this,
			false, // multiline
			oldKey
		]);
	}
});
