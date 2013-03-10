urlgrey
=======

Urlgrey is a library for url manipulation.  It's got a fluent interface
like jquery for reading and setting parts of a url.

The urlgrey object has a chainable/fluent interface that makes a number of methods available for 
querying different aspects the input url, and even modifying it to create new urls.

Most methods are named after different parts of the url and allow you to read that part from the 
current url if you don't pass any parameters, or they allow you to generate a new url with a 
change to that part in the current url if you do pass a parameter.

For the examples below, we'll use the following url:
```
https://user:pass@subdomain.asdf.com/path/kid?asdf=1234#frag
```
Here are example usages:

```
req.uri.child([lastPart])
```
Setter/getter for the last part of a path:
```javascript
  req.uri.child(); // returns "kid" 
  req.uri.child("grandkid"); // returns a new uri object with the uri 
                             // https://user:pass@subdomain.asdf.com/path/kid/grandkid?asdf=1234#frag
```   
see also: req.uri.parent(), req.uri.path().
req.uri.decode(encodedString);
Returns the decoded version of the input string using node's standard querystring.unescape().
```javascript
      req.uri.decode('this%20is%20a%20test');  // returns "this is a test"
```   
    
see also: req.uri.encode().
req.uri.encode(unencodedString);
Returns the encoded version of the input string using node's standard querystring.escape().
```javascript
      req.uri.encode('this is a test'); // returns 'this%20is%20a%20test'
```   
    
see also: req.uri.decode().
req.uri.hash([newHash])
Setter/getter for the url fragment/anchor/hash of a path.
```javascript
      req.uri.hash(); // returns 'frag'
      req.uri.hash("blah"); // returns a new uri object with the uri
                            // https://user:pass@subdomain.asdf.com/path/kid/?asdf=1234#blah
```   
req.uri.hostname([newHostname])
Setter/getter for the url hostname.
```javascript
      req.uri.hostname(); // returns 'subdomain.asdf.com'
      req.uri.hostname("geocities.com"); // returns a new uri object with the uri
                            // https://user:pass@geocities.com/path/kid/?asdf=1234#frag
```   
req.uri.parent();
Get the parent URI of the current URI. (This property is read-only).
```javascript
      req.uri.parent();  // returns a new uri object with the uri
                         // https://user:pass@subdomain.asdf.com/path/?asdf=1234#frag
```   
see also: req.uri.child(), req.uri.path().

req.uri.password([newPassword]);
Setter/getter for the password portion of the url.
```javascript
      req.uri.password(); // returns 'pass'
      req.uri.password("newpass"); // returns a new uri object with the uri
                            // https://user:newpass@subdomain.asdf.com/path/kid/?asdf=1234#frag
```   
see also: req.uri.username(),
req.uri.path([mixed]);
Setter/getter for the path portion of the url.
```javascript
      req.uri.path(); // returns '/path/kid'
      req.uri.path("newpath"); // returns a new uri object with the uri
                               // https://user:newpass@subdomain.asdf.com/newpath

      // ALSO, req.uri.path() can take arrays of strings as input as well:
      req.uri.path(['qwer', '/asdf'], 'qwer/1234/', '/1234/'); 
                      // this returns a new uri object with the uri
                      // https://user:newpass@subdomain.asdf.com/qwer/asdf/qwer/1234/1234
```   
    
Note: changing the path will remove the querystring and hash, since they rarely make sense on a new path.

see also: req.uri.child(), req.uri.parent().
req.uri.port([newPort]);
Setter/getter for the port portion of the url.
```javascript
      req.uri.port(); // returns 80
      req.uri.port(8080); // returns a new uri object with the uri
                          // https://user:pass@subdomain.asdf.com:8080/path/kid/?asdf=1234#frag
```   


req.uri.protocol([newProtocol]);


Setter/getter for the protocol portion of the url.
```javascript
      req.uri.protocol(); // returns 'https'
      req.uri.protocol("http"); // returns a new uri object with the uri
                                // http://user:pass@subdomain.asdf.com/path/kid/?asdf=1234#frag
```   
    


req.uri.query([mixed]);


Setter/getter for the querystring using javascript objects.
```javascript
      req.uri.query(); // returns {asdf : 1234}
      req.uri.query(false); // returns a new uri object with the querystring-free uri
                            // https://user:pass@subdomain.asdf.com/path/kid#frag
      req.uri.query({spaced : 'space test'})
                                // returns a new uri object with the input object serialized
                                // and merged into the querystring like so:
                                // https://user:pass@subdomain.asdf.com/path/kid/?asdf=1234&spaced=space%20test#frag
```   
    
NOTE: escaping and unescaping of applicable characters happens automatically. (eg " " to "%20", and vice versa)

NOTE: an input object will overwrite an existing querystring where they have the same names.

NOTE: an input object will remove an existing name-value pair where they have the same names and the value in the input name-value pair is null.

see also: req.uri.queryString(),



req.uri.queryString([newQueryString]);


Setter/getter for the querystring using a plain string representation. This is lower-level than $.req.query(), but allows complete control of the querystring.
```javascript
      req.uri.queryString(); // returns asdf=1234  (notice there is no leading '?')
      req.uri.queryString("blah"); // returns a new uri object with a new querystring
                            // https://user:pass@subdomain.asdf.com/path/kid?blah#frag
```   
    
NOTE: no escaping/unescaping of applicable characters will occur. This must be done manually.

see also: req.uri.query(),

req.uri.toJson();
Returns the json representation of the uri object, which is simply the uri as a string. The output is exactly the same as req.uri.toString(). This method is read-only.
```javascript
  req.uri.toJson(); 
  // returns "https://user:pass@subdomain.asdf.com/path/kid/?asdf=1234#frag"
```   
req.uri.toString();
Returns the string representation of the uri object, which is simply the uri as a string. This method is read-only.
```javascript
      req.uri.toString(); // returns
                        // "https://user:pass@subdomain.asdf.com/path/kid/?asdf=1234#frag"
```   
req.uri.username([newUsername])
Setter/getter for the username portion of the url.
```javascript
      req.uri.username(); // returns 'user'
      req.uri.username("newuser"); // returns a new uri object with the uri
                            // https://newuser:pass@subdomain.asdf.com/path/kid/?asdf=1234#frag
```   
see also: ```req.uri.password()```


