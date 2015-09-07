var browserify = require('browserify')
var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp');

module.exports = function _browserify(opts) {
  return function (files, metalsmith, done) {
    if (!opts.entries) throw new Error('\'entries\' required')
    if (!opts.outfile) throw new Error('\'outfile\' required')

    var base = metalsmith.path()
    var entries = opts.entries.map(function(e){ return path.join(base, e) })
    var dest = path.join(metalsmith.destination(), opts.outfile)
    var destFolder = path.dirname(dest)

    var bundle = browserify({
      debug: opts.debug,
      entries: entries,
      outfile: dest
    })

    if (opts.transforms) opts.transforms.forEach(function(t){
      bundle.transform(t)
    })

    // Sory, I promise to add promises.
    mkdirp(destFolder, function(err){
      if (err) throw err
      bundle.bundle(function(err, buffer) {
        if (err) throw err
        fs.writeFile(dest, buffer, function(err){
          if (err) throw err
          done()
        })
      })
    })
  }
}
