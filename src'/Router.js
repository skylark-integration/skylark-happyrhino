var Class = require("./Class");
var _ = require("./utils");

var history = require("./history");

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
var namedParam    = /:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;


var Router = Class.extend({
    /* Routes map of pattern -> method */
    defaults: {
        routes: {}
    },

    /*
     *  Initialize the router
     */
    initialize: function() {
        this.route(_.result(this.options, 'routes'));
        return this;
    },

    /*
     *  Add a route
     *  @route : regex ou route string
     *  @name : name for the route
     *  @callback : callback when routing
     */
    route: function(route, name, callback) {
        if (_.isObject(route) && _.isRegExp(route) == false) {
            _.each(route, function(callback, route) {
                this.route(route, route, callback);
            }, this);
            return this;
        }

        if (!_.isRegExp(route)) route = Router.routeToRegExp(route);

        history.route(route, _.bind(function(url) {
            var args = Router.extractParameters(route, url);
            callback && callback.apply(this, args);
            this.trigger.apply(this, ['route:' + name].concat(args));
        }, this));

        return this;
    },

    /*
     *  Start the router
     */
    start: function() {
        return history.start();
    },

    /*
     *  Navigate
     */
    navigate: function(route, args) {
        history.navigate(Router.routeToUrl(route, args));
        return this;
    },
}, {
    /*
     *  Convert a route string into a regular expression, suitable for matching
     *  against the current location hash.
     */
    routeToRegExp: function(route) {
        route = route.replace(escapeRegExp, '\\$&')
                        .replace(namedParam, '([^\/]+)')
                        .replace(splatParam, '(.*?)');
        return new RegExp('^' + route + '$');
    },

    /*
     *  Given a route, and a URL fragment that it matches, return the array of
     *  extracted parameters.
     */
    extractParameters: function(route, fragment) {
        return route.exec(fragment).slice(1);
    },

    /*
     *  Transform a route in an url
     *  @route : route to transform
     *  @args : args for the route
     */
    routeToUrl: function(route, args) {
        base = base || "";
        args = args || {};
        var url = route;
        url = url.replace("#!/","#").replace("#!", "#").replace("#", "");
        _.map(args, function(value, attr) {
            url = url.replace("\:"+attr, value);
        });
        return url;
    }
});

module.exports = Router;