Ext.define('App.view.files.file.forms.Properties', {
	extend: 'App.view.files.file.forms.Base',
	title: t('Properties'),
	iconCls: 'tab-icon-settings fa',
	defaults: {
		xtype: 'textfield',
		labelWidth: 200,
		width: 800
	},
	initValues: function (data) {
		if (data.system.type !== 'text' && data.system.type !== 'code') 
			this.encodingFile.setHidden(true);
		this.setValues(data.common);
		// run this after all stores are loaded
		this.initAllFieldsChangeEvents();
	},
	reinitValues: function (data) {
		this.setValues(data.common);
	},
	initComponent: function () {
		this.items = [];
		var windowsPlatform = Settings.PLATFORM == 'win';
		if (windowsPlatform && Settings.SYSTEM_CALLS) {
			this.items.push({
				xtype: 'checkbox',
				fieldLabel: t('Archive'),
				name: 'archive'
			});
			this.items.push({
				xtype: 'checkbox',
				fieldLabel: t('Read Only'),
				name: 'readOnly'
			});
			this.items.push({
				xtype: 'checkbox',
				fieldLabel: t('Hidden'),
				name: 'hidden'
			});
			this.items.push({
				xtype: 'checkbox',
				fieldLabel: t('System'),
				name: 'system'
			});
		} else if (Settings.SYSTEM_CALLS || Settings.CHMOD) {
			this.items.push({
				xtype: 'textfield',
				fieldLabel: t('Attributes'),
				name: 'attrs',
				allowBlank: true
			});
		}
		this.items.push({
			xtype: 'textfield',
			fieldLabel: t('Filename'),
			name: 'baseName',
			allowBlank: false
		});
		this.items.push({
			xtype: 'textfield',
			fieldLabel: t('Directory'),
			name: 'dirPath',
			allowBlank: false
		});
		this.encodingFile = Ext.create('Ext.form.field.Text', {
			xtype: 'textfield',
			fieldLabel: t('Encoding'),
			name: 'encoding'
		});
		this.items.push(this.encodingFile);
		this.items.push({
			xtype: 'textfield',
			fieldLabel: t('Size'),
			name: 'size',
			readOnly: true
		});
		this.items.push({
			xtype: 'textfield',
			fieldLabel: t('Mime Type'),
			name: 'mimeType',
			readOnly: true
		});
		if (windowsPlatform) {
			this.items.push({
				xtype: 'textfield',
				fieldLabel: t('Created'),
				name: 'timeCreation',
				readOnly: true
			});
		}
		this.items.push({
			xtype: 'textfield',
			fieldLabel: t('Last Change'),
			name: 'timeLastChange',
			readOnly: true
		});
		this.items.push({
			xtype: 'textfield',
			fieldLabel: t('Last Access'),
			name: 'timeLastAccess',
			readOnly: true
		});
		this.callParent();
	}
});
