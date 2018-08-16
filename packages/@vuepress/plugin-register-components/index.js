const fs = require('fs-extra')
const path = require('path')
const globby = require('globby')

function fileToComponentName (file) {
  return file
    .replace(/\/|\\/g, '-')
    .replace(/\.vue$/, '')
}

async function resolveComponents (componentDir) {
  if (!fs.existsSync(componentDir)) {
    return
  }
  return (await globby(['**/*.vue'], { cwd: componentDir }))
}

module.exports = (options, context) => ({
  async enhanceAppFiles () {
    const { componentsDir = [], components = [] } = options
    const baseDirs = Array.isArray(componentsDir) ? componentsDir : [componentsDir]

    function importCode (name, absolutePath) {
      return `Vue.component(${JSON.stringify(name)}, () => import(${JSON.stringify(absolutePath)}))`
    }

    function genImport (baseDir, file) {
      const name = fileToComponentName(file)
      const absolutePath = path.resolve(baseDir, file)
      const code = importCode(name, absolutePath)
      return code
    }

    let code = ''

    // 1. Register components in specified directories
    for (const baseDir of baseDirs) {
      const files = await resolveComponents(baseDir) || []
      code += files.map(file => genImport(baseDir, file)).join('\n') + '\n'
    }

    // 2. Register named componepackages/docs/docs/.vuepress/componentsnts.
    code += components.map(({ name, path: absolutePath }) => importCode(name, absolutePath))

    code = `import Vue from 'vue'\n` + code + '\n'

    return [
      {
        name: 'global-components.js',
        content: code
      }
    ]
  }
})
