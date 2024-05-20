 import React, { Component } from 'react'
 import ReactDom from 'react-dom'
 //类
 class Vacation {
    constructor(destination, length){ //定义属性
      this.destination=destination;
      this.length=length;
    }
    print() { //定义方法
      console.log(`${this.destination} will take ${this.length} days`); 
    }
  }
 class Expedition extends Vacation {
   constructor(destination, length, gear){
     super(destination, length);
     this.gear=gear;
   }
   print() {
     super.print();
     console.log(`Bring your ${this.gear.join(' and your ')}`); 
   }
 } 
export const print=(message) => log(message, new Date());
export const log=(message, timestamp) => console.log(`${timestamp.toString()}: ${message}`);
export const freel= new Expedition('Mt. Freel', 3, ['water','snack']);
export const trip = (destination, days, gear) => { 
  let s=new Expedition(destination, days, gear);
  s.print();  
}



