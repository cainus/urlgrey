


exports.parse = function(uri){
  var a = document.createElement('a');
  a.href = uri;
  // "a" has these properties:   protocol, hostname, port, 
  // pathname, search, hash, host
  var fields = ['protocol', 'hostname', 'port', 'pathname',
                'search', 'hash', 'host'];
  var output = {};
  for( var i = 0; i < fields.length; i++){
    output[fields[i]] = a[fields[i]].toString();
  }
  if (!output.protocol){
    output.protocol = 'http';
  }
  output.href = uri;
  output.query = output.search.slice(1);
  output.path = output.pathname + output.search;
  var auth = getAuth(uri, output.hostname);
  output.auth = auth;
  return output;
};

var getAuth = function(uri, hostname){
  var prefix = uri.slice(0, uri.indexOf(hostname));
  if (prefix.indexOf('@') === -1){
    return '';
  }
  prefix = prefix.slice(0, -1);
  var protoCreds = prefix.split('//');
  var protocol = protoCreds[0];
  return protoCreds[1];
};
