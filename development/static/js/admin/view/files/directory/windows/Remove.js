Ext.define('App.view.files.directory.windows.Remove', {
	extend: 'App.view.files.windows.Remove',
	title: t('Remove directory and containing files'),
	message: t('Do you really remove this directory and all containing files? Whole directory and it\'s files will be removed permanently! Moving into Recycle Bin is not implemented in this file manager.')
});
