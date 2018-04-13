import log from './src/index'

test('log.catchMethod should catch and log the error in a method of class', () => {
    class Animal{
        constructor(name){
            this.name = name
        }
        @log.catchMethod
        feed(food){
            throw new Error('method error')
        }
    }
    const cat = new Animal('cat')
    cat.feed('fish')

    const error = log.data.error.find(item=>item.message==='method error')
    expect(error).toBeTruthy()
})


test('log.catchClass should catch and log the error in methods of class', () => {
    @log.catchClass
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
    expect(log.data.error.map((item)=>item.message)).toContain('method feed error')
    expect(log.data.error.map((item)=>item.message)).toContain('method jump error')
})

test('log.trackAction should log the action when induce', () => {
    class Animal{
        constructor(name){
            this.name = name
        }
        @log.trackAction('feedCat')
        feed(food){
        }
    }
    const cat = new Animal('cat')
    cat.feed('fish')

    expect(log.data.action.map((item)=>item.message)).toContain('feedCat')
})