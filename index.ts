
type Dict<T> = Record<string, T>;
type PathPiece = string | number | Array<string | number>;

function lastItem<T>(arr: Array<T>): T {
  return arr[arr.length-1]
}

interface Parsed {
  auth: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  hash: string | null;
  search: string;
  pathname: string;
  port: number | null;  // some protocols have no port, like file://
  path: string;
  query: string;
  protocol: string;
}

function urlParse(href: string) {

  if (!href.includes("://")) {
    if (href.charAt(0) === "/") {
      href = "http://localhost/"
    }
    href = "http://" + href
  }
  
  const url = new URL(href)
  const colonFreeProtocol = url.protocol.substring(0, url.protocol.length -1)
  const hash = (url.hash && url.hash.charAt(0)) === "#" ? url.hash.substring(1) : url.hash

  const result: Parsed = {
    protocol: colonFreeProtocol,
    auth: `${url.username}:${url.password}`,
    username: url.username,
    password: url.password,
    host: url.host,
    hostname: url.hostname,
    hash,
    search: url.search,
    pathname: url.pathname,
    port: url.port ? parseInt(url.port, 10) : null,
    path: (url.pathname || "") + (url.search || ""),
    query: url.search ? url.search.slice(1) : url.search,
  }
  return result
}

const getDefaults = function () {
  const defaultUrl = "http://localhost:80"
  const defaults = urlParse(defaultUrl)
  return defaults
}

export class UrlGrey {
  #url: string
  _parsed: Parsed | null

  constructor(url: string) {
    this.#url = url
    this._parsed = null
  }

  parsed() {
    if (this._parsed) {
      return this._parsed
    }
    this._parsed = urlParse(this.#url)
    const defaults = getDefaults()
    
    this._parsed.protocol = this._parsed.protocol || defaults.protocol
    return this._parsed
  }

  getExtendedPath() {
    let href = this.getPath()
    href += this.getQueryString() ? "?" + this.getQueryString() : ""
    href += this.getHash() ? "#" + this.getHash() : ""
    return href
  }

  extendedPath(url: string) {
    const clone = this.clone()
    const p = urlParse(`http://localhost/${url}`)
    clone.parsed().hash = p.hash
    clone.parsed().query = p.query
    return clone.path(p.pathname)
  }

  port(num: number | string | null) {
    if (this.getProtocol() === "file") {
      throw new Error("file urls don't have ports")
    }
    const clone = this.clone()
    clone.parsed().port = parseInt(`${num}`, 10)
    return clone
  }

  getPort() {
    // getter
    const output = this.parsed().port
    if (output) return output
    switch (this.getProtocol()) {
    case "http":
      return 80
    case "https":
      return 443
    default:
      return null
    }
  }

  getQuery() {
    return qsParse(this.parsed().query)
  }

  clearQuery () {
    return this.queryString("")
  }

  query(mergeObject: Dict<string | number | null>) {
    // read the object out
    const oldQuery = qsParse(this.parsed().query)
    for (const [k, v] of Object.entries(mergeObject)) {
      if (v === null) {
        delete oldQuery[k]
      } else {
        oldQuery[k] = `${v}`
      }
    }
    const newString = new URLSearchParams(oldQuery).toString()
    return this.queryString(newString)
  }

  getRawQuery() {
    const qObj: Dict<string> = {}
    if (this.getQueryString().length === 0) {
      return qObj
    }

    return this.getQueryString()
      .split("&")
      .reduce(function (obj, pair) {
        const pieces = pair.split("=")
        const key = pieces[0]
        const val = pieces[1]
        obj[key] = val
        return obj
      }, qObj)
  }

  rawQuery(mergeObject: null | false | Dict<string | number | null>) {
    if (mergeObject === null || mergeObject === false) {
      return this.queryString("")
    }

    // read the object out
    const oldQuery = qsParse(this.parsed().query)
    for (const [k, v] of Object.entries(mergeObject)) {
      if (v === null) {
        delete oldQuery[k]
      } else {
        oldQuery[k] = `${v}`
      }
    }
    const pairs = []
    for (const [k, v] of Object.entries(oldQuery)) {
      pairs.push(k + "=" + v)
    }
    const newString = pairs.join("&")

    return this.queryString(newString)
  }

  getProtocol(): string {
    return this.parsed().protocol
  }

  protocol(str: string) {
    const clone = this.clone()
    clone.parsed().protocol = str
    return clone
  }
  getUsername(): string {
    return this.parsed().username
  }

  username(str: string) {
    const clone = this.clone()
    clone.parsed().username = str
    return clone
  }

  getPassword(): string {
    return this.parsed().password
  }

  password(str: string) {
    const clone = this.clone()
    clone.parsed().password = str
    return clone
  }
  getHostname(): string {
    return this.parsed().hostname
  }

  hostname(str: string) {
    const clone = this.clone()
    clone.parsed().hostname = str
    return clone
  }

  getHash(): string | null {
    return this.parsed().hash
  }

  hash(str: string) {
    const clone = this.clone()
    clone.parsed().hash = str
    return clone
  }
  
  getPath(): string {
    return this.parsed().pathname
  }
  path(input: PathPiece | PathPiece[]) {
    let args = Array.isArray(input) ? input.flat(5) : [input]
    let str = args.join("/")
    str = str.replace(/\/+/g, "/") // remove double slashes
    str = str.replace(/\/$/, "") // remove all trailing slashes
    args = str.split("/")
    for (let i = 0; i < args.length; i++) {
      args[i] = this.encode(`${args[i]}`)
    }
    str = args.join("/")
    if (str[0] !== "/") {
      str = "/" + str
    }
    const clone = this.clone()
    clone.parsed().pathname = str
    return clone
  }

  getQueryString(): string {
    return this.parsed().query
  }

  queryString(str: string) {
    const clone = this.clone()
    clone.parsed().query = str
    return clone
  }

  getRawPath() {
    return this.parsed().pathname
  }

  rawPath(input: PathPiece | PathPiece[]) {
    const args = Array.isArray(input) ? input.flat(5) : [input]
    let str = args.join("/")
    str = str.replace(/\/+/g, "/") // remove double slashes
    str = str.replace(/\/$/, "") // remove all trailing slashes
    if (str[0] !== "/") {
      str = "/" + str
    }
    this.parsed().pathname = str
    return this
  }

  encode(str: string) {
    try {
      return encodeURIComponent(str)
    } catch (ex) {
      return new URLSearchParams({"": str}).toString().slice(1)
    }
  }

  decode(str: string) {
    return decode(str)
  }

  clone() {
    return new UrlGrey(this.toString())
  }

  getParent() {
    const pieces = this.getPath().split("/")
    let popped = pieces.pop()
    if (popped === "") {
      // ignore trailing slash
      popped = pieces.pop()
    }
    if (!popped) {
      throw new Error("The current path has no parent path")
    }
    return this.clearQuery().hash("").path(pieces.join("/"))
  }

  getRawChild() {
    const pieces = this.getPath().split("/")
    
    let last = lastItem(pieces)
    
    if (pieces.length > 1 && last === "") {
      // ignore trailing slashes
      pieces.pop()
      last = lastItem(pieces)
    }
    return last
  }

  rawChild(suffixes: PathPiece | PathPiece[]) {
    return this.clearQuery()
      .hash("")
      .rawPath([this.getPath(), suffixes].flat(5))
  }

  getChild() {
    const pieces = pathPieces(this.getPath())
    
    let last = lastItem(pieces)
    if (pieces.length > 1 && last === "") {
      // ignore trailing slashes
      pieces.pop()
      last = lastItem(pieces)
    }
    return last
  }

  child(suffixes: PathPiece | PathPiece[]) {
    return this.clearQuery()
      .hash("")
      .path([this.getPath(), suffixes].flat(5))
  }

  toJSON() {
    return this.toString()
  }

  toString() {
    const p = this.parsed()
    
    let retval = p.protocol + "://"
    
    if (this.getProtocol() !== "file") {
      const userinfo = p.username + ":" + p.password
      if (userinfo !== ":") {
        retval += userinfo + "@"
      }
      retval += p.hostname
      const port = portString(this)
      
      if (port) {
        retval += ":" + port
      }
    }
    retval += this.getPath() === "/" ? "" : this.getPath()
    const qs = p.query
    if (qs) {
      retval += "?" + qs
    }
    if (p.hash) {
      retval += "#" + p.hash
    }
    return retval
  }
}

const pathPieces = function (path: string) {
  const pieces = path.split("/")
  for (let i = 0; i < pieces.length; i++) {
    pieces[i] = decode(pieces[i])
  }
  return pieces
}

const decode = function (str: string) {
  try {
    return decodeURIComponent(str)
  } catch (ex) {
    const val = new URLSearchParams(`=${str}`).get("")
    if (!val && val !== "") {
      throw new Error(`decode() input could not be decoded: ${str}`)
    }
    return val
  }
}

const portString = function (o: UrlGrey): string {
  const port = o.getPort()
  if (o.getProtocol() === "https") {
    if (port === 443) {
      return ""
    }
  }
  if (o.getProtocol() === "http") {
    if (port === 80) {
      return ""
    }
  }
  if (port || port === 0) return `${port}` 
  return ""
}

const qsParse = (qsStr: string) => {
  const params = new URLSearchParams(qsStr)
  const retval: Dict<string> = {}
  for (const param of params) {
    retval[param[0]] = param[1]
  }
  return retval
}

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

export default function urlgrey(url: string) {
  return new UrlGrey(url);
}

urlgrey.UrlGrey = UrlGrey;

// function addPropertyGetterSetter(propertyName: string, methodName?: string) {
//   if (!methodName) {
//     methodName = propertyName;
//   }
//   UrlGrey.prototype[methodName] = function (str) {
//     if (!str && str !== "") {
//       return this.parsed()[propertyName];
//     }

//     var obj = new UrlGrey(this.toString());
//     obj.parsed()[propertyName] = str;
//     return obj;
//   };
// }
