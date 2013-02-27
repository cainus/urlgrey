var nodeUrl = require('url');
var querystring = require('querystring');
var _ = require('underscore');

// goals: make this work in the browser (steal node code for 'url' and 'querystring' modules?
// read and write through same method if possible
// return UrlGrey object where useful for chaining purposes

var UrlGrey = function(url){
  this.url = url;
  this._parsed = null;
};

UrlGrey.prototype.parsed = function(){
  if (!this._parsed){
    this._parsed = nodeUrl.parse(this.url);
    var p = this._parsed;
    if (p.protocol){
      p.protocol = p.protocol.slice(0,-1);
    } else {
      p.protocol = 'http';
    }
    if (p.hash){
      p.hash = p.hash.substring(1);
    }
    p.username = ''; 
    p.password = '';
    if (!p.hostname){
      p.hostname = 'localhost';
    }
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

UrlGrey.prototype.path = function(){
  var args = _.toArray(arguments);
  if (args.length !== 0){
    var str = _.flatten(args).join('/');
    str = str.replace(/\/+/g, '/'); // remove double slashes
    str = str.replace(/\/$/, '');  // remove all trailing slashes
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

UrlGrey.prototype.encode = function(str){
  return querystring.escape(str);
};

UrlGrey.prototype.decode = function(str){
  return querystring.unescape(str);
};

UrlGrey.prototype.parent = function(){
  // read-only.  (can't SET parent)
  var pieces = this.path().split("/");
  pieces.pop();
  this.path(pieces.join("/"));
  return this;
};

UrlGrey.prototype.child = function(suffix){
  if (suffix){
    this.path(this.path() + '/' + suffix);
    return this;
  } else {
    // if no suffix, return the child
    return _.last(this.path().split("/"));
  }
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
  var p = this.parsed();
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


// TODO relative()  // takes an absolutepath and returns a relative one
// TODO absolute() // takes a relative path and returns an absolute one.



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
