var nodeUrl = require('url');
var querystring = require('querystring');
var _ = require('underscore');

// goals: make this work in the browser (steal node code for 'url' and 'querystring' modules?
// read and write through same method if possible
// return UrlGrey object where useful for chaining purposes
// nicely tested
// have percolator UriContextHelper use this.


// TODO:  this should take the form of a context helper:
// UrlGrey(context, handler, cb)  which calls cb(err, context)
// Percolator.js needs to be changed to use it like a ContextHelper


// TODO: what if host is empty?


var UrlGrey = function(url){
  this.url = url;
  this._parsed = null;
};

// TODO test
UrlGrey.prototype.parsed = function(){
  if (!this._parsed){
    this._parsed = nodeUrl.parse(this.url);
    var p = this._parsed;
    p.protocol = p.protocol.slice(0,-1);
    if (p.hash){
      p.hash = p.hash.substring(1);
    }
    p.username = ''; 
    p.password = '';
    if (!p.port){
      p.port = 80;
    } else {
      p.port = parseInt(p.port, 10);
    }
    if (p.auth){
      var auth = p.auth.split(':');
      p.username = auth[0]; 
      p.password = auth[1];
    } 
  }
  return this._parsed;
};

// TODO write part
UrlGrey.prototype.query = function(mergeObject){
  var path;
  if (mergeObject === false){
    // clear the query entirely if the input === false
    return this.queryString('');
  }
  
  var url = this.url;
  if (!mergeObject){
    var parsed = nodeUrl.parse(url);
    if (!!parsed.search){
      var qstr = parsed.search.substring(1);
      return querystring.parse(qstr);
    }
    return {};
  } else {
    // read the object out
    var oldQuery = querystring.parse(this.queryString());
    _.each(mergeObject, function(v, k){
      if (v === null){
        delete oldQuery[k];
      } else {
        oldQuery[k] = v;
      }
    });
    var newString = querystring.stringify(oldQuery, '&', '=');
    this.queryString(newString);
    return this;
  }
};


addPropertyGetterSetter('protocol');
addPropertyGetterSetter('port');
addPropertyGetterSetter('username');
addPropertyGetterSetter('password');
addPropertyGetterSetter('hostname');
addPropertyGetterSetter('hash');
// add a method called queryString that manipulates 'query'
addPropertyGetterSetter('query', 'queryString');  
addPropertyGetterSetter('pathname', 'path');  

UrlGrey.prototype.path = function(str){
  if (str === '' || !!str){
    if (str[0] !== '/'){ str = '/' + str; }
    this.parsed().pathname = str;
    return this;
  }
  return this.parsed().pathname;
};


UrlGrey.prototype.absolute = function(path){
  if (path[0] == '/'){
    path = path.substring(1);
  }
  var parsed = nodeUrl.parse(path);
  if (!!parsed.protocol){  // if it's already absolute, just return it
    return path;
  }
  return this._protocol + "://" + this._host + '/' + path;
};

// TODO do anything with these?  remove?
UrlGrey.prototype.urlEncode = function(str){
  return querystring.escape(str);
};

UrlGrey.prototype.urlDecode = function(str){
  return querystring.unescape(str);
};


// TODO just call this path?  let it take a zillion pieces?
// TODO missing pieces --> return the current path
UrlGrey.prototype.pathJoin = function(){
	// put a fwd-slash between all pieces and remove any redundant slashes
	// additionally remove the trailing slash
  var pieces = _.flatten(_.toArray(arguments));
  var first = nodeUrl.parse(pieces[0]);
  var prefix = '';
  if (!!first.protocol){
    pieces[0] = first.path;
    prefix = first.protocol + '//' + first.host;
    var lastIndex = prefix.length - 1;
    if (prefix[lastIndex] == '/'){
      prefix = prefix.substring(0, lastIndex - 1);
    }
  }
  var joined = pieces.join('/').replace(/\/+/g, '/');
	joined = joined.replace(/\/$/, '');  // remove all trailing slashes
	joined = joined.replace(/^\/+/, ''); // remove all leading slashes
  joined = prefix + '/' + joined;
  return joined;
};

UrlGrey.prototype.parent = function(){
  var url = this.url;
  // TODO: implement this without a call to the router
  return this.absolute(this._router.getParentUrl(url));
};


// TODO sibling()
// TODO relative()  // takes an absolutepath and returns a relative one
// TODO absolute() // takes a relative path and returns an absolute one.





UrlGrey.prototype.child = function(suffix){
  var path;
  if (suffix){
    path = this.parse(this.url).pathname;
    return this.absolute(this.pathJoin(path, suffix));
  } else {
    // TODO: if no suffix, return the child
    path = nodeUrl.parse(inUrl || this.url).pathname;
    // remove any trailing slashes
    if (path[path.length -1] === '/'){
      path = path.substring(0, path.length -1);
    }
    return _.last(path.split("/"));
  }
};

UrlGrey.prototype.parse = function(inUrl){
  // TODO remove this method, but make all the values it reveals methods on UrlGrey that memoize the result.
  return nodeUrl.parse(inUrl || this.url);

};


// TODO make this interpolate vars into the url.   both sinatra style and url-tempates
// TODO name this: 
UrlGrey.prototype.get = function(nameOrPath, varDict){
  if (!!nameOrPath){
    if (!!varDict){
      return this.absolute(this._router.getUrl(nameOrPath, varDict));
    }
    return this.absolute(this._router.getUrl(nameOrPath));
  }
  return this.url;
};

UrlGrey.prototype.toString = function(){
  if (!this._parsed){
    return this.url;
  }
  var p = this._parsed;
  var userinfo = p.username + ':' + p.password;
  var retval = this.protocol() + '://';
  if (userinfo != ':'){
    retval += userinfo + '@';
  }
  retval += p.hostname;
  if (this.port() !== 80){
    retval += ':' + this.port();
  }
  retval += this.path() === '/' ? '' : this.path();
  var qs = this.queryString();
  if (qs){
    retval += '?' + qs;
  }
  if (p.hash){
    retval += '#' + p.hash;
  }
  return retval;
};

// TODO needs to take a template as an input
UrlGrey.prototype.param = function(key, defaultValue){
  var value = this.params()[key];
  if (!!value) { 
    return value; 
  }
  return defaultValue;
};

// TODO extract params, given a template?
// TODO needs to take a template as an input
UrlGrey.prototype.params = function(inUrl){
  if (!!inUrl){
    return this._router.pathVariables(inUrl);
  }
  if (!!this._params){
    return this._params;
  }
  return this._router.pathVariables(this.url);
};

module.exports = function(url){ return new UrlGrey(url); };

function addPropertyGetterSetter(propertyName, methodName){
  if (!methodName){
    methodName = propertyName;
  }
  UrlGrey.prototype[methodName] = function(str){
    if (str === '' || !!str){
      this.parsed()[propertyName] = str;
      return this;
    }
    return this.parsed()[propertyName];  
  };
}
