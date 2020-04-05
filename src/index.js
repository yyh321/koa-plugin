const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const static = require('./plugins/koa-static')
const koaBodyparser = require('./plugins/koa-bodyparser')
const app = new Koa()
app.use(koaBodyparser())
app.use(static(__dirname))
app.use(async (ctx,next)=>{
  console.log(ctx.path);
  
  if(ctx.path == '/form' && ctx.method === 'GET') {
    ctx.set('Content-Type','text/html;charset=utf-8')
    
    ctx.body = fs.createReadStream(path.resolve(__dirname,'index.html'))
  } else {
    await next()
  }
})

app.use((ctx,next) =>{
  if(ctx.path == '/form' && ctx.method == 'POST') {
    ctx.body = ctx.request.body
  }
})

app.listen(3001,() => {
  console.log('server is running ');
  
})
