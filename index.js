var options = require('commander')
var metalsmith = require('metalsmith')
var browserSync = require('metalsmith-browser-sync')
var branch = require('metalsmith-branch')
var markdown = require('metalsmith-markdown')
var fingerprint = require('metalsmith-fingerprint')
var layouts = require('metalsmith-layouts')
var stylus = require('metalsmith-stylus')
var permalinks = require('metalsmith-permalinks')
var navigation = require('metalsmith-navigation')
var nib = require('nib')
var addFiles = require('./plugins/add-files')
var navigationTree = require('./plugins/navigation-tree')

options
  .option('-w, --watch', 'Serve and watch files.')
  .option('-P, --pretty', 'Compile pretty assets.')
  .parse(process.argv)

// Add stylus css Files, fingerprinted to bust cache.
var css = branch()
  .use(addFiles('assets/css/index.styl'))
  .pattern('assets/css/index.styl')
  .use(stylus({
    compress: !options.pretty,
    use: [nib()]
  }))
  .use(fingerprint({pattern: ['assets/css/index.css']}))

// Proccess Docs files and add the layout
var views = branch('**/*.md')
  .use(markdown({
    smartypants: true,
    gfm: true,
    tables: true
  }))
  .use(navigation({
    sidebar: {
      includeDirs: true
    }
  }))
  .use(layouts({
    engine: 'jade',
    pretty: options.pretty,
    directory: './assets',
    default: 'layout.jade'
  }))
  // .use(permalinks())
  // .use(navigationTree())

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
