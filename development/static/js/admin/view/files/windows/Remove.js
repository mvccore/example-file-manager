Ext.define('App.view.files.windows.Remove', {
	extend: 'Ext.window.MessageBox',
	modal: true,
	border: false,
	closable: false,
	msgButtons: {
		ok: { text: 'OK' },
		cancel: { text: 'Cancel' }
	},
	// properties title and message will be defined in extended class
	//title: '',
	//message: '', 
	_callback: Function.EMPTY,
	_type: '',
	constructor: function (cfg) {
		this._callback = cfg.callback;
		this._type = cfg.type;
		this.callParent();
	},
	confirm: function () {
		this.callParent([
			this.title,
			this.message,
			this._callback,
			this
		]);
	}
});
