var dir = './lib/';
if (process.env.URLGREY_COVERAGE){
  dir = './lib-cov/';
}

module.exports = require(dir + 'index');

