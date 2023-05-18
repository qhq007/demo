function apply(Fn,obj,args){
    if(obj === undefined || obj === null){
        obj = globalThis;
    }
    obj.temp = Fn;
    const result = obj.temp(...args);
    delete obj.temp;
    return result;
}