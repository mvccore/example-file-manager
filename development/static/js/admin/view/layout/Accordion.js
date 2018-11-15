Ext.define('App.view.layout.Accordion', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.accordion',
    /*requires: [
        'App.view.layout.AccordionItem',
        'App.view.layout.accordiontree.Tree',
        'App.view.layout.accordiontree.TreePagingToolbar',
        'App.view.layout.accordiontree.TreeViewWithPaging'
    ],*/
    defaults: {
        bodyStyle: 'padding:0'
	},
	border: false,
    layout: {
        type: 'accordion',
        activeOnTop: false,
        titleCollapse: true,
        animate: true
    },
    items: [],
	// layout helper methods
    toLeft: function (toolOwner) {
    	var accordionItem = toolOwner.up('accordionitem');
    	if (!this._accordions.initialized) this._initAccordions();
    	this._move(
			accordionItem,
			this._accordions.right,
			this._accordions.left,
			false
		);
    	toolOwner.tools.left.hide();
    	toolOwner.tools.right.show();
    },
    toRight: function (toolOwner) {
    	var accordionItem = toolOwner.up('accordionitem');
    	if (!this._accordions.initialized) this._initAccordions();
    	this._move(
			accordionItem,
			this._accordions.left,
			this._accordions.right,
			true
		);
    	toolOwner.tools.right.hide();
    	toolOwner.tools.left.show();
    },
    _move: function (accordionItem, sourceAccordion, targetAccordion, fromLeftToRightDirection) {
    	var sourceAccordionSidePanel = sourceAccordion.up('sidepanel'),
    		targetAccordionSidePanel = targetAccordion.up('sidepanel');
		// if target accordion is still hidden - show it
    	if (targetAccordionSidePanel.hidden) {
    		targetAccordionSidePanel.show();
    		targetAccordionSidePanel.expand();
    	}
		// relocate whole accordion item
    	targetAccordion.add(accordionItem);
    	// if source accordion has eventually no items - hide it
    	if (sourceAccordion.items.getCount() < 1) {
    		// if source accordion was left - only collapse the panel to use search later
    		if (fromLeftToRightDirection) {
    			sourceAccordionSidePanel.collapse();
    		} else {
    			sourceAccordionSidePanel.hide();
    		}
    	}
    },
	_initAccordions: function ()
	{
		this._accordions.left = Ext.getCmp("left-accordion");
		this._accordions.right = Ext.getCmp("right-accordion");
		this._accordions.initialized = true;
	},
	_accordions: {
		initialized: false,
		left: null,
		right: null
	}
});
