const container = document.querySelector('.account');
const newDiv = document.createElement('div');

let _number:number = 10;
let _string:string = 'string';
let _boolean:boolean = true;
let _array:number[] = [1,2,3];

console.log(_number, _string, _boolean, _array);

interface Person {
    name: string,
    age: number
}

function getUser(person: Person){
    return 'Hello ' + person.name + ', you are ' + person.age;
}
let tempArr:any[] = [1, true, 'fine'];

// newDiv.innerHTML = getUser({name: 'Jack', age: 20});
// newDiv.innerHTML = JSON.stringify(tempArr)

function addNames(firstName:string, ...restOfName: string[]): string{
    return firstName + ' ' + restOfName.join(' ');
}
console.log(addNames('jack', 'tom', 'mary'));
container && container.appendChild(newDiv);

