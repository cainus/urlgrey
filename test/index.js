var should = require('should');
var urlgrey = require('../index');

describe("urlgrey", function(){
  describe("hostname", function(){
    it("gets the hostname", function(){
      var url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      urlgrey(url).hostname().should.equal('subdomain.asdf.com');
    });
    it("sets the hostname", function(){
      var url = "http://subdomain.asdf.com";
      urlgrey(url).hostname("blah")
        .toString().should.equal('http://blah');
    });
  });
  describe("port", function(){
    it("gets the port", function(){
      var url = "https://user:pass@subdomain.asdf.com:9090";
      urlgrey(url).port().should.equal(9090);
    });
    it("gets the port as 80 when it's missing", function(){
      var url = "https://user:pass@subdomain.asdf.com";
      urlgrey(url).port().should.equal(80);
    });
    it("omits the port when it's 80", function(){
      var url = "https://subdomain.asdf.com:9090";
      urlgrey(url).port(80)
        .toString().should.equal('https://subdomain.asdf.com');
    });
    it("sets the port", function(){
      var url = "https://subdomain.asdf.com";
      urlgrey(url).port(9090)
        .toString().should.equal('https://subdomain.asdf.com:9090');
    });
  });
  describe("path", function(){
    it("gets the path", function(){
      var url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      urlgrey(url).path().should.equal('/path');
    });
    it("sets the path", function(){
      var url = "https://subdomain.asdf.com";
      urlgrey(url).path("blah")
        .toString().should.equal('https://subdomain.asdf.com/blah');
    });
  });
  describe("hash", function(){
    it("gets the hash", function(){
      var url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      urlgrey(url).hash().should.equal('frag');
    });
    it("sets the hash", function(){
      var url = "https://subdomain.asdf.com";
      urlgrey(url).hash("blah")
        .toString().should.equal('https://subdomain.asdf.com#blah');
    });
  });
  describe("password", function(){
    it("gets the password", function(){
      var url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      urlgrey(url).password().should.equal('pass');
    });
    it("sets the password", function(){
      var url = "https://user:pass@subdomain.asdf.com";
      urlgrey(url).password("blah")
        .toString().should.equal('https://user:blah@subdomain.asdf.com');
    });
  });
  describe("username", function(){
    it("gets the username", function(){
      var url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      urlgrey(url).username().should.equal('user');
    });
    it("sets the username", function(){
      var url = "https://user:pass@subdomain.asdf.com";
      urlgrey(url).username("blah")
        .toString().should.equal('https://blah:pass@subdomain.asdf.com');
    });
  });
  describe("toString", function(){
    it("returns the input string if unmodified", function(){
      var url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      urlgrey(url).toString().should.equal(url);
    });
  });
  describe("protocol", function(){
    it("gets the protocol", function(){
      var url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      urlgrey(url).toString().should.equal(url);
    });
    it("sets the protocol", function(){
      var url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      var expected = "http://user:pass@subdomain.asdf.com/path?asdf=1234#frag";
      urlgrey(url).protocol('http').toString().should.equal(expected);
    });
  });

  describe("queryString", function(){
    it("sets the queryString", function(){
      urlgrey("http://s.asdf.com").queryString('asdf=1234')
        .toString().should.equal("http://s.asdf.com?asdf=1234");

    });
    it("updates the queryString", function(){
      urlgrey("http://s.asdf.com?asdf=1234").queryString('qwer=1235')
        .toString().should.equal("http://s.asdf.com?qwer=1235");

    });
    it("gets the queryString", function(){
      urlgrey("http://s.asdf.com/?qwer=1234").queryString()
        .should.equal("qwer=1234");
    });
    it("'roundtrips' the queryString", function(){
      urlgrey("http://s.asdf.com/?qwer=1234").queryString('asdf=1234')
        .queryString().should.equal("asdf=1234");

    });

  });
  describe("query", function(){
    it("adds a querystring", function(){
      urlgrey("http://asdf.com").query({asdf:'12 34'})
        .toString().should.equal("http://asdf.com?asdf=12%2034");
    });
    it("modifies a querystring", function(){
      urlgrey("http://asdf.com?asdf=5678&b=2").query({asdf:1234})
        .toString().should.equal("http://asdf.com?asdf=1234&b=2");
    });
    it("clears a querystring", function(){
      urlgrey("http://asdf.com?asdf=5678").query(false)
        .toString().should.equal("http://asdf.com");
    });
    it("extracts a querystring as an object", function(){
      urlgrey("http://asdf.com?asdf=5678").query()
        .should.eql({asdf:'5678'});
    });
  });

});
