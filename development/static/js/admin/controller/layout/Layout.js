Ext.define('App.controller.layout.Layout', {
	extend: 'Ext.app.Controller',
	requires: [
		//'App.controller.layout.LeftMenu',
		//'App.view.layout.LeftMenu',
        'App.store.layout.accordiontree.StoreWithPaging',
        'App.store.layout.accordiontree.StoreWithPagingProxy'
	],
	stores: ['App.store.layout.MainSearch'],
	models: ['App.model.layout.MainSearch'],
	refs: [
        { ref: 'leftAccordion', selector: 'sidepanel accordion#left-accordion' },
        { ref: 'rightAccordion', selector: 'sidepanel accordion#right-accordion' },
        { ref: 'mainTabs', selector: 'tabpanel[cls=main-tabs]' },
        { ref: 'mainSearch', selector: 'mainsearch combo' }
	],
	/*****************************************************************************************************************/
	DEFAULT_TAB_TITLE: t('Loading')+'&hellip;',
	treesServicesData: [],
	mainNavigationTrees: [],
	treeControllers: {},
	leftMenu: null,
	$hashBrowserChange: false,
	$hashInternalChange: false,
	$creationProcess: false,
	$currentTabIndex: -1,
	/*****************************************************************************************************************/
	onLaunch: function () {
		this.callParent();
	},
	getNavigationTree: function (index) {
		return this.mainNavigationTrees[index];
	},
	/*****************************************************************************************************************/
	$buildLayout: function (callback) {
		//this._requestForAccordionTreeItems(callback);
		//this._createAnddispatchLeftMenuController();

		this.treesServicesData = [{
			title: t('Explorer'),
			serviceUrl: Settings.URLS.TREE
		}];
		this.$buildLayoutNavigationAcordion(0);
		var accordion = this.getLeftAccordion();
		this.$buildLayoutNavigationTree(
			accordion.items.items[0],
			0
		);
		callback.call(this);
	},
	$buildLayoutNavigationAcordion: function (index) {
		var dataItem = this.treesServicesData[index],
    		accordionItem = Ext.create('App.view.layout.AccordionItem', {
    			title: dataItem.title,
    			listeners: {
    				expand: function (accordionPanel, callee) {
    					if (typeof (this.mainNavigationTrees[index]) == 'undefined')
    						this.$buildLayoutNavigationTree(accordionPanel, index);
    				}.bind(this)
    			}
    		});
		this.getLeftAccordion().add(accordionItem);
	},
	$buildLayoutNavigationTree: function (accordionPanel, index) {
		var serviceUrl = this.treesServicesData[index].serviceUrl;
		var treeStore = Ext.create('App.store.layout.accordiontree.StoreWithPaging', {
			// patch different url for each tree store throw proxy object
			proxy: Ext.create('App.store.layout.accordiontree.StoreWithPagingProxy', { url: serviceUrl })
		});
		var navigationTree = Ext.create('App.view.layout.accordiontree.Tree', {
			store: treeStore,
			listeners: {
				/*afterrender: function () {
					this.store.load();
				},*/
				itemcontextmenu: function (tree, record, item, index, e/*, eOpts*/) {
					e.stopEvent();
					var ctrl = this.$createAndPreDispatchTreeMgrController(
						record.data,
						{ createView: true, pageX: e.pageX, pageY: e.pageY }
					);
					return ctrl.fireEventArgs('itemcontextmenu', [].slice.apply(arguments));
				}.bind(this),
				beforeitemmove: function (node/*, oldParent, newParent, index, eOpts*/) {
					var ctrl = this.$createAndPreDispatchTreeMgrController(node.data, { createView: false });
					return ctrl.fireEventArgs('beforeitemmove', [].slice.apply(arguments));
				}.bind(this),
				itemmove: function (node/*, oldParent, newParent, index, eOpts*/) {
					var ctrl = this.$createAndPreDispatchTreeMgrController(node.data, { createView: false });
					return ctrl.fireEventArgs('itemmove', [].slice.apply(arguments));
				}.bind(this),
				beforeitemappend: function (thisNode, newChildNode, index, eOpts) {
					if (thisNode.data && thisNode.id != 'root') Ext.require(thisNode.data.treeMgr);
					if (newChildNode.data && newChildNode.id != 'root') Ext.require(newChildNode.data.treeMgr);
				},
				itemclick: function (treePanel, record, item, index, eventObj, eOptsObj) {
					var nodeData = record.data;
					this.$loadCreateAndDispatchTabController(nodeData.detailMgr, nodeData, function () { });
				}.bind(this)
			}
		});
		this.mainNavigationTrees[index] = navigationTree;
		var navigationTree = accordionPanel.add(navigationTree);
		accordionPanel.tree = navigationTree;
	},
	$createAndPreDispatchTreeMgrController: function (ctrlData, viewConfig) {
		var ctrlClassStr = '',
			viewClassStr = '',
			ctrlInstance, viewInstance;
		if (typeof (this.treeControllers[ctrlData.id]) == 'undefined') {
			ctrlClassStr = ctrlData.treeMgr;
			viewClassStr = viewConfig.createView ? App.instance.helpers.getViewClassFromLoadedTabController(ctrlClassStr, 0) : '';
			ctrlInstance = Ext.create(ctrlClassStr);
			if (viewClassStr) {
				viewInstance = Ext.create(viewClassStr, {
					$$controller: ctrlInstance,
					data: ctrlData
				});
				ctrlInstance.$$view = viewInstance;
			}
			ctrlInstance.init(this, ctrlData);
			if (viewClassStr) {
				viewInstance.showAt(viewConfig.pageX, viewConfig.pageY);
				ctrlInstance.onLaunch();
			}
			this.treeControllers[ctrlData.id] = ctrlInstance;
		}
		return this.treeControllers[ctrlData.id];
	},
	$loadCreateAndDispatchTabController: function (ctrlClassStr, ctrlData, callback) {
		Ext.require(
			[ctrlClassStr],
			function () {
				var viewClassStr = App.instance.helpers.getViewClassFromLoadedTabController(ctrlClassStr, 0);
				this.$createAndDispatchTabController(ctrlClassStr, viewClassStr, ctrlData);
				callback();
			}.bind(this)
		);
	},
	$createAndDispatchTabController: function (ctrlClassStr, viewClassStr, ctrlData) {
		var doNotRunOnShow = true,
			mainTabs = this.getMainTabs();
		var ctrlInstance = Ext.create(ctrlClassStr);
		var viewInstance = Ext.create(viewClassStr, {
			$$controller: ctrlInstance,
			closable: true,
			title: t(this.DEFAULT_TAB_TITLE),
			listeners: {
				show: function (tabPanel, eOpts) {
					if (!doNotRunOnShow && !this.$hashBrowserChange && !this.$hashInternalChange) ctrlInstance.onShow(tabPanel, eOpts);
				}.bind(this),
				beforeclose: function (tabPanel, eOpts) {
					var result = ctrlInstance.onClose();
					if (result === false) return result;
					Ext.destroy(ctrlInstance);
				}.bind(this)
			}
		});
		ctrlInstance.$$view = viewInstance;
		this.$creationProcess = true;
		ctrlInstance.init(ctrlData);
		if (ctrlInstance.isTabRegistered()) {
			viewInstance = mainTabs.insert(
				this.$currentTabIndex + 1,
				viewInstance
			);
			this.$currentTabIndex += 1;
			mainTabs.setActiveTab(this.$currentTabIndex);
			doNotRunOnShow = false;
			ctrlInstance.onLaunch(
				mainTabs,
				mainTabs.items.items[this.$currentTabIndex]
			);
		}
		this.$creationProcess = false;
	},
	/*****************************************************************************************************************/
	/*_requestForAccordionTreeItems: function (callback) {
		Ext.Ajax.request({
			url: Settings.URLS.TREES_SERVICES,
			method: 'GET',
			success: function (response, conn, options, eOpts) {
				var accordion = this.getLeftAccordion();
				this.treesServicesData = Ext.JSON.decode(response.responseText);
				for (var i = 0, l = this.treesServicesData.length; i < l; i++) {
					this.$buildLayoutNavigationAcordion(i);
				}
				if (this.treesServicesData.length) {
					this.$buildLayoutNavigationTree(
						accordion.items.items[0],
						0
					);
				}
				callback.call(this);
			}.bind(this)
		});
	},*/
	/*_createAnddispatchLeftMenuController: function () {
		this.leftMenu = Ext.create('App.controller.layout.LeftMenu');
		this.leftMenu.init();
		var view = Ext.create('App.view.layout.LeftMenu');
		view.$$controller = this.leftMenu;
		this.leftMenu.$$view = view;
		this.leftMenu.onLaunch();
	},*/
	_tryToDeterminateBaseTypeAndRetype: function (str) {
		if (str.isBoolean()) return str.toBoolean();
		if (str.isInteger()) return str.toInteger();
		if (str.isFloat()) return str.toFloat();
		return str;
	}
});
