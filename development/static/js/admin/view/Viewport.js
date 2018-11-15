Ext.define('App.view.Viewport', {
	extend: 'Ext.container.Viewport',
	requires: [
        'App.view.layout.SidePanel',
        'App.view.layout.MainSearch',
        'App.view.layout.Accordion',
        'App.view.layout.AccordionItem',
        'App.view.layout.accordiontree.Tree',
        'App.view.layout.accordiontree.TreePagingToolbar',
        'App.view.layout.accordiontree.TreeViewWithPaging',
		'Ext.ux.TabCloseMenu',
	],
	layout: 'fit',
	sidePanelLeft: null,
	sidePanelRight: null,
	mainTabs: null,
	mainTabsCloseMenu: null,
	mainTabsCloseMenuClick: false,
	initComponent: function () {
		this._initSidePanelLeft();
		this._initMainTabs();
		this._initSidePanelRight();

		this.items = [{
			xtype: "panel",
			cls: "admin-body",
			layout: "border",
			border: false,
			items: [
				this.sidePanelLeft,
				this.mainTabs,
				this.sidePanelRight
			]
		}];

		this.callParent();
	},
	_initSidePanelLeft: function () {
		this.sidePanelLeft = Ext.create("App.view.layout.SidePanel", {
			region: 'west',
			items: [/*{
				xtype: 'mainsearch',
				region: 'north',
				height: 60
			},*/{
				xtype: 'accordion',
				id: "left-accordion",
				region: 'center'
			}]
		});
	},
	_initSidePanelRight: function () {
		this.sidePanelRight = Ext.create("App.view.layout.SidePanel", {
			region: 'east',
			hidden: true,
			items: [{
				xtype: 'accordion',
				id: "right-accordion",
				region: 'center'
			}]
		});
	},
	_initMainTabs: function () {
		this._initMainTabsCloseMenu();

		this.mainTabs = Ext.create("Ext.tab.Panel", {
			cls: 'main-tabs',
			region: 'center',
			border: false,
			plugins: [
				this.mainTabsCloseMenu
                // Ext.create('Ext.ux.TabReorderer', {})
			],
			listeners: {
				beforeremove: function (mainTabs, tabPanel, event)
				{
					var result = true;
					var plugin = mainTabs.getPlugin("tabclosemenu");
					var tabChanged = false;
					if (plugin.item && plugin.item.$$controller) {
						tabChanged = plugin.item.$$controller.getTabChanged();
					}
					if (tabChanged) result = false;
					return result;
				},
				remove: function (mainTabs, tabPanel, eOpts)
				{
					if (this.mainTabsCloseMenuClick) return;
					// remove tab controller also internally - remove class instance and fix document.hash
					var plugin = this.mainTabs.getPlugin("tabclosemenu");
					var ctrlInstance = function () { };
					if (plugin.item && plugin.item.$$controller) {
						ctrlInstance = plugin.item.$$controller;
						ctrlInstance.onClose(tabPanel, eOpts);
						Ext.destroy(ctrlInstance);
					}
				}.bind(this)
			}
		});
	},
	_initMainTabsCloseMenu: function () {
		this.mainTabsCloseMenu = Ext.create('Ext.ux.TabCloseMenu', {
			pluginId: 'tabclosemenu',
			showCloseAll: false,
			showCloseOthers: false,
			extraItemsTail: [{
				text: t('Close others'),
				iconCls: "",
				handler: function (menuItem, event) {
					this.mainTabsCloseMenuClick = true;
					var plugin = this.mainTabs.getPlugin("tabclosemenu");
					App.instance.getController('layout.Main').closeAllOtherTabs(plugin.item.$$controller);
					this.mainTabsCloseMenuClick = false;
				}.bind(this)
			}, {
				text: t('Close unmodified'),
				iconCls: "",
				handler: function (menuItem) {
					this.mainTabsCloseMenuClick = true;
					App.instance.getController('layout.Main').closeAllUnmodifiedTabs();
					this.mainTabsCloseMenuClick = false;
				}.bind(this)
			}]
		});
	}
});
