// http://stackoverflow.com/a/901144
function getQuerystringParam(name, defaultValue) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
         ? (defaultValue || "")
         : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getIntQuerystringParam(name, defaultValue) {
  var result = parseInt(getQuerystringParam(name));
  if (isNaN(result))
    return defaultValue;
  return result;
}

function serializeQuerystring(params) {
  return '?' + Object.keys(params).map(function(name) {
    return name + '=' + encodeURIComponent(params[name]);
  }).join('&');
}
