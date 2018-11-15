Ext.define('App.view.files.file.forms.Text', {
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
	initValues: function (data) {
		this.setValues(data.common);
		this.setIconCls(this.getIconCls() + ' ' + data.system.treeNodeCls);
		// run this after all stores are loaded
		this.initAllFieldsChangeEvents();
	},
	reinitValues: function (data) {
		this.setValues(data.common);
	},
	initComponent: function () {
		var verticalLinePos = Settings.EDITOR.VERTICAL_LINE_POSITION;
		var fieldStyle = 'background-position-x:calc((' + verticalLinePos + 'ex * 1.122) + 5px);';
		this.textarea = Ext.create('Ext.form.field.TextArea', {
			name: 'content',
			scrollable: true,
			bodyPadding: 0,
			border: false,
			layout: 'fit',
			cls: 'text-editor-textarea-wrapper',
			fieldStyle: fieldStyle,
			listeners: {
				keydown: function (textarea, e, eOpts) {
					var r = true,
						activeTabCtrl;
					if (e.keyCode == 17)
						ctrl = true;
					if (ctrl && e.keyCode == 83) {
						e.preventDefault();
						activeTabCtrl = App.instance.getController('layout.Main').getActiveTabController();
						if (activeTabCtrl) {
							activeTabCtrl.handlerSave();
						}
						r = false;
					}
					if (e.keyCode != 17)
						ctrl = false;
					return r;
				}
			}
		});
		this.items = [this.textarea];
		this.callParent();
	}
});
