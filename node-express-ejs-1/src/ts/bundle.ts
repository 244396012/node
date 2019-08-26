class Animal {
    name: string;
    age: number;
    weight: string
    constructor (name:string, age: number, weight: string){
        this.name = name;
        this.age = age;
        this.weight = weight;
    }
    say (){
        return 'My name is '+this.name + ', I am '+this.age+", and I am "+this.weight;
    }
}

class Dog extends Animal {
    private height: string;
    constructor(name:string, age: number, weight: string, height:string){
        super(name,age,weight);
        this.height = height;
    }
    bark (){
        console.log('汪汪汪');
    }
}

var d1 = new Dog('xiaogou', 12, '30KG','160cm');
console.log(d1.say());

d1.bark();