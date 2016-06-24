!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.urlgrey=e():"undefined"!=typeof global?global.urlgrey=e():"undefined"!=typeof self&&(self.urlgrey=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Query String Utilities

var QueryString = exports;
var isString = require('../util').isString;
var isArray = require('../util').isArray;
var isBoolean = require('../util').isBoolean;
var isNumber = require('../util').isNumber;
var isObject = require('../util').isObject;
var isNull = require('../util').isNull;
var keys = require('../util').keys;
var map = require('../util').map;

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}


function charCode(c) {
  return c.charCodeAt(0);
}

QueryString.unescape = function(s) {
  return decodeURIComponent(s);
};


QueryString.escape = function(str) {
  return encodeURIComponent(str);
};

var stringifyPrimitive = function(v) {
  if (isString(v))
    return v;
  if (isBoolean(v))
    return v ? 'true' : 'false';
  if (isNumber(v))
    return isFinite(v) ? v : '';
  return '';
};


QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (isNull(obj)) {
    obj = undefined;
  }

  if (isObject(obj)) {
    return map(keys(obj), function(k) {
      var ks = QueryString.escape(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + QueryString.escape(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + QueryString.escape(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return QueryString.escape(stringifyPrimitive(name)) + eq +
         QueryString.escape(stringifyPrimitive(obj));
};

// Parse a key=val string.
QueryString.parse = QueryString.decode = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (!isString(qs) || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && isNumber(options.maxKeys)) {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    try {
      k = decodeURIComponent(kstr);
      v = decodeURIComponent(vstr);
    } catch (e) {
      k = QueryString.unescape(kstr, true);
      v = QueryString.unescape(vstr, true);
    }

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

},{"../util":4}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = { encode : function (s) { return s; } };
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

var isObject = require('../util').isObject;
var isString = require('../util').isString;
var keys = require('../util').keys;
var substr = require('../util').substr;

exports.parse = urlParse;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  var slashes;
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && substr(protocol, -1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"../util":4,"querystring":1}],3:[function(require,module,exports){
var urlParse = require('url').parse;
var querystring = require('querystring');
var isBrowser = (typeof window !== "undefined");

var getDefaults = function(){
  var defaultUrl = "http://localhost:80";
  if (isBrowser){
    defaultUrl = window.location.href.toString();
  }
  var defaults = urlParse(defaultUrl);
  return defaults;
};

if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

var isEmpty = function(val) {
  return val === null || val === undefined || val === false;
};

var objectEach = function(obj, cb){
  for (var k in obj){
    if (obj.hasOwnProperty(k)) {
      cb(obj[k], k);  
    }
  }
};

var argsArray = function(obj){
    if (!obj) { return []; }
    if (Array.isArray(obj)) { return obj.slice() ; }
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
  if (!output) { output = []; }
  for (var i = 0; i < input.length; i++){
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
    if (isBrowser){
      p.hostname = p.hostname || defaults.hostname;
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
   password:    this._parsed.password
  };


  return this._parsed;
};


UrlGrey.prototype.extendedPath = function(url){
  if (url){
    var p = urlParse(url);
    var obj = new UrlGrey(this.toString());
    if (p.hash){
      p.hash = p.hash.substring(1);
    }
    obj.parsed().hash = p.hash;
    obj.parsed().query = p.query;
    obj = obj.path(p.pathname);
    return obj;
  } else {
    var href = this.path();
    href += this.queryString() ? '?' + this.queryString() : '';
    href += this.hash() ? '#' + this.hash() : '';
    return href;
  }
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
  if (arguments.length === 0) {
    return querystring.parse(this.queryString());
  } else if (isEmpty(mergeObject)){
    return this.queryString('');
  } else {
    // read the object out
    var oldQuery = querystring.parse(this.queryString());
    objectEach(mergeObject, function(v, k){
      if (v === null || v === false){
        delete oldQuery[k];
      } else {
        oldQuery[k] = v;
      }
    });
    var newString = querystring.stringify(oldQuery);
    var ret = this.queryString(newString);
    return ret;
  }
};

  
UrlGrey.prototype.rawQuery = function(mergeObject){
  if (arguments.length === 0) {
    if (this.queryString().length === 0) { return {}; }
    
    return this.queryString().split("&").reduce(function(obj, pair) {
      pair = pair.split("=");
      var key = pair[0];
      var val = pair[1];
      obj[key] = val;
      return obj;
    }, {});
  } else if (isEmpty(mergeObject)){
    return this.queryString('');
  } else {
    // read the object out
    var oldQuery = querystring.parse(this.queryString());
    objectEach(mergeObject, function(v, k){
      if (v === null || v === false){
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
      args[i] = this.encode(args[i]);
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
  try {
    return encodeURIComponent(str);
  } catch (ex) {
    return querystring.escape(str);
  }
};

UrlGrey.prototype.decode = function(str){
  return decode(str);
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
  }

  // if no suffix, return the child
  var pieces = pathPieces(this.path());
  var last = arrLast(pieces);
  if ((pieces.length > 1) && (last === '')){
    // ignore trailing slashes
    pieces.pop();
    last = arrLast(pieces);
  }
  return last;
};

UrlGrey.prototype.toJSON = function(){
  return this.toString();
};

UrlGrey.prototype.toString = function(){
  var p = this.parsed();
  var retval = this.protocol() + '://';
  if (this.protocol() !== 'file'){
    var userinfo = p.username + ':' + p.password;
    if (userinfo !== ':'){
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

var pathPieces = function(path){
  var pieces = path.split('/');
  for(var i = 0; i < pieces.length; i++){
    pieces[i] = decode(pieces[i]);
  }
  return pieces;
};

var decode = function(str){
  try {
    return decodeURIComponent(str);
  } catch (ex) {
    return querystring.unescape(str);
  }
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
    if (isEmpty(str)){
      return this.parsed()[propertyName];  
    } else {
      var obj = new UrlGrey(this.toString());
      obj.parsed()[propertyName] = str;
      return obj;
    }
  };
}





},{"querystring":1,"url":2}],4:[function(require,module,exports){

var isObject = function (o){
  return (typeof o === "object") &&
         (o !== null) &&
         (Object.prototype.toString.call(o) === '[object Object]');
};
exports.isObject = isObject;
exports.isString = function(o){
  return Object.prototype.toString.call(o) === '[object String]';
};
exports.isArray = function(o){
  return Object.prototype.toString.call(o) === "[object Array]";
};
exports.isBoolean = function(o) {
  return typeof o === 'boolean';
};
exports.isNumber = function(o) {
  return typeof o === 'number' && isFinite(o);
};
exports.isNull = function(o) {
  return o === null;
};

exports.keys = function (object) {
  if (!isObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) { start = str.length + start; }

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) { return xs.map(fn); }
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

},{}]},{},[3])
(3)
});
;