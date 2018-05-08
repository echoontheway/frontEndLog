/**
 * 前端埋点类型
 * 1.页面稳定性日志 – 页面加载和页面交互产生的js error
 * 2.用户行为日志 - 点击、hover等
 * 3.访问统计日志 – PV/UV
 * 4.接口调用日志 – 接口调用是否成功
 * 5.页面性能日志 – 页面连接耗时、首次渲染时间、资源加载耗时等
 * 6.自定义上报日志 – 某些业务逻辑的结果、展示、点击等自定义内容
 * mode
 * 1.dev:log&&print,开发模式或者querystring上含有log
 * 2.prod:log,生产模式
 * 3.close(default):no log&&no print,生产模式
 */
import {stringifyEach,isType,getCookie,setCookie} from'./util'

export default class log{
    constructor(props) {
        this.mode = props&&props.mode || ~location.search.indexOf('log')&&'dev' ||'close'
        this.data = {
            error:[],
            action:[],
            visit:{},
            request:[],
            perforemance:[],
            customized:[]
        }
        this.proxyData()
        this.logVisit()
        this.catchMethod = this.catchMethod.bind(this)
        this.catchClass = this.catchClass.bind(this)
        this.addError = this.addError.bind(this)
        this.errorTransAndAdd = this.errorTransAndAdd.bind(this)
        this.trackAction = this.trackAction.bind(this)
        window.onerror = this.onerror.bind(this) 
    }

    /**@description PV*/
    logVisit(){
        this.data.visit.pvid = getCookie('pvid') //'vid.sid',用于标识一次PV的ID。该ID在同一会话的同一次访问中惟一,vid标志终端设备,sid为会话id
        this.plusSid()
    }

    /**@description 同一设备有新的访问，则将sid+1*/
    plusSid(){
        setCookie('pvid',(this.data.visit.pvid||'').replace(/\d+$/,n=>+n+1),365*24*60*60*1000)
    }

    /**
     * @description 监听data，dev模式下在控制台打印出log
     */
    proxyData(){
        if(this.mode!=='dev'){
            return
        }
        const methodMap = {
            action:'log',
            error:'error'
        }
        Object.keys(this.data).forEach(type=>{
            this.data[type] = new Proxy(this.data[type],{
                set:function(target,key,value,receiver){
                    if(key!=='length'){
                        console[methodMap[type]||'log'](type,':',value);   
                    }
                    return Reflect.set(target, key, value, receiver);
                }
            })
        })
    }

    /**
     * @description 全局捕获的错误,uncaught error
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
     * @description 收集类的方法的报错信息
     * @param {object} target 类的原型对象
     * @param {string} name 方法名
     * @param {object} descriptor 描述子
     */
    catchMethod(target, name, descriptor){
        if(this.mode === 'close'){
            return descriptor
        }
        let method = descriptor.value
        let self = this //log
        descriptor.value = function(...args){
            try{
                return method.apply(this, args) //this为方法执行时的所在对象
            }catch(e){
                self.errorTransAndAdd(e)
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
        if(this.mode === 'close'){
            return
        }
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
                        return f.apply(this,args)
                    }catch(e){
                        self.errorTransAndAdd(e)  
                    }
                }
            }
        }
    }
    /**
     * @description 对error进行解析并存入
     * @param {Error} e 
     */
    errorTransAndAdd(e){
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
            stack:stack.replace(/\n/g,'\\n'),
            time:+new Date()
        })
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
            if(self.mode === 'close'){
                return descriptor
            }
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
}