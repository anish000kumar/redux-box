function * gen() {
    for (let i = 0 ; i < 3 ; i++) yield i;
}
const myGen = gen()

let sum = 0
let x = myGen.next().value;
while(x){
	sum += x
}
console.log(sum)