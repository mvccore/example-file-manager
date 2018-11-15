Ext.define('App.view.layout.accordiontree.TreePagingToolbar', {
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'Ext.toolbar.TextItem',
		'Ext.form.field.Number'
	],
	displayInfo: true,
	prependButtons: true,
	displayMsg: t('Displaying {0} - {1} of {2}'),
	emptyMsg: t('No data to display'),
	beforePageText: t('page'),
	afterPageText: '/ {0}',
	firstText: t('First page'),
	prevText: t('Previous page'),
	nextText: t('Next page'),
	lastText: t('Last page'),
	refreshText: t('Refresh'),
	width: 170,
	height: 20,
	padding: 0,
	border: false,
	emptyPageData: {
		total: 0,
		currentPage: 0,
		pageCount: 0,
		toRecord: 0,
		fromRecord: 0
	},
	initComponent: function (config) {
		var me = this,
			userItems = me.items || me.buttons || [],
			pagingItems;
		pagingItems = me.getPagingItems();
		if (me.prependButtons) {
			me.items = userItems.concat(pagingItems);
		} else {
			me.items = pagingItems.concat(userItems);
		}
		delete me.buttons;
		if (me.displayInfo) {
			me.items.push('->');
			me.items.push({
				xtype: 'tbtext',
				itemId: 'displayItem'
			});
		}
		me.callParent();
	},
	getPagingItems: function () {
		var me = this,
			inputListeners = {
				scope: me,
				blur: me.onPagingBlur
			};
		var pagingData = me.node.pagingData;

		var currPage = pagingData.offset / pagingData.limit + 1;

		this.afterItem = Ext.create('Ext.form.NumberField', {
			cls: Ext.baseCSSPrefix + 'tbar-page-number',
			fieldStyle: 'padding:0;font-size:10px;height:15px;min-height:15px;',
			value: Math.ceil(pagingData.total / pagingData.limit),
			hideTrigger: true,
			heightLabel: true,
			bodyPadding: 0,
			height: 18,
			width: 30,
			disabled: true,
			margin: '-5 0 0 0'
		});

		inputListeners[Ext.supports.SpecialKeyDownRepeat ? 'keydown' : 'keypress'] = me.onPagingKeyDown;
		return [{
			itemId: 'first',
			tooltip: me.firstText,
			overflowText: me.firstText,
			iconCls: Ext.baseCSSPrefix + 'tbar-page-first',
			disabled: me.node.pagingData.offset == 0,
			handler: me.moveFirst,
			scope: me,
			border: false

		}, {
			itemId: 'prev',
			tooltip: me.prevText,
			overflowText: me.prevText,
			iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
			disabled: me.node.pagingData.offset == 0,
			handler: me.movePrevious,
			scope: me,
			border: false
		}, {
			xtype: 'numberfield',
			itemId: 'inputItem',
			name: 'inputItem',
			heightLabel: true,
			fieldStyle: 'padding:0;font-size:10px;height:15px;min-height:15px;',
			cls: Ext.baseCSSPrefix + 'tbar-page-number',
			allowDecimals: false,
			minValue: 1,
			maxValue: this.getMaxPageNum(),
			value: currPage,
			hideTrigger: true,
			enableKeyEvents: true,
			keyNavEnabled: false,
			selectOnFocus: true,
			submitValue: false,
			bodyPadding: 0,
			height: 18,
			width: 30,
			isFormField: false,
			margin: '-1 0 0 0',
			listeners: inputListeners
		}, {
			xtype: "tbspacer"
		},
			this.afterItem,
			{
				itemId: 'next',
				tooltip: me.nextText,
				overflowText: me.nextText,
				iconCls: Ext.baseCSSPrefix + 'tbar-page-next',
				disabled: (Math.ceil(me.node.pagingData.total / me.node.pagingData.limit) - 1) * me.node.pagingData.limit == me.node.pagingData.offset,
				handler: me.moveNext,
				scope: me
			}, {
				itemId: 'last',
				tooltip: me.lastText,
				overflowText: me.lastText,
				iconCls: Ext.baseCSSPrefix + 'tbar-page-last',
				disabled: (Math.ceil(me.node.pagingData.total / me.node.pagingData.limit) - 1) * me.node.pagingData.limit == me.node.pagingData.offset,
				handler: me.moveLast,
				scope: me
			}
			//,
			//'-',
			//{
			//    itemId: 'refresh',
			//    tooltip: me.refreshText,
			//    overflowText: me.refreshText,
			//    iconCls: Ext.baseCSSPrefix + 'tbar-loading',
			//    disabled: false,
			//    handler: me.doRefresh,
			//    scope: me
			//}
		];
	},
	getMaxPageNum: function () {
		var me = this;
		return Math.ceil(me.node.pagingData.total / me.node.pagingData.limit)
	},
	getInputItem: function () {
		return this.child('#inputItem');
	},
	onPagingBlur: function (e) {
		//console.log("onPagingBlur");
		var inputItem = this.getInputItem(),
			curPage;
		if (inputItem) {
			//curPage = this.getPageData().currentPage;
			//inputItem.setValue(curPage);
		}
	},
	onPagingKeyDown: function (field, e) {
		//console.log("onPagingKeyDown");
		this.processKeyEvent(field, e);
	},
	readPageFromInput: function () {
		var inputItem = this.getInputItem(),
			pageNum = false,
			v;
		if (inputItem) {
			v = inputItem.getValue();
			pageNum = parseInt(v, 10);
		}
		return pageNum;
	},
	processKeyEvent: function (field, e) {
		var me = this,
			k = e.getKey(),
			//pageData = me.getPageData(),
			increment = e.shiftKey ? 10 : 1,
			pageNum;
		if (k == e.RETURN) {
			e.stopEvent();
			pageNum = me.readPageFromInput();
			if (pageNum !== false) {
				pageNum = Math.min(Math.max(1, pageNum), this.getMaxPageNum());
				this.moveToPage(pageNum);
			}
		} else if (k == e.HOME) {
			e.stopEvent();
			this.moveFirst();
		} else if (k == e.END) {
			e.stopEvent();
			this.moveLast();
		} else if (k == e.UP || k == e.PAGE_UP || k == e.DOWN || k == e.PAGE_DOWN) {
			e.stopEvent();
			pageNum = me.readPageFromInput();
			if (pageNum) {
				if (k == e.DOWN || k == e.PAGE_DOWN) {
					increment *= -1;
				}
				pageNum += increment;
				if (pageNum >= 1 && pageNum <= this.getMaxPageNum()) {
					this.moveToPage(pageNum);
				}
			}
		}
	},
	moveToPage: function (page) {
		var me = this;
		var node = me.node;
		var pagingData = node.pagingData;
		var store = node.getTreeStore();
		var proxy = store.getProxy();
		proxy.setExtraParam("offset", pagingData.limit * (page - 1));
		store.load({
			node: node
		});
	},
	moveFirst: function () {
		var me = this;
		var node = me.node;
		var pagingData = node.pagingData;
		var store = node.getTreeStore();
		var page = pagingData.offset / pagingData.total;
		var proxy = store.getProxy();
		proxy.setExtraParam("offset", 0);
		store.load({
			node: node
		});
	},
	movePrevious: function () {
		var me = this;
		var node = me.node;
		var pagingData = node.pagingData;
		var store = node.getTreeStore();
		var page = pagingData.offset / pagingData.total;
		var proxy = store.getProxy();
		proxy.setExtraParam("offset", pagingData.offset - pagingData.limit);
		store.load({
			node: node
		});
	},
	moveNext: function () {
		var me = this;
		var node = me.node;
		var pagingData = node.pagingData;
		var store = node.getTreeStore();
		var page = pagingData.offset / pagingData.total;
		var proxy = store.getProxy();
		proxy.setExtraParam("offset", pagingData.offset + pagingData.limit);
		store.load({
			node: node
		});

	},
	moveLast: function () {
		var me = this;
		var node = me.node;
		var pagingData = node.pagingData;
		var store = node.getTreeStore();
		var offset = (Math.ceil(pagingData.total / pagingData.limit) - 1) * pagingData.limit;
		var proxy = store.getProxy();
		proxy.setExtraParam("offset", offset);
		store.load({
			node: node
		});
	},
	doRefresh: function () {
		var me = this;
		var node = me.node;
		var pagingData = node.pagingData;
		var store = node.getTreeStore();
		var page = pagingData.offset / pagingData.total;
		var proxy = store.getProxy();
		proxy.setExtraParam("offset", pagingData.offset);
		store.load({
			node: node
		});
	},
	onDestroy: function () {
		//this.bindStore(null);
		this.callParent();
	}
});
