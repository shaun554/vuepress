const path = require('path')

class SimpleLogPlugin {
  apply (compiler) {
    compiler.hooks.done.tap('simple-log', function () {
      console.log('\n\nDone!')
    })
  }
}

module.exports = (options, context) => ({
  name: 'test',

  clientRootMixin: path.resolve(__dirname, 'mixin.js'),

  async ready () {
    context.writeTemp('my-temp', 'A temp file generated by vuepress-plugin-test.')
  },

  extendPageData ({ content }) {
    return {
      size: (content.length / 1024).toFixed(2) + 'kb'
    }
  },

  enhanceAppFiles: [
    path.resolve(__dirname, 'enhanceApp.js'),
    {
      name: 'app.js',
      content: 'console.log("app")'
    }
  ],

  chainWebpack (config, isServer) {
    if (isServer) {
      config
        .plugin('copy')
        .tap(args => {
          args[0].push({
            from: path.resolve(context.sourceDir, '.vuepress/images'),
            to: path.resolve(context.outDir, 'images')
          })
          return args
        })
    }
    config
      .plugin('simple-log')
      .use(SimpleLogPlugin)
  },

  extendMarkdown (md) {
    // md.use()
  },

  enhanceDevServer (app) {
    const path = require('path')
    const mount = require('koa-mount')
    const serveStatic = require('koa-static')
    const imagePublicPath = path.resolve(context.sourceDir, '.vuepress/images')
    app.use(mount(path.join(context.publicPath, 'images'), serveStatic(imagePublicPath)))
  },

  async generated () {
    console.log('generated')
  },

  updated () {
    console.log('updated')
  },

  additionalPages () {
    return [
      {
        route: '/readme/',
        path: path.resolve(__dirname, '../../README.md')
      }
    ]
  },

  clientDynamicModules () {
    return {
      name: 'constans.js',
      content: `export const SOURCE_DIR = '${context.sourceDir}'`
    }
  }
})
