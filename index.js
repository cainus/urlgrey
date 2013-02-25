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

var UrlGrey = function(url){
  this.url = url;
};

// TODO write part
UrlGrey.prototype.query = function(mergeObject){
  // TODO if mergeObject === false, clear the query entirely (see queryClear)
  var url = this.url;
  if (mergeObject){
    var parsed = nodeUrl.parse(url);
    if (!!parsed.search){
      var qstr = parsed.search.substring(1);
      return querystring.parse(qstr);
    }
    return {};
  } else {
    var oldQuery = this.query(url);
    _.each(mergeObject, function(v, k){
      if (v === null){
        delete oldQuery[k];
      } else {
        oldQuery[k] = v;
      }
    });
    var path = this.parse(url).pathname;
    return this.absolute(path + this.queryString(oldQuery));
  }
  // TODO: modify the url in place?  return the new one?  return an urlgrey object?
};

/* TESTS
  UrlGrey("http://asdf.com").query({asdf:1234}).toString().should.equal("http://asdf.com?asdf=1234");
  UrlGrey("http://asdf.com?asdf=5678").query({asdf:1234}).toString().should.equal("http://asdf.com?asdf=1234");
  UrlGrey("http://asdf.com?asdf=5678").query(false).toString().should.equal("http://asdf.com");
  UrlGrey("http://asdf.com?asdf=5678").query().should.eql({asdf:5678});
*/

UrlGrey.prototype.queryClear = function(url){
  url = this.url;
  var path = this.parse(url).pathname;
  return this.absolute(path);
};

// TODO: make this readable/writable, but just as a string (no object)
UrlGrey.prototype.queryString = function(obj){
  var that = this;
  var pairs = _.map(obj, function(v, k){
    return that.urlEncode(k) + '=' + that.urlEncode(v);
  });
  return '?' + pairs.join('&');
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
  return this.url;
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

module.exports = UrlGrey;


var urlgrey = new UrlGrey("http://username:password@asdf.com:8080/path/is/here?sdf=qwer&qwer=1234#hashtag");




