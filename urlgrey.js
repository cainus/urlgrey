!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.urlgrey=e():"undefined"!=typeof global?global.urlgrey=e():"undefined"!=typeof self&&(self.urlgrey=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){



exports.parse = function(uri){
  var a = document.createElement('a');
  a.href = uri;
  // "a" has these properties:   protocol, hostname, port, 
  // pathname, search, hash, host
  var fields = ['protocol', 'hostname', 'port', 'pathname',
                'search', 'hash', 'host'];
  output = {};
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

},{}],2:[function(require,module,exports){
var urlParse = require('url').parse;
var querystring = require('qs');
var isBrowser = (typeof window !== "undefined");

// qs library appears to return a __proto__
// property when run in the browser,
// so monkey-patch it to not do that
var origQSParse = querystring.parse;
querystring.parse = function(str){
    var output = origQSParse(str);
    var badPropName = '__proto__';
    delete output[badPropName];
    return output;
};

var getDefaults = function(){
  var defaultUrl = "http://localhost:80";
  if (isBrowser){
    defaultUrl = window.location.href.toString();
  }
  var defaults = urlParse(defaultUrl);
  return defaults;
};

if(!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) == '[object Array]';
  };
}

var objectEach = function(obj, cb){
  for(var k in obj){
    cb(obj[k], k);
  }
};

var argsArray = function(obj){
    if (!obj) return [];
    if (Array.isArray(obj)) return slice.call(obj);
    var args = [];
    objectEach(obj, function(v, k){
      args[k] = v;
    });
    return args;
  };

var arrLast = function(arr){
  return arr[arr.length-1];
};

var arrFlatten = function(input, output) {
  if (!output) output = [];
  for(var i = 0; i < input.length; i++){
    var value = input[i];
    if (Array.isArray(value)) {
        arrFlatten(value, output);
    } else {
      output.push(value);
    }
  }
  return output;
};


var UrlGrey = function(url){
  if (!url && isBrowser){
    url = window.location.href.toString();
  }
  this.url = url;
  this._parsed = null;
};

UrlGrey.prototype.parsed = function(){
  if (!this._parsed){
    this._parsed = urlParse(this.url);
    var defaults = getDefaults();
    var p = this._parsed;
    p.protocol = p.protocol || defaults.protocol;
    p.protocol = p.protocol.slice(0,-1);
    if (p.hash){
      p.hash = p.hash.substring(1);
    }
    p.username = ''; 
    p.password = '';
    if (p.protocol !== 'file'){
      p.port = parseInt(p.port, 10);
      if (p.auth){
        var auth = p.auth.split(':');
        p.username = auth[0]; 
        p.password = auth[1];
      }
    }
  }

  // enforce only returning these properties
  this._parsed = {
   protocol : this._parsed.protocol,
   auth:        this._parsed.auth,
   host:        this._parsed.host,
   port:        this._parsed.port,
   hostname:    this._parsed.hostname,
   hash:        this._parsed.hash,
   search:      this._parsed.search,
   query:       this._parsed.query,
   pathname:    this._parsed.pathname,
   path:        this._parsed.path,
   href:        this._parsed.href,
   username:    this._parsed.username,
   password:      this._parsed.password
  };


  return this._parsed;
};

UrlGrey.prototype.port = function(num){
  var hostname = this.parsed().hostname;

  // setter
  if (num){
    if (this.protocol() === 'file'){
      throw new Error("file urls don't have ports");
    }
    var obj = new UrlGrey(this.toString());
    obj.parsed().port = parseInt(num, 10);
    return obj;
  }

  // getter
  var output = this._parsed.port;
  if (!output){
      switch(this.protocol()){
        case 'http' : return 80;
        case 'https' : return 443;
        default : return null;
      }
  }
  return parseInt(output, 10);
};

UrlGrey.prototype.query = function(mergeObject){
  var path;
  if (mergeObject === false){
    // clear the query entirely if the input === false
    return this.queryString('');
  }
  
  var url = this.url;
  if (!mergeObject){
    var parsed = urlParse(url);
    if (!!parsed.search){
      var qstr = parsed.search.substring(1);
      var output = querystring.parse(qstr);

      return output;
    }
    return {};
  } else {
    // read the object out
    var oldQuery = querystring.parse(this.queryString());
    objectEach(mergeObject, function(v, k){
      if (v === null){
        delete oldQuery[k];
      } else {
        oldQuery[k] = v;
      }
    });
    var newString = querystring.stringify(oldQuery);
    return this.queryString(newString);
  }
};

  
UrlGrey.prototype.rawQuery = function(mergeObject){
  var path;
  if (mergeObject === false){
    // clear the query entirely if the input === false
    return this.queryString('');
  }
  
  var url = this.url;
  if (!mergeObject){
    var parsed = urlParse(url);
    if (!!parsed.search){
      var qstr = parsed.search.substring(1);
      return querystring.parse(qstr);
    }
    return {};
  } else {
    // read the object out
    var oldQuery = querystring.parse(this.queryString());
    objectEach(mergeObject, function(v, k){
      if (v === null){
        delete oldQuery[k];
      } else {
        oldQuery[k] = v;
      }
    });
    var pairs = [];
    objectEach(oldQuery, function(v, k){
      pairs.push(k + '=' + v);
    });
    var newString = pairs.join('&');

    return this.queryString(newString);
  }
};

addPropertyGetterSetter('protocol');
addPropertyGetterSetter('username');
addPropertyGetterSetter('password');
addPropertyGetterSetter('hostname');
addPropertyGetterSetter('hash');
// add a method called queryString that manipulates 'query'
addPropertyGetterSetter('query', 'queryString');  
addPropertyGetterSetter('pathname', 'path');  

UrlGrey.prototype.path = function(){
  var args = arrFlatten(argsArray(arguments));
  if (args.length !== 0){
    var obj = new UrlGrey(this.toString());
    var str = args.join('/');
    str = str.replace(/\/+/g, '/'); // remove double slashes
    str = str.replace(/\/$/, '');  // remove all trailing slashes
    args = str.split('/');
    for(var i = 0; i < args.length; i++){
      args[i] = encodeURIComponent(args[i]);
    }
    str = args.join('/');
    if (str[0] !== '/'){ str = '/' + str; }
    obj.parsed().pathname = str;
    return obj;
  }
  return this.parsed().pathname;
};

UrlGrey.prototype.rawPath = function(){
  var args = arrFlatten(argsArray(arguments));
  if (args.length !== 0){
    var obj = new UrlGrey(this.toString());
    var str = args.join('/');
    str = str.replace(/\/+/g, '/'); // remove double slashes
    str = str.replace(/\/$/, '');  // remove all trailing slashes
    if (str[0] !== '/'){ str = '/' + str; }
    obj.parsed().pathname = str;
    return obj;
  }
  return this.parsed().pathname;
};

UrlGrey.prototype.encode = function(str){
  return encodeURIComponent(str);
};

UrlGrey.prototype.decode = function(str){
  return decodeURIComponent(str);
};

UrlGrey.prototype.parent = function(){
  // read-only.  (can't SET parent)
  var pieces = this.path().split("/");
  var popped = pieces.pop();
  if (popped === ''){  // ignore trailing slash
    popped = pieces.pop();
  }
  if (!popped){
    throw new Error("The current path has no parent path");
  }
  return this.query(false).hash('').path(pieces.join("/"));
};

UrlGrey.prototype.rawChild = function(suffixes){
  if (suffixes){
    suffixes = argsArray(arguments);
    return this.query(false).hash('').rawPath(this.path(), suffixes);
  } else {
    // if no suffix, return the child
    var pieces = this.path().split("/");
    var last = arrLast(pieces);
    if ((pieces.length > 1) && (last === '')){
      // ignore trailing slashes
      pieces.pop();
      last = arrLast(pieces);
    }
    return last;
  }
};

UrlGrey.prototype.child = function(suffixes){
  suffixes = argsArray(arguments);
  if (suffixes.length > 0){
    return this.query(false).hash('').path(this.path(), suffixes);
  } else {
    // if no suffix, return the child
    var pieces = this.path().split("/");
    var last = arrLast(pieces);
    if ((pieces.length > 1) && (last === '')){
      // ignore trailing slashes
      pieces.pop();
      last = arrLast(pieces);
    }
    return last;
  }
};

UrlGrey.prototype.toJSON = function(){
  return this.toString();
};

UrlGrey.prototype.toString = function(){
  var p = this.parsed();
  var retval = this.protocol() + '://';
  if (this.protocol() !== 'file'){
    var userinfo = p.username + ':' + p.password;
    if (userinfo != ':'){
      retval += userinfo + '@';
    }
    retval += p.hostname;
    var port = portString(this);
    if (port !== ''){
      retval += ':' + port;
    }
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


var portString = function(o){
  if (o.protocol() === 'https'){
    if (o.port() === 443){
      return '';
    }
  }
  if (o.protocol() === 'http'){
    if (o.port() === 80){
      return '';
    }
  }
  return '' + o.port();
};


/*
UrlGrey.prototype.absolute = function(path){
  if (path[0] == '/'){
    path = path.substring(1);
  }
  var parsed = urlParse(path);
  if (!!parsed.protocol){  // if it's already absolute, just return it
    return path;
  }
  return this._protocol + "://" + this._host + '/' + path;
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
};*/

/*
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
*/

// TODO relative()  // takes an absolutepath and returns a relative one
// TODO absolute() // takes a relative path and returns an absolute one.



module.exports = function(url){ return new UrlGrey(url); };

function addPropertyGetterSetter(propertyName, methodName){
  if (!methodName){
    methodName = propertyName;
  }
  UrlGrey.prototype[methodName] = function(str){
    if (!!str || str === ''){
      var obj = new UrlGrey(this.toString());
      obj.parsed()[propertyName] = str;
      return obj;
    }
    return this.parsed()[propertyName];  
  };
}





},{"qs":3,"url":1}],3:[function(require,module,exports){
/**
 * Object#toString() ref for stringify().
 */

var toString = Object.prototype.toString;

/**
 * Object#hasOwnProperty ref
 */

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Array#indexOf shim.
 */

var indexOf = typeof Array.prototype.indexOf === 'function'
  ? function(arr, el) { return arr.indexOf(el); }
  : function(arr, el) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === el) return i;
      }
      return -1;
    };

/**
 * Array.isArray shim.
 */

var isArray = Array.isArray || function(arr) {
  return toString.call(arr) == '[object Array]';
};

/**
 * Object.keys shim.
 */

var objectKeys = Object.keys || function(obj) {
  var ret = [];
  for (var key in obj) ret.push(key);
  return ret;
};

/**
 * Array#forEach shim.
 */

var forEach = typeof Array.prototype.forEach === 'function'
  ? function(arr, fn) { return arr.forEach(fn); }
  : function(arr, fn) {
      for (var i = 0; i < arr.length; i++) fn(arr[i]);
    };

/**
 * Array#reduce shim.
 */

var reduce = function(arr, fn, initial) {
  if (typeof arr.reduce === 'function') return arr.reduce(fn, initial);
  var res = initial;
  for (var i = 0; i < arr.length; i++) res = fn(res, arr[i]);
  return res;
};

/**
 * Create a nullary object if possible
 */

function createObject() {
  return Object.create
    ? Object.create(null)
    : {};
}

/**
 * Cache non-integer test regexp.
 */

var isint = /^[0-9]+$/;

function promote(parent, key) {
  if (parent[key].length == 0) return parent[key] = createObject();
  var t = createObject();
  for (var i in parent[key]) {
    if (hasOwnProperty.call(parent[key], i)) {
      t[i] = parent[key][i];
    }
  }
  parent[key] = t;
  return t;
}

function parse(parts, parent, key, val) {
  var part = parts.shift();
  // end
  if (!part) {
    if (isArray(parent[key])) {
      parent[key].push(val);
    } else if ('object' == typeof parent[key]) {
      parent[key] = val;
    } else if ('undefined' == typeof parent[key]) {
      parent[key] = val;
    } else {
      parent[key] = [parent[key], val];
    }
    // array
  } else {
    var obj = parent[key] = parent[key] || [];
    if (']' == part) {
      if (isArray(obj)) {
        if ('' != val) obj.push(val);
      } else if ('object' == typeof obj) {
        obj[objectKeys(obj).length] = val;
      } else {
        obj = parent[key] = [parent[key], val];
      }
      // prop
    } else if (~indexOf(part, ']')) {
      part = part.substr(0, part.length - 1);
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
      // key
    } else {
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
    }
  }
}

/**
 * Merge parent key/val pair.
 */

function merge(parent, key, val){
  if (~indexOf(key, ']')) {
    var parts = key.split('[')
      , len = parts.length
      , last = len - 1;
    parse(parts, parent, 'base', val);
    // optimize
  } else {
    if (!isint.test(key) && isArray(parent.base)) {
      var t = createObject();
      for (var k in parent.base) t[k] = parent.base[k];
      parent.base = t;
    }
    set(parent.base, key, val);
  }

  return parent;
}

/**
 * Compact sparse arrays.
 */

function compact(obj) {
  if ('object' != typeof obj) return obj;

  if (isArray(obj)) {
    var ret = [];

    for (var i in obj) {
      if (hasOwnProperty.call(obj, i)) {
        ret.push(obj[i]);
      }
    }

    return ret;
  }

  for (var key in obj) {
    obj[key] = compact(obj[key]);
  }

  return obj;
}

/**
 * Restore Object.prototype.
 * see pull-request #58
 */

function restoreProto(obj) {
  if (!Object.create) return obj;
  if (isArray(obj)) return obj;
  if (obj && 'object' != typeof obj) return obj;

  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      obj[key] = restoreProto(obj[key]);
    }
  }

  obj.__proto__ = Object.prototype;
  return obj;
}

/**
 * Parse the given obj.
 */

function parseObject(obj){
  var ret = { base: {} };

  forEach(objectKeys(obj), function(name){
    merge(ret, name, obj[name]);
  });

  return compact(ret.base);
}

/**
 * Parse the given str.
 */

function parseString(str){
  var ret = reduce(String(str).split('&'), function(ret, pair){
    var eql = indexOf(pair, '=')
      , brace = lastBraceInKey(pair)
      , key = pair.substr(0, brace || eql)
      , val = pair.substr(brace || eql, pair.length)
      , val = val.substr(indexOf(val, '=') + 1, val.length);

    // ?foo
    if ('' == key) key = pair, val = '';
    if ('' == key) return ret;

    return merge(ret, decode(key), decode(val));
  }, { base: createObject() }).base;

  return restoreProto(compact(ret));
}

/**
 * Parse the given query `str` or `obj`, returning an object.
 *
 * @param {String} str | {Object} obj
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if (null == str || '' == str) return {};
  return 'object' == typeof str
    ? parseObject(str)
    : parseString(str);
};

/**
 * Turn the given `obj` into a query string
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

var stringify = exports.stringify = function(obj, prefix) {
  if (isArray(obj)) {
    return stringifyArray(obj, prefix);
  } else if ('[object Object]' == toString.call(obj)) {
    return stringifyObject(obj, prefix);
  } else if ('string' == typeof obj) {
    return stringifyString(obj, prefix);
  } else {
    return prefix + '=' + encodeURIComponent(String(obj));
  }
};

/**
 * Stringify the given `str`.
 *
 * @param {String} str
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyString(str, prefix) {
  if (!prefix) throw new TypeError('stringify expects an object');
  return prefix + '=' + encodeURIComponent(str);
}

/**
 * Stringify the given `arr`.
 *
 * @param {Array} arr
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyArray(arr, prefix) {
  var ret = [];
  if (!prefix) throw new TypeError('stringify expects an object');
  for (var i = 0; i < arr.length; i++) {
    ret.push(stringify(arr[i], prefix + '[' + i + ']'));
  }
  return ret.join('&');
}

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyObject(obj, prefix) {
  var ret = []
    , keys = objectKeys(obj)
    , key;

  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    if ('' == key) continue;
    if (null == obj[key]) {
      ret.push(encodeURIComponent(key) + '=');
    } else {
      ret.push(stringify(obj[key], prefix
        ? prefix + '[' + encodeURIComponent(key) + ']'
        : encodeURIComponent(key)));
    }
  }

  return ret.join('&');
}

/**
 * Set `obj`'s `key` to `val` respecting
 * the weird and wonderful syntax of a qs,
 * where "foo=bar&foo=baz" becomes an array.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {String} val
 * @api private
 */

function set(obj, key, val) {
  var v = obj[key];
  if (undefined === v) {
    obj[key] = val;
  } else if (isArray(v)) {
    v.push(val);
  } else {
    obj[key] = [v, val];
  }
}

/**
 * Locate last brace in `str` within the key.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function lastBraceInKey(str) {
  var len = str.length
    , brace
    , c;
  for (var i = 0; i < len; ++i) {
    c = str[i];
    if (']' == c) brace = false;
    if ('[' == c) brace = true;
    if ('=' == c && !brace) return i;
  }
}

/**
 * Decode `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function decode(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (err) {
    return str;
  }
}

},{}]},{},[2])
(2)
});
;