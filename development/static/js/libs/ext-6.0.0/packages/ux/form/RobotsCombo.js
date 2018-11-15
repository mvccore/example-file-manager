Ext.define('Ext.ux.form.RobotsCombo', {
	extend: 'Ext.ux.form.CheckCombo',
	requires: [
		'Ext.form.field.ComboBox'
	],
	alias: 'widget.robotscombo',
	listConfig: {
		getInnerTpl: function () {
			return '<div class="x-combo-list-item x-robots-combo-list-item">' +
				'<span class="x-check-combo"></span>'+
				'<span class="value">{value}</span>' +
				'<span class="description">{translated}</span>' +
				'<span class="robots">{robots}</span>'+
			'</div>';
		}
	},
	triggerAction: 'all',
	store: Ext.create('Ext.data.JsonStore', {
		fields: ['value'],
		data: [
			{ value: "default", description: "Default for current website.", robots: "" },
			{ value: "index", description: "Allows the robot to index the page", robots: "All" },
			{ value: "follow", description: "Allows the robot to follow the links on the page", robots: "All" },
			{ value: "noindex", description: "Prevents the robot from indexing the page", robots: "All" },
			{ value: "nofollow", description: "Prevents the robot from following the links on the page", robots: "All" },
			{ value: "noodp", description: "Prevents the usage of the Open Directory Project description, if any, as the description of the page in the search engine results page", robots: "Google, Yahoo, Bing" },
			{ value: "noarchive", description: "Prevents the search engine from caching the content of the page", robots: "All" },
			{ value: "nosnippet", description: "Prevents the display of any description of the page in the search engine results page", robots: "Google" },
			{ value: "noimageindex", description: "Prevents this page from appearing as the referring page of an indexed image", robots: "Google" },
			{ value: "noydir", description: "Prevents the usage of the Yahoo Directory description, if any, as the description of the page in the search engine results page", robots: "Yahoo" },
			{ value: "nocache", description: "Synonym of noarchive", robots: "Bing" }
		]
	}),
	queryMode: 'local',
	valueField: 'value',
	displayField: 'value',
	_translator: function (key) { return key; },
	_storeValueKeys: {},
	_orderedValue: [],
	initComponent: function () {
		var valuesArr = [];
		if (typeof(this.initialConfig.translator) != 'undefined') {
			this._translator = this.initialConfig.translator;
		}
		this.store.each(function (record) {
			var data = record.data;
			data.translated = this._translator(data.description);
			this._storeValueKeys[data.value] = true;
		}, this);
		if (typeof (this.initialConfig.value) != 'undefined') {
			if (typeof (this.initialConfig.value) == 'string') {
				valuesArr = String().trim(this.initialConfig.value).split(', ');
			} else {
				valuesArr = this.initialConfig.value;
			}
			valuesArr = this._filterLogicSelectionOnSelect(valuesArr);
			valuesArr = this._orderValues(valuesArr);
			this.setValue(valuesArr);
		}
		this.on('beforeselect', this._beforeSelectHandler.bind(this));
		this.on('beforedeselect', this._beforeDeselectHandler.bind(this));
		this.on('select', this._selectHandler.bind(this));
		this.callParent(arguments);
	},
	_beforeSelectHandler: function (combo, record, index, eOpts) {
		var valuesStr = String(combo.getRawValue()).trim();
		var valuesArr = valuesStr == '' ? [] : valuesStr.split(', ');
		if (record.data.value == 'default') {
			valuesArr = ['default'];
		} else {
			valuesArr.push(record.data.value);
		}
		valuesArr = this._filterLogicSelectionOnSelect(valuesArr, record.data.value);
		this._orderedValue = this._orderValues(valuesArr);
		return true;
	},
	_beforeDeselectHandler: function (combo, record, index, eOpts) {
		var valuesStr = String(combo.getRawValue()).trim();
		var valuesArr = valuesStr == '' ? [] : valuesStr.split(', ');
		var valuesArrRecPos = 0;
		if (valuesStr != 'default') {
			valuesArrRecPos = valuesArr.indexOf(record.data.value);
			if (valuesArrRecPos > -1) valuesArr.splice(valuesArrRecPos, 1);
		}
		valuesArr = this._filterLogicSelectionOnDeselect(valuesArr, record.data.value);
		this._orderedValue = this._orderValues(valuesArr);
		if (this._orderedValue.length == 1 && this._orderedValue[0] == 'default') {
			this._selectHandler(combo, record, eOpts);
			return false;
		}
		return true;
	},
	_selectHandler: function (combo, record, eOpts) {
		combo.suspendEvents(true);
		combo.setValue(this._orderedValue);
		combo.resumeEvents(false);
	},
	_filterLogicSelectionOnSelect: function (arr, clicked) {
		var result = [], keys = {},
			key = '', i = 0, l = 0;
		for (i = 0, l = arr.length; i < l; i += 1) {
			keys[arr[i]] = true;
		}
		// remove opposite to index or noindex
		if (clicked == 'index' && keys.noindex) delete keys.noindex;
		if (clicked == 'noindex' && keys.index) delete keys.index;
		// remove opposite to follow or nofollow
		if (clicked == 'follow' && keys.nofollow) delete keys.nofollow;
		if (clicked == 'nofollow' && keys.follow) delete keys.follow;
		// default
		if (keys.default && arr.length > 1) delete keys.default;
		// complete result array type
		for (key in keys) result.push(key);
		return result;
	},
	_filterLogicSelectionOnDeselect: function (arr, clicked) {
		var result = [], keys = {},
			key = '', i = 0, l = 0;
		for (i = 0, l = arr.length; i < l; i += 1) {
			keys[arr[i]] = true;
		}
		// delete default if there are also other items
		if (keys.default && arr.length > 1) delete keys.default;
		// complete result array type
		for (key in keys) result.push(key);
		// set default if empty
		if (result.length === 0) result = ["default"];
		return result;
	},
	_orderValues: function (arr) {
		var result = [], keys = {},
			key = '', i = 0, l = 0;
		for (i = 0, l = arr.length; i < l; i += 1) {
			keys[arr[i]] = true;
		}
		for (key in this._storeValueKeys) {
			if (keys[key]) {
				result.push(key);
			}
		}
		return result;
	},
	setValue: function (val) {
		var arr = [], str = '';
		if (typeof (val) == 'string') {
			str = String(val).trim();
			if (/[a-z],[a-z]/g.test(str)) {
				str = str.replace(/([a-z]),([a-z])/g, '$1, $2');
			}
			arr = str == '' ? [] : str.split(', ');
		} else {
			arr = val;
		}
		if (arr.length === 0) arr = ['default'];
		this.callParent([arr]);
	},
	getValue: function () {
		return String(this.getRawValue()).trim();
	}
})