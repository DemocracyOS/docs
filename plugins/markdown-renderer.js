var marked = require('marked')
var isAbsoluteUrl = require('is-absolute-url')

var renderer = new marked.Renderer()


/**
 * Replace '.md' on links with '.html'
 */
var _link = renderer.link
var isMd = /.md$/
renderer.link = function (href, title, string){
  if (!isAbsoluteUrl(href) && isMd.test(href)){
    href = href.replace(isMd, '.html')
  }

  return _link.call(renderer, href, title, string)
}

module.exports = renderer
