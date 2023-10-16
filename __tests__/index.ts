import urlgrey from "../index"

describe("urlgrey", function () {
  describe("chainability", function () {
    it("doesn't over-write the original url", function () {
      const urlStr = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      const url = urlgrey(urlStr)

      expect(url.hostname("asdf.com")
        .toString()).toEqual("https://user:pass@asdf.com/path?asdf=1234#frag")
      url.port(8080)
      url.protocol("protocol")
      url.username("username")
      url.password("password")
      
      url.path("http")
      url.hash("http")
      url.queryString("http=1234")
      url.clearQuery()
      url.extendedPath("/asdf?qwer=asdf#swqertwert23")
      
      expect(url.toString()).toEqual(urlStr) // original object is unmodified
    })
  })

  describe("#toJSON", function () {
    it("returns the same thing as toString", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).toJSON()).toEqual(urlgrey(url).toString())
    })
  })

  describe("#hostname", function () {
    it("gets the hostname", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).getHostname()).toEqual("subdomain.asdf.com")
    })
    it("sets the hostname", function () {
      const url = "http://subdomain.asdf.com"
      const obj = urlgrey(url).hostname("blah")
      expect(obj.toString()).toEqual("http://blah")
    })
  })

  describe("#port", function () {
    it("gets the port", function () {
      const url = "https://user:pass@subdomain.asdf.com:9090"
      expect(urlgrey(url).getPort()).toEqual(9090)
    })
    it("gets a correct default port when it's missing", function () {
      const url = "https://user:pass@subdomain.asdf.com"
      expect(urlgrey(url).getPort()).toEqual(443)
    })
    it("omits the port when it's 80", function () {
      const url = "http://subdomain.asdf.com:9090"
      expect(urlgrey(url).port(80)
        .toString()).toEqual("http://subdomain.asdf.com")
    })
    it("sets the port", function () {
      const url = "https://subdomain.asdf.com"
      expect(urlgrey(url).port(9090)
        .toString()).toEqual("https://subdomain.asdf.com:9090")
    })
  })

  describe("#rawPath", function () {
    it("gets the path", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).getRawPath()).toEqual("/path")
    })
    it("sets the path", function () {
      const url = "https://subdomain.asdf.com"
      expect(urlgrey(url).rawPath("blah")
        .toString()).toEqual("https://subdomain.asdf.com/blah")
    })
    it("does not encode pieces of the path", function () {
      const url = "https://subdomain.asdf.com"
      expect(urlgrey(url).rawPath(["not encode here", "and/not/here"])
        .toString()).toEqual("https://subdomain.asdf.com/not encode here/and/not/here")
    })
    it("sets the path from an array of strings", function () {
      const url = "https://asdf.com"
      expect(urlgrey(url).rawPath(["qwer", "/asdf", "qwer/1234/", "/1234/"])
        .toString()).toEqual("https://asdf.com/qwer/asdf/qwer/1234/1234")
    })
  })

  describe("#path", function () {
    it("gets the path", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).getPath()).toEqual("/path")
    })
    it("sets the path", function () {
      const url = "https://subdomain.asdf.com"
      expect(urlgrey(url).path("blah")
        .toString()).toEqual("https://subdomain.asdf.com/blah")
    })
    it("url encodes pieces of the path, but not slashes", function () {
      const url = "https://subdomain.asdf.com"
      expect(urlgrey(url).path(["encode here", "but/not/here"])
        .toString()).toEqual("https://subdomain.asdf.com/encode%20here/but/not/here")
    })
    it("sets the path from an array of strings", function () {
      const url = "https://asdf.com"
      expect(urlgrey(url).path(["qwer", "/asdf", "qwer/1234/", "/1234/"])
        .toString()).toEqual("https://asdf.com/qwer/asdf/qwer/1234/1234")
    })
  })

  describe("#hash", function () {
    it("gets the hash", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).getHash()).toEqual("frag")
    })
    it("sets the hash", function () {
      const url = "https://subdomain.asdf.com"
      expect(urlgrey(url).hash("blah")
        .toString()).toEqual("https://subdomain.asdf.com#blah")
    })
  })

  describe("#password", function () {
    it("gets the password", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).getPassword()).toEqual("pass")
    })
    it("sets the password", function () {
      const url = "https://user:pass@subdomain.asdf.com"
      expect(urlgrey(url).password("blah")
        .toString()).toEqual("https://user:blah@subdomain.asdf.com")
    })
  })

  describe("#username", function () {
    it("gets the username", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).getUsername()).toEqual("user")
    })
    it("sets the username", function () {
      const url = "https://user:pass@subdomain.asdf.com"
      expect(urlgrey(url).username("blah")
        .toString()).toEqual("https://blah:pass@subdomain.asdf.com")
    })
  })

  describe("#parent", function () {
    it("returns the second-last item in the path if there is no input", function () {
      const url = "http://asdf.com/path/kid?asdf=1234#frag"
      expect(urlgrey(url).getParent()
        .toString()).toEqual("http://asdf.com/path")
    })
    it("ignores a trailing slash", function () {
      const url = "http://asdf.com/path/kid/?asdf=1234#frag"
      expect(urlgrey(url).getParent()
        .toString()).toEqual("http://asdf.com/path")
    })
    it("throws an exception when no parent path exists", function () {
      const url = "http://asdf.com/"
      try {
        urlgrey(url).getParent()
        fail("expected exception was not raised.")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (ex: any) {
        expect(ex.message).toEqual("The current path has no parent path")
      }
    })
  })

  describe("#extendedPath", function () {
    it("returns the part of the url after the host:port", function () {
      const url = "http://asdf.com:8080/path?asdf=1234#frag"
      expect(urlgrey(url).getExtendedPath()).toEqual("/path?asdf=1234#frag")
    })
    it("lets you set the part of the url after the host:port", function () {
      const url = "http://asdf.com:8080/path?asdf=1234#frag"
      expect(urlgrey(url).extendedPath("/asdf?qwer=1234#fraggle").toString())
        .toEqual("http://asdf.com:8080/asdf?qwer=1234#fraggle")
    })
  })

  describe("#rawChild", function () {
    it("returns a url with the given path suffix added", function () {
      const url = "http://asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).rawChild("{kid here}")
        .toString()).toEqual("http://asdf.com/path/{kid here}")
    })
    it("returns a url with the given path suffixes added, without escaping", function () {
      const url = "http://asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).rawChild(["{kid here}", "{and here}"])
        .toString()).toEqual("http://asdf.com/path/{kid here}/{and here}")
    })
  })

  describe("#getRawChild", function () {
    it("returns the last item in the path if there is no input", function () {
      const url = "http://asdf.com/path/kid?asdf=1234#frag"
      expect(urlgrey(url).getRawChild()).toEqual("kid")
    })
    it("ignores a trailing slash", function () {
      const url = "http://asdf.com/path/kid/?asdf=1234#frag"
      expect(urlgrey(url).getRawChild()).toEqual("kid")
    })
  })

  describe("#child", function () {
    it("returns a url with the given path suffix added", function () {
      const url = "http://asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).child("kid here")
        .toString()).toEqual("http://asdf.com/path/kid%20here")
    })
    it("returns a url with the given path suffixes added", function () {
      const url = "http://asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).child(["kid here", "and here"])
        .toString()).toEqual("http://asdf.com/path/kid%20here/and%20here")
    })
    it("returns a url with the given path suffix added even if it's 0", function () {
      const url = "http://asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).child(0)
        .toString()).toEqual("http://asdf.com/path/0")
    })
    it("returns the last item in the path if there is no input", function () {
      const url = "http://asdf.com/path/kid?asdf=1234#frag"
      expect(urlgrey(url).getChild()).toEqual("kid")
    })
    it("ignores a trailing slash", function () {
      const url = "http://asdf.com/path/kid/?asdf=1234#frag"
      expect(urlgrey(url).getChild()).toEqual("kid")
    })
    it("url-decodes the child if it's encoded", function () {
      const url = "http://asdf.com/path/the%20kid"
      expect(urlgrey(url).getChild()).toEqual("the kid")
    })
    it("url-encodes the child if necessary", function () {
      const url = "http://asdf.com/path/"
      expect(urlgrey(url).child("the kid").toString()).toEqual("http://asdf.com/path/the%20kid")
    })
  })

  describe("#parsed", function () {
    it("returns some stuff", function () {
      const url = "http://gdizzle:pazz@asdf.com:5678/path/kid/?asdf=1234#frag"
      const actual = urlgrey(url).parsed()
      const expected = {
        "protocol": "http",
        "auth": "gdizzle:pazz",
        "host": "asdf.com:5678",
        "port": 5678,
        "hostname": "asdf.com",
        "hash": "frag",
        "search": "?asdf=1234",
        "query": "asdf=1234",
        "pathname": "/path/kid/",
        "path": "/path/kid/?asdf=1234",
        "username": "gdizzle",
        "password": "pazz"
      }
      expect(actual).toEqual(expected)
    })
  })

  describe("#toString", function () {
    it("returns the input string if unmodified", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).toString()).toEqual(url)
    })
    it("returns an absolute uri even if one is not given", function () {
      const url = "/path?asdf=1234#frag"
      expect(urlgrey(url).toString()
      ).toMatch(/^http:\/\/|file:\/\//)
    })
  })

  describe("#protocol", function () {
    it("gets the protocol", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).getProtocol()).toEqual("https")
    })

    it("gets the protocol as http if unset", function () {
      const url = "/path?asdf=1234#frag"
      expect(urlgrey(url).getProtocol()).toEqual("http")
    })

    it("sets the protocol", function () {
      const url = "https://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      const expected = "http://user:pass@subdomain.asdf.com/path?asdf=1234#frag"
      expect(urlgrey(url).protocol("http").toString()).toEqual(expected)
    })
  })

  describe("#queryString", function () {
    it("sets the queryString", function () {
      const updated = urlgrey("http://s.asdf.com").queryString("foo=1234")

      expect(updated.toString()).toEqual("http://s.asdf.com?foo=1234")
      expect(updated.getQuery()).toEqual({ foo: "1234" })
    })
    it("changes the queryString", function () {
      const updated = urlgrey("http://s.asdf.com?foo=1234&bar=5678").queryString("baz=3456")

      expect(updated.toString()).toEqual("http://s.asdf.com?baz=3456")
      expect(updated.getQuery()).toEqual({ baz: "3456" })
    })
    it("gets the queryString", function () {
      expect(
        urlgrey("http://s.asdf.com/?qwer=1234").getQueryString()
      ).toEqual("qwer=1234")
    })
    it("'roundtrips' the queryString", function () {
      expect(urlgrey("http://s.asdf.com/?qwer=1234").queryString("asdf=1234")
        .getQueryString()).toEqual("asdf=1234")
    })

  })

  describe("#rawQuery", function () {
    it("adds a querystring", function () {
      const updated = urlgrey("http://asdf.com").rawQuery({ foo: "12 34" })

      expect(updated.toString()).toEqual("http://asdf.com?foo=12 34")
      expect(updated.getRawQuery()).toEqual({ foo: "12 34" })
    })
    it("appends a querystring", function () {
      const updated = urlgrey("http://asdf.com?foo=1234").rawQuery({ bar: "56 78" })

      expect(updated.toString()).toEqual("http://asdf.com?foo=1234&bar=56 78")
      expect(updated.getRawQuery()).toEqual({ foo: "1234", bar: "56 78" })
    })
    it("modifies a querystring", function () {
      const updated = urlgrey("http://asdf.com?foo=1234&bar=abcd").rawQuery({ foo: "56 78" })

      expect(updated.toString()).toEqual("http://asdf.com?foo=56 78&bar=abcd")
      expect(updated.getRawQuery()).toEqual({ foo: "56 78", bar: "abcd" })
    })
    it("clears a querystring", function () {
      const updated = urlgrey("http://asdf.com?foo=1234").rawQuery(false)

      expect(updated.toString()).toEqual("http://asdf.com")
      expect(updated.getRawQuery()).toEqual({})
    })
    it("clears an element of a querystring with null or false", function () {
      const updated = urlgrey("http://asdf.com")
        .rawQuery({ foo: 1, bar: 2, baz: 3 })
        .rawQuery({ foo: 0, bar: null })

      expect(updated.toString()).toEqual("http://asdf.com?foo=0&baz=3")
      expect(updated.getRawQuery()).toEqual({ foo: "0", baz: "3" })
    })
    it("extracts a querystring as an object", function () {
      const queryObject = urlgrey("http://asdf.com?asdf=56%2078").getRawQuery()
      expect(queryObject).toEqual({ asdf: "56%2078" })
    })
  })

  describe("#clearQuery", function () {
    it("clears a querystring", function () {
      const updated = urlgrey("http://asdf.com?foo=1234").clearQuery()

      expect(updated.toString()).toEqual("http://asdf.com")
      expect(updated.getQuery()).toEqual({ })
    })
  })

  describe("#query / #getQuery", function () {
    it("adds a querystring", function () {
      const updated = urlgrey("http://asdf.com").query({ foo: "12 34" })
      expect(updated.toString()).toEqual("http://asdf.com?foo=12+34")
      expect(updated.getQuery()).toEqual({ foo: "12 34" })
    })
    it("appends a querystring", function () {
      const updated = urlgrey("http://asdf.com?foo=1234").query({ bar: "56 78" })

      expect(updated.toString()).toEqual("http://asdf.com?foo=1234&bar=56+78")
      expect(updated.getQuery()).toEqual({ foo: "1234", bar: "56 78" })
    })
    it("modifies a querystring", function () {
      const updated = urlgrey("http://asdf.com?foo=1234&bar=abcd").query({ foo: "56 78" })

      expect(updated.toString()).toEqual("http://asdf.com?foo=56+78&bar=abcd")
      expect(updated.getQuery()).toEqual({ foo: "56 78", bar: "abcd" })

    })
    it("clears an element of a querystring with null or false", function () {
      const updated = urlgrey("http://asdf.com")
        .rawQuery({ foo: 1, bar: 2, baz: 3 })
        .rawQuery({ foo: 0, bar: null })
      expect(updated.toString()).toEqual("http://asdf.com?foo=0&baz=3")
      expect(updated.getQuery()).toEqual({ foo: "0", baz: "3" })
    })
    it("extracts a querystring as an object", function () {
      expect(urlgrey("http://asdf.com?asdf=56%2078").getQuery()).toEqual({ asdf: "56 78" })
    })
  })

  describe("#encode", function () {
    it("returns a url-encoded version of its input string", function () {
      expect(urlgrey("").encode("this is a test")).toEqual("this%20is%20a%20test")
    })
  })

  describe("#decode", function () {
    it("returns a url-decoded version of its input string", function () {
      expect(urlgrey("").decode("this%20is%20a%20test")).toEqual("this is a test")
    })
  })

})
