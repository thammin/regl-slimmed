var extend = require('../lib/util/extend')
var createContext = require('./util/create-context')
var createREGL = require('../regl')
var tape = require('tape')

tape('scissor', function (t) {
  var gl = createContext(16, 16)
  var regl = createREGL(gl)

  function testFlags (prefix, flags) {
    t.equals(gl.getParameter(gl.SCISSOR_TEST), flags.enable, prefix + ' enable')

    var box = gl.getParameter(gl.SCISSOR_BOX)
    var fbox = flags.box
    if ('x' in fbox) {
      t.equals(box[0], fbox.x, 'box.x')
    } else {
      t.equals(box[0], 0, 'box.x')
    }
    if ('y' in fbox) {
      t.equals(box[1], fbox.y, 'box.y')
    } else {
      t.equals(box[1], 0, 'box.y')
    }
    if ('w' in fbox) {
      t.equals(box[2], fbox.w, 'box.w')
    } else {
      t.equals(box[2], gl.drawingBufferWidth - box[0], 'box.w')
    }
    if ('h' in fbox) {
      t.equals(box[3], fbox.h, 'box.h')
    } else {
      t.equals(box[3], gl.drawingBufferHeight - box[1], 'box.h')
    }
  }

  var permutations = [
    {
      enable: true,
      box: {
      }
    },
    {
      enable: false,
      box: {
        x: 5,
        y: 1
      }
    },
    {
      enable: false,
      box: {
        w: 10,
        h: 10
      }
    }
  ]

  var staticOptions = {
    frag: [
      'precision mediump float;',
      'uniform vec4 color;',
      'void main() {',
      '  gl_FragColor = vec4(1, 0, 0, 1);',
      '}'
    ].join('\n'),

    vert: [
      'precision mediump float;',
      'attribute vec2 position;',
      'void main() {',
      '  gl_Position = vec4(position, 0, 1);',
      '}'
    ].join('\n'),

    attributes: {
      position: regl.buffer([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [1, 0],
        [1, 1]
      ])
    },

    count: 6
  }

  var dynamicDraw = regl(extend({
    scissor: {
      enable: regl.prop('enable'),
      box: regl.prop('box')
    }
  }, staticOptions))

  permutations.forEach(function (params) {
    dynamicDraw(params)
    testFlags('dynamic 1-shot - ', params)
  })

  permutations.forEach(function (params) {
    dynamicDraw([params])
    testFlags('batch - ', params)
  })

  permutations.forEach(function (params) {
    var staticDraw = regl(extend({
      scissor: params
    }, staticOptions))
    staticDraw()
    testFlags('static - ', params)
  })

  regl.destroy()
  t.end()
})
