var options = require('commander')
var metalsmith = require('metalsmith')
var addFiles = require('./plugins/addFiles')
var browserSync = require('metalsmith-browser-sync')
var branch = require('metalsmith-branch')
var markdown = require('metalsmith-markdown')
var fingerprint = require('metalsmith-fingerprint')
var layouts = require('metalsmith-layouts')
var rename = require('metalsmith-rename')
var stylus = require('metalsmith-stylus')
var nib = require('nib')

options
  .option('-w, --watch', 'Serve and watch files.')
  .option('-P, --pretty', 'Compile pretty assets.')
  .parse(process.argv)


// Add stylus css Files, fingerprinted to bust cache.
var css = branch()
  .use(addFiles('assets/styles.styl'))
  .pattern('assets/styles.styl')
  .use(stylus({
    compress: !options.pretty,
    use: [nib()]
  }))
  .use(fingerprint({pattern: ['assets/styles.css']}))

// Proccess Docs files and add the layout
var views = branch('**/*.md')
  .use(markdown({
    smartypants: true,
    gfm: true,
    tables: true
  }))
  .use(layouts({
    engine: 'jade',
    pretty: options.pretty,
    directory: './assets',
    default: 'layout.jade'
  }))

var build = metalsmith(__dirname)
  .source('app/docs')
  .destination('build')
  .use(css)
  .use(views)

if (options.watch) build
  .destination('.tmp')
  .use(browserSync({
    server: '.tmp',
    files: ['app/docs/**/*', 'assets/**/*']
  }))

build.build(function(err){ if (err) throw err; })
