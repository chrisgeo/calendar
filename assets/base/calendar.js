/**
 * calendar.js
 * This file contains the calendar object and it's associated functions
 * Copyright 2009 Chris George [chrisageorge@gmail.com]
**/

/*
An event that starts at 9:30am and ends at 11:30am

An event that starts at 6:00pm and ends at 7:00pm

An event that starts at 6:20pm and ends at 7:20pm

An event that starts at 7:10pm pm and ends at 8:10pm
*/



var testData = [
  {id : 4, start : 610, end : 670},
  {id : 1, start : 30, end : 150},
  {id : 2, start : 540, end : 600},
  {id : 3, start : 560, end : 620}
];


(function(){
 this.utils = {

   substitute: function(tmpl, obj){
     var lbrace = '{', rbrace = '}', 
     i, j, k, key, v, 
     tok, lidx = tmpl.length;
     /**
     * Loops through each character of the string,
     * looking for replacements of '{' and '}' with 'key'.
     * 1. Find where the first left brace is within the str.length
     * 2. Find right brace placement
     * 3. If right brace key has a space, use meta key.
     * 4. Get the token and key
     **/
     for(;;){
       i = tmpl.lastIndexOf(lbrace, lidx);
       if(i < 0){ 
         break;
       }

       j = tmpl.indexOf(rbrace, i);

       if(i + 1 >= j){
         break;
       }

       tok = tmpl.substring(i + 1, j);
       key = tok;
       k = key.indexOf(' '); //probably should make this 'cached'

       //get value
       v = obj[key];

       tmpl = tmpl.substring(0, i) + v + tmpl.substring(j + 1);
       lidx = i - 1;
     }
     return tmpl;
   }
 };

 this.Cal = function(id, events){
   var calendar = document.getElementById(id) || document.getElementById('calendar'),
   /* Canvas 620px X 720px [wxh] */
   totalWidth = 600, //total width 620, 10px of padding each side
   events = events,
   totalHeight = 720, //1 px = 1 minutes from 9 am
   hoursShown = 12,
   timeMap;

   function createShownCalendar(begin, end, hrs){
     var time_layout= '',
     template = '<span class="{className}">{time}</span>',
     tmp = hrs;

     while(tmp--){

     }
   }


   function init(){

   }

   return {
     init: init
   }

 };

}());
