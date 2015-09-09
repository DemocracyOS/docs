var url = require('url')
var marked = require('marked')

var renderer = new marked.Renderer()


/**
 * Replace '.md' on links with '.html'
 */
var _link = renderer.link
var isMd = /.md$/
renderer.link = function (href, title, string){
  var u = url.parse(href)
  if (!u.host && isMd.test(u.pathname)){
    u.pathname = u.pathname.replace(isMd, '.html')
    href = url.format(u)
  }

  return _link.call(renderer, href, title, string)
}

module.exports = renderer
