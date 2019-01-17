var _ = require("./utils");
var View = require("./View");
var Collection = require("./Collection");


var ItemView = View.extend({
    tagName: "li",

    initialize: function() {
        ItemView.__super__.initialize.apply(this, arguments);

        this.list = this.parent;
        this.collection = this.parent.collection;

        return this;
    }
});


var ListView = View.extend({
    tagName: "ul",
    Item: ItemView,
    Collection: Collection,

    defaults: {
        collection: {},
        loadAtInit: true,
        filter: null
    },

    /*
     *  Initialize the list view
     */
    initialize: function() {
        ListView.__super__.initialize.apply(this, arguments);

        this._filter = null;
        this.items = {};


        if (this.options.collection instanceof Collection) {
            this.collection = this.options.collection;
        } else {
            this.collection = new this.Collection(this.options.collection);
        }

        this.listenTo(this.collection, "reset", function() {
            this.resetModels();
        });
        this.listenTo(this.collection, "sort", function() {
            this.orderItems();
        });
        this.listenTo(this.collection, "add", function(elementmodel, collection, options) {
            this.addModel(elementmodel, options);
        });
        this.listenTo(this.collection, "remove", function(elementmodel) {
            this.removeModel(elementmodel)
        });

        this.resetModels({
            silent: true
        });

        if (this.options.filter) this.filter(this.options.filter);

        return this.update();
    },

    /*
     *  Remove the view and all children
     */
    remove: function() {
        _.each(this.items, function(view) {
            view.remove();
        });
        return ListView.__super__.remove.apply(this, arguments);
    },

    /*
     *  Add a model to the list
     *  @model : model to add
     *  @options
     */
    addModel: function(model, options) {
        var item, tag;

        // Define options
        options = _.defaults(options || {}, {
            silent: false,
            render: true,
            at: _.size(this.items),
        });

        if (this.items[model.id] != null) {
            this.removeModel(model);
        }

        item = new this.Item({
            "model": model
        }, this);
        this.listenTo(model, "set", function() {
            item.update();
            this.applyFilter(item);
        });
        this.listenTo(model, "id", function(newId, oldId) {
            this.items[newId] = this.items[oldId];
            delete this.items[oldId];
        });

        item.update();
        tag = this.Item.prototype.tagName;
        if (this.Item.prototype.className) tag = tag+"."+this.Item.prototype.className.split(" ")[0];

        if (options.at > 0) {
            this.$("> "+tag).eq(options.at-1).after(item.$el);
        } else {
            this.$el.prepend(item.$el);
        }
        this.items[model.id] = item;

        this.applyFilter(item);

        if (!options.silent) this.trigger("add", model);
        if (options.render) this.update();

        return this;
    },

    /*
     *  Order items in the list
     */
    orderItems: function() {
        _.each(this.items, function(item) {
            item.detach();
        }, this);

        this.collection.each(function(model) {
            var item = this.items[model.id];
            if (!item) return;
            item.appendTo(this);
        }, this);
        return this;
    },

    /*
     *  Remove a model from the list
     *  @model : model to remove
     *  @options
     */
    removeModel: function(model, options) {
        options = _.defaults(options || {}, {
            silent: false,
            render: true
        });

        this.stopListening(model);

        if (this.items[model.id] == null) return this;

        this.items[model.id].remove();
        this.items[model.id] = null;
        delete this.items[model.id];

        if (!options.silent) this.trigger("remove", model);
        if (options.render) this.update();

        return this;
    },

    /*
     *  Reset models from the collection
     */
    resetModels: function(options) {
        options = _.defaults(options || {}, {
            silent: false,
            render: true
        });

        _.each(this.items, function(item) {
            this.removeModel(item.model, {
                silent: true,
                render: false
            });
        }, this);
        this.items = {};
        this.$el.empty();

        // add new models
        this.collection.forEach(function(model) {
            this.addModel(model, {
                silent: true,
                render: false
            });
        }, this);

        if (!options.silent) this.trigger("reset");
        if (options.render) this.update();
        return this;
    },

    /*
     *  Return number of elements in the list collection
     */
    size: function() {
        return this.collection.size();
    },

    /*
     *  Return number of elements in collections visible (not filtered)
     */
    count: function() {
        return _.reduce(this.items, function(n, item) {
            if (this.applyFilter(item)) {
                n = n + 1;
            }
            return n;
        }, 0, this);
    },

    /*
     *  Return items as a lists
     */
    getItemsList: function(i) {
        return _.map(this.items, function(item) {
            return this.$(this.Item.prototype.tagName).index(item.$el);
        }, this);
    },

    /*
     *  Apply filter on a item
     */
    applyFilter: function(item) {
        var hasFiltered = item.$el.hasClass("hr-list-fiter-on");
        var state = !(this._filter != null && !this._filter(item.model, item));
        item.$el.toggleClass("hr-list-fiter-on", !state);

        if (hasFiltered == state) this.trigger("filter", item, state);
        return state;
    },

    /*
     *  Filter the items list
     *  @filt : function to apply to each model
     *  @context
     */
    filter: function(filt, context) {
        if (_.isFunction(filt)) {
            this._filter = _.bind(filt, context);
        } else {
            this._filter = null;
        }

        return this.count();
    },

    /*
     *  Clear filter
     */
    clearFilter: function() {
        return this.filter(null);
    }
});

module.exports = ListView;
module.exports.Item = ItemView;