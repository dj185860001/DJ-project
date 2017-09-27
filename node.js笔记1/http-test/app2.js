let http = require('http')//加载这个模块，我这个项目依赖于这个模块

//创建服务
//request response
let app = http.createServer((req,res)=>{
    //当有请求过来时候，会触发这个函数
    console.log('有请求过来了')
    //request 对象 保存的是请求的信息
    //response对象 保存的是响应的功能
    console.log(req)
    res.write('ok')//向客户端响应
})

app.listen(3000,()=>{
    console.log('服务启动了')
})