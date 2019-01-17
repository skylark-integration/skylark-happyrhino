var $ = require("skylark-utils-dom/query");
var Q = require("q");
var _ = require("./utils");
var Class = require("./Class");
var Queue = require("./Queue");

var delegateEventSplitter = /^(\S+)\s*(.*)$/;

var View = Class.extend({
    tagName: "div",

    /*
     *  Initialize a view
     */
    initialize: function(options, parent) {
        View.__super__.initialize.call(this, options);
        this._ensureElement();
        this.delegateEvents();

        // Rendering queue
        this.renderQueue = new Queue();

        // parent view
        this.parent = parent || this;

        // Model
        this.model = this.options.model || null;

        // View state
        this.isReady = false;

        return this;
    },

    /*
     *  Remove the view from the DOM
     */
    remove: function() {
        this.undelegateEvents();
        this.$el.remove();
        this.stopListening();
        this.off();
        return this;
    },

    /*
     *  Detach the view from the dom (to be reinserted later)
     */
    detach: function() {
        // Signal detachment
        this.trigger("detach");

        // Detach dom el
        this.$el.detach();
        return this;
    },

    /*
     *  Append view
     */
    appendTo: function(el) {
        if (_.isString(el)) el = $(el);
        if (!(el instanceof $)) {
            el = el.$el;
        }
        this.$el.appendTo(el);
        return this;
    },

    /*
     *  skylark-utils-dom/query delegate for the element of this view
     */
    $: function(selector) {
        return this.$el.find(selector);
    },

    /*
     *  Define DOM element for this view
     */
    setElement: function(element, delegate) {
        if (this.$el) this.undelegateEvents();
        this.$el = element instanceof $ ? element : $(element);
        this.el = this.$el[0];
        if (delegate !== false) this.delegateEvents();
        return this;
    },

    /*
     *  Ensure that the view has a DOM element
     */
    _ensureElement: function() {
        if (!this.el) {
            var attrs = _.extend({}, _.result(this, 'attributes'));
            if (this.id) attrs.id = _.result(this, 'id');
            if (this.className) attrs['class'] = _.result(this, 'className');
            var $el = $('<' + _.result(this, 'tagName') + '>').attr(attrs);
            this.setElement($el, false);
        } else {
            this.setElement(_.result(this, 'el'), false);
        }
    },

    /*
     *  Set callbacks, where `this.events` is a hash of {"event selector": "callback"}
     */
    delegateEvents: function(events) {
        if (!(events || (events = _.result(this, 'events')))) return this;
        this.undelegateEvents();
        for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method)) method = this[events[key]];
            if (!method) continue;

            var match = key.match(delegateEventSplitter);
            var eventName = match[1], selector = match[2];
            method = _.bind(method, this);
            eventName += '.delegateEvents' + this.cid;
            if (selector === '') {
                this.$el.on(eventName, method);
            } else {
                this.$el.on(eventName, selector, method);
            }
        }
        return this;
    },

    /*
     *  Clears all callbacks previously bound to the view with `delegateEvents`.
     */
    undelegateEvents: function() {
        this.$el.off('.delegateEvents' + this.cid);
        return this;
    },

    /*
     *  Finish rendering process
     */
    finish: function() {
        this.trigger("render");
        return this;
    },

    /*
     *  Signal the view is ready
     */
    ready: function() {
        this.delegateEvents();
        this.finish();
        if (!this.isReady) {
            this.trigger("ready");
            this.isReady = true;
        }
        return this;
    },

    /*
     *  Wait after rendering
     *  The callback will be call only when the view is ready
     */
    defer: function(callback) {
        var d = Q.defer();
        if (_.isFunction(callback)) d.promise.done(callback);

        this.on("ready", function() {
            d.resolve(this);
        }, this);
        if (this.isReady) d.resolve(this);

        return d.promise;
    },

    /*
     *  Render view
     */
    render: function() {
        return this.ready();
    },

    /*
     *  Update rendering
     */
    update: function() {
        return this.renderQueue.defer(this.render, this);
    }
});

// skylark-utils-dom/query methods that we want to implement on the View.
var methods = ['html', 'text', 'empty'];

_.each(methods, function(method) {
    View.prototype[method] = function() {
        return this.$el[method].apply(this.$el, _.toArray(arguments));
    };
});



module.exports = View;