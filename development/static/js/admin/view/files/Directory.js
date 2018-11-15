Ext.define('App.view.files.Directory', {
	extend: 'App.view.files.Base',
	alias: 'widget.files-file',
	requires: [
		'App.view.layout.Tab',
        'App.view.files.directory.Toolbar',
		//'App.view.files.forms.Wysiwyg',
		//'App.view.files.forms.Code',
		//'App.view.files.forms.Properties'
	],
	onParentAddressesChanged: function (newAddresses) {
		this.tabPanels.seo.onParentAddressesChanged(newAddresses);
	},
	onReloaded: function (data) {
		var tp = this.tabPanels;
		tp.content.reinitValues(data);
		tp.properties.reinitValues(data);
		this.callParent(arguments);
	},
	onSaved: function (data) {
		var tp = this.tabPanels;
		tp.properties.reinitValues(data);
		this.callParent(arguments);
	},
	$buildTabPanels: function (data) {
		var tabPanelCfg = {
			data: data,
			$$view: this
		}
		this.mainToolbar = Ext.create('App.view.files.directory.Toolbar', {
			data: data,
			$$view: this,
			region: 'north'
		});
		/*var type = data.common.type;
		var contentClass = 'App.view.files.forms.Text';
		this.tabPanels = {
			content		: Ext.create(contentClass, tabPanelCfg),
			properties	: Ext.create('App.view.files.forms.Properties', tabPanelCfg)
		};*/
		this.tabPanel = Ext.create('Ext.tab.Panel', {
			region: 'center',
			items: [
				//this.tabPanels.content,
				//this.tabPanels.properties
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
		submitResult = this.callParent([submitResult]);
		return submitResult;
	}
});
