module.exports = function browserify(opts) {
  return function (files, metalsmith, done) {
    if (!opts.entry) throw new Error('\'entry\' option required')
    if (!opts.outfile) throw new Error('\'outfile\' option required')

    var base = metalsmith.path()


  }
}
