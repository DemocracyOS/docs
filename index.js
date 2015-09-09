var options = require('commander')
var nib = require('nib')
var metalsmith = require('metalsmith')
var browserSync = require('metalsmith-browser-sync')
var branch = require('metalsmith-branch')
var markdown = require('metalsmith-markdown')
var fingerprint = require('metalsmith-fingerprint')
var layouts = require('metalsmith-layouts')
var stylus = require('metalsmith-stylus')
var navigation = require('metalsmith-navigation')
var assets = require('metalsmith-assets')
var addFiles = require('./plugins/add-files')
var browserify = require('./plugins/browserify')
var renderer = require('./plugins/markdown-renderer')

options
  .option('-w, --watch', 'Serve and watch files.')
  .option('-P, --pretty', 'Compile pretty assets.')
  .parse(process.argv)

var js = branch()
  .use(browserify({
    debug: options.pretty,
    entries: ['assets/js/index.js'],
    outfile: 'assets/js/index.js',
    transforms: ['uglifyify']
  }))

var css = branch()
  .use(addFiles('assets/css/index.styl'))
  .pattern('assets/css/index.styl')
  .use(stylus({
    compress: !options.pretty,
    use: [nib()]
  }))
  .use(fingerprint({pattern: ['assets/css/index.css']}))

var img = branch()
  .use(assets({
    source: './assets/img',
    destination: './assets/img'
  }))

// Proccess Docs files and add the layout
var views = branch('**/*.md')
  .use(markdown({
    smartypants: true,
    gfm: true,
    tables: true,
    renderer: renderer
  }))
  .use(navigation({
    sidebar: {
      sortBy: function (node){ return node && node.position || 999 },
      includeDirs: true
    }
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
  .use(js)
  .use(css)
  .use(img)
  .use(views)

if (options.watch) build
  .destination('.tmp')
  .use(browserSync({
    server: '.tmp',
    files: ['app/docs/**/*', 'assets/**/*']
  }))

build.build(function(err){ if (err) throw err; })
