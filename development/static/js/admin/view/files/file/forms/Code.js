Ext.define('App.view.files.file.forms.Code', {
	extend: 'App.view.files.file.forms.Base',
	requires: [
		'Ext.ux.form.Wysiwyg',
		'Ext.ux.form.ckeditor.ckeditor'
	],
	title: t('Content'),
	iconCls: 'tab-icon-content fa',
	layout: 'fit',
	scrollable: false,
	bodyPadding: 0,
	border: false,
	listeners: {
		resize: function (form, width, height, oldWidth, oldHeight, eOpts) {
			form.wysiwyg.resize(width, height - 104, true);
		}.bind(this)
	},
	initValues: function (data) {
		this.setValues(data.common);
		// run this after all stores are loaded
		this.initAllFieldsChangeEvents();
	},
	initComponent: function () {
		this.wysiwyg = Ext.create('Ext.ux.form.Wysiwyg', {
			//lang: lang,
			noLabel: true,
			width: '100%',
			height: window.offsetHeight, // to hide wysiwyg bottom panel temporary
			name: 'content',
			noLabel: true,
			config: {
				// http://docs.ckeditor.com/#!/api/CKEDITOR.config
				toolbar: 'Basic',
				bodyClass: 'document',
				startupShowBorders: false
			},
			scrollable: true,
			bodyPadding: 0,
			border: false,
			layout: 'fit',
			listeners: {
				instanceReady: function (instance) {
					var w = instance.window.$,
						ctrl = false;
					w.onkeydown = function (e) {
						var r = true, activeTabCtrl;
						e = e || w.event;
						if (e.keyCode == 17) ctrl = true;
						if (ctrl && e.keyCode == 83) {
							e.preventDefault();
							activeTabCtrl = App.instance.getController('layout.Main').getActiveTabController();
							if (activeTabCtrl) {
								activeTabCtrl.handlerSave();
							}
							r = false;
						}
						if (e.keyCode != 17) ctrl = false;
						return r;
					}
				}.bind(this)
			}
		});
		this.items = [this.wysiwyg];
		this.callParent();
	}
});
