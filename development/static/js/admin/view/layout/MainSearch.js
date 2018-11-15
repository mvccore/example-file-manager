Ext.define('App.view.layout.MainSearch', {
	statics: {
		MIN_CHARS: 2
	},
	extend: 'Ext.panel.Panel',
	alias: 'widget.mainsearch',
    bodyPadding: 5,
    layout: 'anchor',
    border: false,
    initComponent: function () {
    	this.items = [{
    		xtype: 'component',
    		html: '<span style="white-space:nowrap;">' + String.format(t('To search, enter min. {0} characters'), this.self.MIN_CHARS) + '</span>',
    		height: 20
    	}, {
    		xtype: 'combo',
    		id: 'main-search',
    		store: 'App.store.layout.MainSearch',
    		displayField: 'title',
    		typeAhead: false,
    		minChars: 2,
    		hideLabel: true,
    		hideTrigger: true,
    		matchFieldWidth: false,
    		anchor: '100%',
    		listConfig: {
    			loadingText: t('Searching...'),
    			emptyText: t('No search results found.'),
    			// Custom rendering template for each item
    			getInnerTpl: function () {
    				return '<a class="search-item" href="http://www.sencha.com/forum/showthread.php?t={topicId}&p={id}">' +
						'<h3><span>{[Ext.Date.format(values.lastPost, "M j, Y")]}<br />by {author}</span>{title}</h3>' +
						'{excerpt}' +
					'</a>';
    			},
    			height: window.innerHeight * 0.8,
    			listeners: {
    				beforeshow: function (picker) {
    					picker.width = Ext.getCmp('main-search').getSize().width * 2;
    				}
    			}
    		},
    		pageSize: 10
    	}];
    	this.callParent(arguments);
    }
});