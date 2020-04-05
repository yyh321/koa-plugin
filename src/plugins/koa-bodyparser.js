module.exports = () => {
  return async (ctx,next)=>{
     ctx.request.body = await new Promise((resolve,reject) => {
    let bufferArr = [] 
    ctx.req.on('data',(chunk) => {
      bufferArr.push(chunk)
     })

    ctx.req.on('end',() => {
      if(bufferArr.length ==0) resolve({})
     let str = Buffer.concat(bufferArr).toString()
     resolve(str)
    })
   })

   await next()
  }
}