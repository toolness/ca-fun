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
  getInt: function(name, defaultValue) {
    var result = parseInt(this.get(name));
    if (isNaN(result))
      return defaultValue;
    return result;
  },
  serialize: function(params) {
    return '?' + Object.keys(params).map(function(name) {
      return name + '=' + encodeURIComponent(params[name]);
    }).join('&');
  }
};
