var AbstractEventProcessor = require('./AbstractEventProcessor'),
    kevoree     = require('kevoree-library').org.kevoree,
    _s          = require('underscore.string');

/**
 * Created by leiko on 04/02/14.
 */
var ModelEventProcessor = AbstractEventProcessor.extend({
    toString: 'ModelEventProcessor',

    processAdd: function (event) {
        var element = event.getValue();
        switch (event.getElementAttributeName()) {
            case 'hubs':
                this.ui.addChannel(this.editor.getModel().findByPath(element.path()));
                break;

            case 'nodes':
                // only add top level nodes
                // hosted nodes will be added by there respective node UIs
                if (!element.host) this.ui.addNode(this.editor.getModel().findByPath(element.path()));
                break;

            case 'groups':
                this.ui.addGroup(this.editor.getModel().findByPath(element.path()));
                break;

            case 'typeDefinitions':
                this.ui.update();
                break;

            default:
                console.log('unhandled add event ', event.toString());
                break;
        }
    },

    processSet: function (event) {
//        console.log('SET', event);
    },

    processRemove: function (event) {
        switch (event.getElementAttributeName()) {
            case 'hubs':
            case 'nodes':
                this.ui.removeUIInstance(event.getPreviousValue(), true);
                break;
            
            case 'groups':
                if (event.getSourcePath().length === 0) {
                    this.ui.removeUIInstance(event.getPreviousValue(), true);    
                } else {
                    // it means that we have remove the group from this node "groups" list
                    // this event wont be handled here, but by node's instance event processor
                }
                break;
            
            case 'typeDefinitions':
                this.ui.update();
                break;

            default:
                console.log(this.toString()+' unhandled remove event ', event.toString());
                break;
        }
    }
});

module.exports = ModelEventProcessor;