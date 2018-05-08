/**
 * start:node toolbox/track.js
 */

 /**
  * @description 生产js错误栈源码映射
  * @param {string} mapFilePath sourcemap文件
  * @param {string} rawTrack 生产初始错误栈
  */
function track({mapFilePath,rawTrack}){
  const sourceMap = require('source-map');
  const fs = require('fs');
  const rawSourceMap = JSON.parse(fs.readFileSync(mapFilePath,'utf8'));
  
  console.log('%s\n',rawTrack.split('\n')[0]);
  
  sourceMap.SourceMapConsumer.with(rawSourceMap,null,consumer=>{
    rawTrack.match(/\d+:\d+/g).forEach((item)=>{
      let [line,column] = item.split(':').map(str=>Number.parseInt(str))
      const {source,line:sl,column:sc,name} = consumer.originalPositionFor({
        line,
        column
      })
      console.log(`\tat ${name} \x1b[34m(${source.slice('11')}:${sl}:${sc})\x1b[0m \n`)
    })
  })
}


/**配置*/
track({
  mapFilePath:'./dist/main.js.map',
  rawTrack:"Error: method error from common class\n    at r.jump (https://echoontheway.github.io/frontEndLog/main.js:22:6223)\n    at r.e.(anonymous function) (https://echoontheway.github.io/frontEndLog/main.js:6:3547)\n    at l.catJump (https://echoontheway.github.io/frontEndLog/main.js:22:6605)\n    at Object.<anonymous> (https://echoontheway.github.io/frontEndLog/main.js:14:729)\n    at Object.invokeGuardedCallback (https://echoontheway.github.io/frontEndLog/main.js:14:796)\n    at Object.invokeGuardedCallbackAndCatchFirstError (https://echoontheway.github.io/frontEndLog/main.js:14:911)\n    at S (https://echoontheway.github.io/frontEndLog/main.js:14:2382)\n    at O (https://echoontheway.github.io/frontEndLog/main.js:14:2861)\n    at M (https://echoontheway.github.io/frontEndLog/main.js:14:3018)\n    at N (https://echoontheway.github.io/frontEndLog/main.js:14:2669)"
})


