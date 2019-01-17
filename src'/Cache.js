var _ = require("skylark-underscore");
var Class = require("./Class");
var storage = require("./storage");

var Cache = Class.extend({
    defaults: {
        namespace: "",
        revision: ""
    },

    /**
     * Initialize the cache : delete all the "old-version" values
     */
    initialize: function() {
        storage.keys().forEach(_.bind(function(key){
            if (key.indexOf("cache_") == 0 && key.indexOf("cache_"+this.options.revision) ) {
                storage.remove(key);
            }
        }, this));
    },

    /**
     * Transform a key in cache key
     *
     * @method key
     * @param {string} namespace namespace for this key
     * @param {string} key key of the data to cache
     * @return {string} complete key for the cache
     */
    key: function(key) {
        key = JSON.stringify(key);
        return "cache_" + this.options.revision + "_" + this.options.namespace + "_" + key;
    },

    /**
     * Get data from the cache
     *
     * @method get
     * @param {string} namespace namespace for this key
     * @param {string} key key of the data to cache
     * @return {object} value from the cache
     */
    get: function(key) {
        var ckey = this.key(key);
        var ctime = (new Date()).getTime();

        var v = storage.get(ckey);
        if (v == undefined) {
            return undefined;
        } else {
            if (v.expiration == -1 || v.expiration > ctime) {
                return v.value;
            } else {
                storage.remove(ckey);
                return undefined;
            }
        }
    },

    /**
     * Delete a cache value
     *
     * @method remove
     * @param {string} namespace namespace for this key
     * @param {string} key key of the data to cache
     */
    remove: function(key) {
        var ckey = this.key(key);
        storage.remove(ckey);
    },

    /**
     * Set a data in the cache
     *
     * @method get
     * @param {string} namespace namespace for this key
     * @param {string} key key of the data to cache
     * @param {object} value value to store in the cache associated to this key
     * @param {number} [expiration] miliseconds before epiration of this value in the cache
     */
    set: function(key, value, expiration) {
        var ckey = this.key(key);
        var ctime = (new Date()).getTime();

        if (expiration > 0) {
            expiration = ctime + expiration;
        } else {
            expiration = -1;
        }

        storage.set(ckey, {
            "expiration": expiration,
            "value": value
        });
        return this.get(key);
    },

    /**
     * Clear the entire cache
     *
     * @method clear
     */
    clear: function(all) {
        storage.keys().forEach(_.bind(function(key){
           if (/^(cache_)/.test(key) && (all || key.indexOf("cache_"+this.options.revision+"_"+this.options.namespace))) {
               storage.remove(key);
           }
        }, this));
    }
});

module.exports = Cache;