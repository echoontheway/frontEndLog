import log from './src/index'

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

test('log.catchMethod should catch and log the error in a method of class', () => {
    const error = log.data.error.find(item=>item.message==='method error')
    expect(error).toBeTruthy()
})