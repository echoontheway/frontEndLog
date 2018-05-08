const toString = Object.prototype.toString
/**客户端时间*/
Date.now = Date.now || function now() {
    return new Date().getTime();
}

/**
 * @description 判断值类型
 * @param {string} type 类型
 */
const isType = function(type){
    return function(obj){
        return toString.call(obj).slice(8, -1) === type
    }
}
/**
 * @description stringify每一个value
 * @param {*} obj 
 */
const stringifyEach=function(obj) {
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
 * @description 获取cookie
 * @param {string} key 
 */
const getCookie = function(key){
    const reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)")
    const arr = document.cookie.match(reg)
    if (arr) {
        return arr[2]
    }
}
/**
 * @description 设置cookie
 * @param {string} key 
 * @param {string} value 
 * @param {number} maxAge 
 */
const setCookie = function(key,value,maxAge){
    let expiresStr = ''
    if (maxAge >= 0) {
        expiresStr = ' ;expires=' + new Date((Date.now()+maxAge)).toUTCString()
    }
    document.cookie = `${key}=${encodeURIComponent(value)}${expiresStr}`
}

export {
    stringifyEach,
    getCookie,
    setCookie,
    isType
}