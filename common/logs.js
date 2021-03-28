const log = console.log;
console.log = (...args) => log(new Date(), ...args);