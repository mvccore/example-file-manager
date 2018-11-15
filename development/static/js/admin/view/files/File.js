Ext.define('App.view.files.File', {
	extend: 'App.view.files.Base',
	alias: 'widget.files-file',
	requires: [
		'App.view.layout.Tab',
        'App.view.files.file.Toolbar',
		'App.view.files.file.forms.Base',
		'App.view.files.file.forms.Text',
		//'App.view.files.file.forms.Wysiwyg',
		//'App.view.files.file.forms.Code',
		'App.view.files.file.forms.Properties'
	],
	onParentAddressesChanged: function (newAddresses) {
		this.tabPanels.seo.onParentAddressesChanged(newAddresses);
	},
	content: null,
	onData: function (data) {
		this.content = data.common.content;
		this.callParent(arguments);
	},
	onReloaded: function (data) {
		var tp = this.tabPanels;
		this.content = data.common.content;
		tp.content.reinitValues(data);
		tp.properties.reinitValues(data);
		this.callParent(arguments);
	},
	onSaved: function (data) {
		var tp = this.tabPanels;
		if (isset(data, 'common.content'))
			this.content = data.common.content;
		tp.properties.reinitValues(data);
		this.callParent(arguments);
	},
	$buildTabPanels: function (data) {
		var tabPanelCfg = {
			data: data,
			$$view: this
		}
		this.mainToolbar = Ext.create('App.view.files.file.Toolbar', {
			data: data,
			$$view: this,
			region: 'north'
		});
		var type = data.common.type;
		var contentClass = 'App.view.files.file.forms.Text';
		/*var specialContentTypesAndClasses = {
			'text': 'App.view.files.file.forms.Wysiwyg',
			'code': 'App.view.files.file.forms.Code',
		};
		if (specialContentTypesAndClasses[type]) 
			contentClass = specialContentTypesAndClasses[type];*/
		this.tabPanels = {
			content		: Ext.create(contentClass, tabPanelCfg),
			properties	: Ext.create('App.view.files.file.forms.Properties', tabPanelCfg)
		};
		this.tabPanel = Ext.create('Ext.tab.Panel', {
			region: 'center',
			items: [
				this.tabPanels.content,
				this.tabPanels.properties
			]
		});
		this.add([
			this.mainToolbar,
			this.tabPanel
		]);
	},
	$initValues: function (data) {
		var tp = this.tabPanels;
		tp.content.initValues(data);
		tp.properties.initValues(data);
		this.mainToolbar.initValues(data);
	},
	submitValues: function () {
		var commonPanels = ['content', 'properties'],
			i = 0, l = 0,
			submitResult = this.$submitValuesCompleteEmptyResult();
		for (i = 0, l = commonPanels.length; i < l; i += 1) {
			submitResult = this.$submitValuesProcessCommonTab(commonPanels[i], submitResult);
		}
		var newContent = submitResult.data.common.content;
		if (newContent.length === this.content.length && newContent === this.content) 
			delete submitResult.data.common.content;
		submitResult = this.callParent([submitResult]);
		return submitResult;
	}
});
