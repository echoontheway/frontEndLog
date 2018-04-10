/**
 * @description 前端日志收集 -辅助生产问题追踪&监控代码错误量
 * 第一大类：action 
 * -目标：收集用户的点击、hover行为
 * -实现：
 *      1.@trackActon 收集调用的类的方法名、参数、调用的时间，采用修改器实现非入侵式地收集
 * 第二大类：error
 * -目标：捕获代码运行时的抛错（message, stack,file, line, col）
 * -实现：
 *      -对于react的组件类（extends React.Component）
 *          1.errorBoundary 捕获组件constructor、render、生命周期方法中的错误(其中的异步回调的抛错无法捕获)
 *          2.@catchMethod  捕获单个方法的抛错，适用于event handler，采用修改器实现非入侵式地收集
 *      -对于普通类
 *          1.@catchClass 捕获类自身所有方法的抛错（不含constructor,不含继承的方法）,采用修改器实现非入侵式地收集
 *          2.@catchMethod 捕获单个方法的抛错（不含constructor），采用修改器实现非入侵式地收集
 *      -对于异步回调
 *          1.errorPre  手动catch后调用errorPre进行收集
 *            -promise 
 *            -async函数
 *            -setTimeout   
 *      -对于所有未捕获的抛错
 *          1.window.onerror 收集未捕获到抛错
 *            -非同源的js error需要配置：
 *            （1）<sript>标签内增加crossorigin属性 
 *            （2）支持cors的response头Access-Control-Allow-Origin
 *      
 */     


class log {
    constructor() {
        this.data = {
            action: [],
            error: []
        }
        this.trackAction = this.trackAction.bind(this)
        this.catchMethod = this.catchMethod.bind(this)
        this.catchClass = this.catchClass.bind(this)
        this.print = this.print.bind(this)
        this.addError = this.addError.bind(this)
        this.errorPre = this.errorPre.bind(this)
        window.onerror = this.onerror.bind(this) 
    }
    /**
     * @description 控制台打印收集信息
     * @param {string} type 
     */
    print(type){
        console.log(type?{[type]:this.data[type]}:this.data) 
    }

    /**
     * @description 全局捕获的错误
     * @param {string} message 
     * @param {string} file 
     * @param {number} line 
     * @param {number} col 
     * @param {Error} error 
     */
    onerror(message, file, line, col, error){
        this.addError({message,file,line,col,stack:error&&error.stack})
    }

    /**
     * @description 收集调用的类的方法名、参数、调用的时间
     * @param {string} message 附加信息
     * @param {object} target 类的原型对象
     * @param {string} name 方法名
     * @param {object} descriptor 描述子
     */
    trackAction(message){
        let self = this
        return function(target, name, descriptor){
            let method = descriptor.value
            descriptor.value = function (...rest) {
                self.data.action.push({
                    message,
                    classN:target.constructor.name,
                    methodN:name,
                    args: JSON.stringify(stringifyEach(rest.slice(0, -1))).slice(1, -1),
                    time: +new Date()
                })
                return method.apply(this, rest)
            }
            return descriptor
        }
    }
    /**
     * @description 收集类的方法的报错信息
     * @param {object} target 类的原型对象
     * @param {string} name 方法名
     * @param {object} descriptor 描述子
     */
    catchMethod(target, name, descriptor){
        let method = descriptor.value
        let self = this //log
        descriptor.value = function(...args){
            try{
                method.apply(this, args) //this为方法执行时的所在对象
            }catch(e){
                self.errorPre(e)
            }
        }
        return descriptor
    }
    /**
     * @description 捕获类中errorBoundary无法捕获的错误
     * @param {object} target 类的原型对象
     * @param {string} name 方法名
     * @param {object} descriptor 描述子
     */
    catchClass(target){
        let methods = Object.getOwnPropertyNames(target.prototype)
        let self = this
        for(let method of methods){
            if(['constructor'].includes(method)){
                continue
            }
            let f = target.prototype[method]
            if(isType('Function')(f)){
                target.prototype[method] = function(...args){
                    try{
                        f.apply(this,args)
                    }catch(e){
                        self.errorPre(e)  
                    }
                }
            }
        }
    }
    /**
     * @description 对error进行解析并存入
     * @param {Error} e 
     */
    errorPre(e){
        const {stack,message} = e 
        let col,line,file
        let tmp = (stack||'').match(/\((.+)\)/)
        if(tmp&&tmp.length&&tmp[1]){
            tmp = tmp[1].split(':')
            col = +(col || tmp.pop())
            line = +(line || tmp.pop())
            file = tmp.join(':')
        }
        this.addError({message,stack,file,line,col})
    }
    /**
     * @description 保存error信息
     * @param {Object} param
     */
    addError({message, stack,file, line, col}){
        this.data.error.push({
            message,
            file,
            line,
            col,
            stack,
            time:+new Date()
        })
    }
    
}

/**
 * @description stringify每一个value
 * @param {*} obj 
 */
function stringifyEach(obj) {
    if (isType('Array')(obj)||isType('Object')(obj)) {
        let target = isType('Object')(obj) ? {} : []
        let keys = Object.keys(obj)
        for (let key of keys) {
            target[key] = stringifyEach(obj[key])
        }
        return target
    }
    return obj + ''
}

/**
 * @description 判断值类型
 * @param {string} type 类型
 */
function isType(type){
    let toString = Object.prototype.toString
    return function(obj){
        return toString.call(obj).slice(8, -1) === type
    }
}


export default window.mylog  = new log()