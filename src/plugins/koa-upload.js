const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid')
const mime = require('mime')

let app = new Koa()

Buffer.prototype.split = function (sep) {
  let len = Buffer.from(sep).length
  let offset = 0
  let currentIndex = 0

  let buf = []
  while (-1 != (currentIndex = this.indexOf(sep, offset))) {
    buf.push(this.slice(offset, currentIndex))
    offset = len + currentIndex
  }
  buf.push(this.slice(offset))
  return buf
}

app.use(async (ctx, next) => {
  if (ctx.path == '/form' && ctx.method == 'GET') {
    ctx.set('Content-Type', 'text/html;charset=utf-8')
    ctx.body = fs.createReadStream(path.join(__dirname, 'index.html'))
  } else {
    await next()
  }
})

app.use(async (ctx, next) => {
  ctx.body = await new Promise((resolve, reject) => {
    let bufferArr = []
    ctx.req.on('data', function (chunk) {
      bufferArr.push(chunk)
    })
    ctx.req.on('end', function () {
      let bufData = Buffer.concat(bufferArr)
      let boundary = '--' + ctx.get('content-type').split('=')[1]

      let lines = bufData.split(boundary).slice(1, -1) // 只保留中间的数据部分，去掉首尾2个
      let obj = {}
      lines.forEach((line) => {
        let [lineHead, ...body] = line.split('\r\n\r\n')
        let head = lineHead.toString()
        let key = head.match(/name="(.+?)"/)[1]
        if (lineHead.includes('uploadFile1')) {
          let fileContent = line.slice(lineHead.length + 4, -2)
          let filename = uuid.v4()
          fs.writeFileSync(filename, fileContent)
          obj[key] = {
            url: filename,
            size: fileContent.length,
          }
        } else {
          let value = Buffer.concat(body).toString()
          obj[key] = value.slice(0, -2)
        }
      })

      resolve(obj)
    })
  })

  await next()
})

app.listen(3002, () => {
  console.log('server is running ')
})
