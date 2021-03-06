var Querystring = {
  get: function(name, defaultValue) {
    // http://stackoverflow.com/a/901144
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null
           ? (defaultValue || "")
           : decodeURIComponent(results[1].replace(/\+/g, " "));
  },
  getFloat: function(name, defaultValue) {
    var result = parseFloat(this.get(name));
    if (isNaN(result))
      return defaultValue;
    return result;
  },
  getInt: function(name, defaultValue) {
    var result = parseInt(this.get(name));
    if (isNaN(result))
      return defaultValue;
    return result;
  },
  getBool: function(name, defaultValue) {
    var result = this.get(name);
    if (result == 'true') return true;
    if (result == 'false') return false;
    return defaultValue;
  },
  serialize: function(params) {
    return '?' + Object.keys(params).map(function(name) {
      return name + '=' + encodeURIComponent(params[name]);
    }).join('&');
  }
};
