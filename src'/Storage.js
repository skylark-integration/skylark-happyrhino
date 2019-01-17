var _ = require("skylark-underscore");

var storage = {
    /*
     *  Return storage context
     */
    localstorage: function() {
        try {
            return (typeof window.localStorage === 'undefined')? null : window.localStorage;
        } catch (e) {
            return null;
        }
    },

    /*
     *  Return used space
     */
    usedSpace: function() {
        var space = storage.localstorage();
        if (!space) return 0;

        return space.length;
    },

    /*
     *  Check that a key exists
     */
    has: function(key) {
        var s = storage.localstorage();
        if (!s) return false;

        return _.isUndefined(s[key]) == false;
    },

    /*
     *  Return list of keys in the storage
     */
    keys: function() {
        var s = storage.localstorage();
        if (!s) return [];

        return Object.keys(s);
    },

    /*
     *  Get a data from the storage
     *  @key : key of the data to get
     */
    get: function(key) {
        var s = storage.localstorage();
        if (!s) return undefined;

        if (_.isUndefined(s[key]) == false) {
            try {
                return JSON.parse(s[key]);
            } catch(err) {
                logging.error("Error parsing ", s[key], err);
                return s[key];
            }
        } else {
            return undefined;
        }
    },

    /*
     *  Set a data in the storage
     *  @key : key of the data to set
     *  @value : value for the key
     */
    set: function(key, value) {
        var s = storage.localstorage();
        if (!s) return undefined;

        s[key] = JSON.stringify(value);
        return storage.get(key);
    },

    /*
     *  Remove a data from the storage
     *  @key : key of the data to remove
     */
    remove: function(key) {
        var s = storage.localstorage();
        if (!s) return false;

        s.removeItem(key);
        return true;
    },

    /*
     *  Clear the all storage
     */
    clear: function() {
        var s = storage.localstorage();
        if (!s) return false;

        s.clear();
        return true;
    }
};

module.exports = storage;