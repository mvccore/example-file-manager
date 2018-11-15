Ext.define('App.view.files.file.forms.Base', {
	extend: 'Ext.form.Panel',
	scrollable: true,
	bodyPadding: 15,
	border: false,
	defaults: {
		xtype: 'textfield',
		labelWidth: 200,
		width: 800
	},
	/*initComponent: function () {
		if (this.initialConfig.lang && !this.initialConfig.iconCls) {
			this.iconCls = 'tab-icon-lang lang-icon-' + this.initialConfig.lang;
		}
		this.callParent();
	},*/
	initValues: function (data) {
		this.setValues(data);
		this.initAllFieldsChangeEvents();
	},
	reinitValues: function (data) {
		this.setValues(data);
	},
	setValues: function (data) {
		this.getForm().setValues(data);
	},
	submitValues: function () {
		var form = this.getForm(),
			success = form.isValid(),
			data = form.getFieldValues(),
			errors = {};
		if (!success) {
			form.getFields().each(function (item, index, len) {
				var fieldLabel = item.initialConfig.fieldLabel,
					fieldValue = item.getValue(),
					fieldKey = typeof (fieldLabel) == 'string' ? fieldLabel : item.getName();
				if (!item.isValid()) {
					errors[fieldKey] = item.getErrors(fieldValue);
				}
			});
		}
		return {
			success: success,
			data: data,
			errors: errors
		}
	},
	initAllFieldsChangeEvents: function () {
		var allFields = this.getForm().getFields();
		allFields.each(function(item, i, length){
			item.on('change', this.setTabChanged.bind(this, true));
		}, this);
	},
	setTabChanged: function (changed) {
		this.initialConfig.$$view.setTabChanged(changed);
	}
});
