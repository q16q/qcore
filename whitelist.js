const { readFileSync, writeFileSync } = require("fs")

let absPath = partialAbs => __dirname.replaceAll('\\', '/') + '/' + partialAbs

let getWhitelist = () => {
    let content = readFileSync(absPath('configs/.whitelist'), 'utf-8')
    return content.split('\n')
}

let writeWhitelist = content => {
    writeFileSync(absPath('configs/.whitelist'), content.join('\n'))
}

module.exports = { absPath, getWhitelist, writeWhitelist }