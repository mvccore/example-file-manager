Ext.define('Ext.ux.form.CheckCombo', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.checkcombo',
	multiSelect: true,
	forceSelection: true,
	editable: false,
	listConfig : {          
		getInnerTpl : function() {
			return '<div class="x-combo-list-item"><span class="x-check-combo"></span>{value}</div>';
		}
	},
	/*
	triggerAction: 'all',
	store: Ext.create('Ext.data.JsonStore', {
		fields: ['key', 'value'],
		data: [
			{ key: "item-1", value: "Item 1" },
			{ key: "item-2", value: "Item 2" }
		]
	}),
	queryMode: 'local',
	valueField: 'key',
	displayField: 'value',
	*/
})