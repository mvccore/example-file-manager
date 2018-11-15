Ext.define("App.model.layout.MainSearch", {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'jsonp',
        url : 'http://www.sencha.com/forum/topics-remote.php',
        reader: {
            type: 'json',
            rootProperty: 'topics',
            totalProperty: 'totalCount'
        }
    },
    fields: [
        {name: 'id', mapping: 'post_id'},
        {name: 'title', mapping: 'topic_title'},
        {name: 'topicId', mapping: 'topic_id'},
        {name: 'author', mapping: 'author'},
        {name: 'lastPost', mapping: 'post_time', type: 'date', dateFormat: 'timestamp'},
        {name: 'excerpt', mapping: 'post_text'}
    ]
});