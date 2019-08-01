declare const $: (selector: string) => any;

console.log($('body'));

declare function jQuery (selector: string): any;
declare function jQuery (domReadyCallback: () => any): any;

console.log(jQuery('body'));
jQuery(function () {
    console.log('Dom Ready');
});

declare class Animal {
    name: string;
    constructor(name: string);
    sayHi(): string;
}

let p1 = new Animal('Tom');

declare enum Directions {
    Up,
    Down,
    Left,
    Right
}
