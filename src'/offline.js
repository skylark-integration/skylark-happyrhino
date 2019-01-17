var _ = require("./utils");
var Class = require("./Class");

var OfflineManager = Class.extend({
    initialize: function() {
        var that = this;
        OfflineManager.__super__.initialize.apply(this, arguments);
        this.state = true;
        this.available = typeof window.applicationCache !== 'undefined';

        window.addEventListener("online offline", function() {
            that.check();
        });

        if (this.available) {
            window.applicationCache.addEventListener('updateready', function() {
                that.trigger("update");
            });
        }
    },

    // Check for cache update
    checkUpdate: function() {
        if (!this.available) return;

        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
            this.trigger("update");
        }
        return window.applicationCache.status === window.applicationCache.UPDATEREADY;
    },

    // Set connexion status
    setState: function(state) {
        if (state == this.state) return;

        this.state = state;
        this.trigger("state", this.state);
    },

    // Check connexion status
    check: function() {
        var state = navigator.onLine;
        this.setState(state);
        return Q(state);
    },

    // Return true if connexion is on
    isConnected: function() {
        return this.state;
    }
});


module.exports = new OfflineManager();