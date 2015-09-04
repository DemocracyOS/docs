var path = require('path')
var glob = require('glob')
var each = require('async').each

module.exports = function addSource(pattern) {
  return function (files, metalsmith, done) {
    var base = metalsmith.path()

    var newFiles = glob.sync(pattern, {
      nodir: true,
      nonull: false,
      cwd: base
    })

    each(newFiles, function(name, done){
      metalsmith.readFile(path.join(base, name), function(err, file){
        if (err) return done(err)
        files[name] = file
        done()
      })
    }, done)
  }
}
