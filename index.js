module.exports = require('./lib/urlgrey');
if (process.env.URLGREY_COVERAGE){
  module.exports = require('./lib-cov/urlgrey');
}


