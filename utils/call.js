// 改变函数this的指向并执行函数
function call(Fn,obj,...args){
    if(obj === undefined || obj === null){
        obj = globalThis;//全局对象,该属性在所有环境中可用
    }
    // 为obj添加临时的方法
    obj.temp = Fn;
    // 调用方法
    let result = obj.temp(...args);
    // 删除方法
    delete obj.temp;
    return result;
}