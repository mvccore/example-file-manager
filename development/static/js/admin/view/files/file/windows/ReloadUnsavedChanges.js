Ext.define('App.view.files.file.windows.ReloadUnsavedChanges', {
	extend: 'Ext.window.MessageBox',
	modal: true,
	border: false,
	closable: false,
	msgButtons: {
		ok: { text: t('OK') },
		cancel: { text: t('Cancel') }
	},
	title: t('File reaload'),
	message: [
		t("There are unsaved changes in tab: '{0}'."),
		t("All changed data in this tab will be lost."),
		t("Do you realy want to continue?")
	].join('<br />'),
	_callback: Function.EMPTY,
	_title: '',
	constructor: function (cfg) {
		this._callback = cfg.callback;
		this._title = cfg.title;
		this.callParent();
	},
	confirm: function () {
		this.callParent([
			t(this.title),
			String.format(this.message, this._title),
			this._callback
		]);
	}
});
