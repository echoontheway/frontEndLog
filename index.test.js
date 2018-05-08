import log from './src/index'

window.logger = new log({
    mode:'prod'
})

test('logger.catchMethod should catch and log the error in a method of class', () => {
    class Animal{
        constructor(name){
            this.name = name
        }
        @logger.catchMethod
        feed(food){
            throw new Error('method error')
        }
    }
    const cat = new Animal('cat')
    cat.feed('fish')

    const error = logger.data.error.find(item=>item.message==='method error')
    expect(error).toBeTruthy()
})


test('logger.catchClass should catch and log the error in methods of class', () => {
    @logger.catchClass
    class Animal{
        constructor(name){
            this.name = name
        }
        feed(food){
            throw new Error('method feed error')
        }
        jump(place){
            throw new Error('method jump error')
        }
    }
    const cat = new Animal('cat')
    cat.feed('fish')
    cat.jump('roof')
    expect(logger.data.error.map((item)=>item.message)).toContain('method feed error')
    expect(logger.data.error.map((item)=>item.message)).toContain('method jump error')
})

test('logger.trackAction should log the action when induce', () => {
    class Animal{
        constructor(name){
            this.name = name
        }
        @logger.trackAction('feedCat')
        feed(food){
        }
    }
    const cat = new Animal('cat')
    cat.feed('fish')

    expect(logger.data.action.map((item)=>item.message)).toContain('feedCat')
})