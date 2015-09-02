module.exports = function navigationTree(pattern) {
  return function (files, metalsmith, done) {
    var metadata = metalsmith.metadata()
    var tree = []

    console.log(files)

    return done()

    Object.keys(files).forEach(function(name){
      var file = files[name]
      if (!file.title) return

      var item = {
        url: file.path,
        title: file.title
      }

      var pathTree = file.path.split('/')
      pathTree.forEach(function(current, index){
        if (index){}
      })

      tree.push(item)
    })

    metadata.navigationTree = tree

    done()
  }
}

