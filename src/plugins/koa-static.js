const path = require('path')
const mime = require('mime')
const fs = require('fs').promises
let { createReadStream } = require('fs')
module.exports = (root) => {
  return async(ctx,next) => {
    let absPath = path.join(root,ctx.path)    
    try {
      let stat = await fs.stat(absPath)
      if(stat.isDirectory()){
        absPath = path.join(absPath,'index.html')
        await fs.access(absPath)
      }
      ctx.set('Content-Type',mime.getType(absPath)+';charset=utf-8')
      ctx.body = createReadStream(absPath)
    } catch (err) {
      await next()
    }

  }
}
