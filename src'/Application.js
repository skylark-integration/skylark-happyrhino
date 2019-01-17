var $ = require("skylark-utils-dom/query");
var _ = require("./utils");
var View = require("./View");
var Router = require("hr.history").Router;

var Head = require("./head");

var Application = View.extend({
    el: $("body"),

    // Name of the application
    name: null,

    // Default routes
    routes: {},

    initialize: function() {
        Application.__super__.initialize.apply(this, arguments);

        this.router = new Router({
            routes: _.mapValues(this.routes, function(fn) {
                fn = _.isFunction(fn)? fn : this[fn];
                return _.bind(fn, this);
            }, this)
        });

        this.head = new Head({}, this);
    }
});


module.exports = Application;