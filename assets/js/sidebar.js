var sensor = require('sensor').sensor
var Swipeit = require('swipeit')

var body = document.body
var sidebar = document.querySelector('[data-sidebar]')
var ham = document.querySelector('[data-sidebar-toggle]')

var showing = false

function show() {
  if (showing) return
  body.classList.add('sidebar-show')
  showing = true
}

function hide() {
  if (!showing) return
  body.classList.remove('sidebar-show')
  showing = false
}

function toggle() {
  showing ? hide() : show()
}

sensor(ham).on('click', function(e){
  e.preventDefault()
  toggle()
})

var swipe = new Swipeit(body)

swipe.on('west', function(data){
  show()
})

swipe.on('east', function(data){
  hide()
})

module.exports = {
  show: show,
  hide: hide,
  toggle: toggle
}
