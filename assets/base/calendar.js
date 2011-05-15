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



var test_data = [
  {id : 4, start : 610, end : 670},
  {id : 1, start : 30, end : 150},
  {id : 2, start : 540, end : 600},
  {id : 3, start : 560, end : 620}
];

var test_set_two = [
  {id:6, start:330, end:480},
  {id:7, start:480, end:540},
  {id:2, start:60, end:400},
  {id:3, start:60, end:211},
  {id:4, start:60, end:210},
  {id:5, start:240, end:700},
  {id:1, start:45, end:450}
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
    },
    isArray: function(obj){
      return obj && typeof obj === 'object' &&
              obj.constructor === Array &&
              Object.prototype.toString.call(obj) == '[object Array]';
    }


  };

  this.CalEvent = function(id, start, end){
    var y = start,
    OFFSET = 9,
    duration = end - start,
    start_time = new Date(0, 0, 0, Math.abs(start / 60) + OFFSET, Math.abs(start % 60)).toLocaleTimeString(),
    end_time = new Date(0, 0, 0, Math.abs(end / 60) + OFFSET, Math.abs(end % 60)).toLocaleTimeString(),
    tmpl = '<div id="event-{id}" class="event" style="top: {y}px; left: {x}px; height: {duration}px; width: {width}px"><h4>EVENT: {id}</h4><span class="event-time">{start}-{end}</span></div>',
    to_string = '{id} :: {start} :: {end} :: {duration} :: {{start_time}} :: {{ endtime }} :: {{x}} :: {{y}}';

    //class vars
    this.x = 0;
    this.width = 0;

    function toHTML(){
      return utils.substitute(tmpl, 
                              {
                                duration: duration,
                                id: id,
                                start: start_time,
                                end: end_time,
                                width: this.width,
                                y: y,
                                x: this.x
                              }
                             );
    }

    //override toString
    var toString = function(){
      return utils.substitute(to_string,{
        id: id,
        start: start,
        end: end,
        width: width,
        height: height,
        x: x,
        y: y,
        duration: duration
      });
    }

    return {
      id: id,
      start: start,
      end: end,
      y: start,
      duration: duration,
      html: toHTML,
      toString: toHTML 
    };
  };

  this.Cal = function(id){
    var DEFAULT_BEGIN = 9,
      DEFAULT_END = 21,
      calendar = document .getElementById(id) || document.getElementById('calendar'),
      /* Canvas 620px X 720px [wxh] */
      total_width = 600, //total width 620, 10px of padding each side
      total_height = 720, //1 px = 1 minutes from 9 am,
      padding = 10,
      time_tmpl = '<span class="{className}">{time}</span>',
      canvas_tmpl = '<div class="time-layout">{time_layout}</div>' +
        '<div class="canvas" style="height: {canvas_height}px; width: {canvas_width}px">{day_layout}</div>';


    /** Utility functions **/
    function sortEvents(a, b){
      var comp = a.start - b.start;
      return (comp == 0) ? (0 - sortDuration(a, b)) : comp;
    }

    function sortDuration(a, b){
      return a.duration - b.duration;
    }

    function lazyLoad(events){
      var event_obj_list = [], i = 0;
      if(utils.isArray(events)){
        for(;i < events.length; i++){
          var evt = events[i];
          if(evt && evt.hasOwnProperty('id') &&
             evt.hasOwnProperty('start') &&
                 evt.hasOwnProperty('end')){
            event_obj_list[i] = new CalEvent(evt.id, evt.start, evt.end);
          }
        }
        return event_obj_list;
      }

      throw Exception("Events is not in correct format");
    }

    function create(events){
      var orig_events = events,
      event_obj_list = lazyLoad(events);
      //sort events and pass to layOutDay
      event_obj_list = layOutDay(event_obj_list);
      calendar.innerHTML = utils.substitute(canvas_tmpl, 
                                            {
                                              time_layout: createTimeLayout(),
                                              day_layout: event_obj_list.join(''),
                                              canvas_height: total_height,
                                              canvas_width: total_width
                                            });
      //too bad classList is missing
      calendar.className = calendar.className.replace('hidden', '');
    }

    function layOutDay(events){
      //find collisions
      var i = 1,
          len = events.length,
          positions = {},
          total_columns = 0;
      
      //sort events
      events.sort(sortEvents);

      if(len > 0){
        positions[events[0].id] = 0;
        /* Create map and find what 'column' the event is in */
        for(;i < len; i++){
          var evt = events[i],
              max_column = 0,
              j = 0;
          for(;j < i; j++){
              var next_evt = events[j];
              
              if(evt.start >= next_evt.start && evt.start < next_evt.end){
                if(positions[next_evt.id] <= max_column){
                  max_column++;
                }
              }

            positions[evt.id] = max_column;
            total_columns = Math.max(total_columns, max_column);
          }
        
        }

        //iterate over positions and find widths.
        var w = total_width / (total_columns + 1);
        for(i=0; i < len; i++){
          var j = 0, evt = events[i],
              pos = positions[evt.id],
              max_tmp = total_columns - pos + 1;
          for(;j < len; j++){
            if(i !== j){
              var sib = events[j],
              pos_dos = positions[sib.id];
              if(pos_dos >= pos &&
                 (evt.start >= sib.start && evt.start < sib.end) || 
                 (sib.start >= evt.start && sib.start < evt.end)){
                
                max_tmp = Math.min(max_tmp, pos_dos - pos);
                if(max_tmp === 1){
                  break;
                }
              }

            }
          }
      
          evt.width = Math.max(max_tmp, 1) * w;
          evt.x = pos * w + padding;
        }
        
        return events;
      }

      throw Exception("No events to parse!");
    }

    /**
     * createTimeLayout
     *
     * @param begin
     *  integer - 0-24
     *  Beginning of the day
     * @param end
     *  integer - 0-24
     *  Ending of the day
     **/
    function createTimeLayout(begin, end){
      var time_layout= '',
      i = begin || DEFAULT_BEGIN,
      j = end || DEFAULT_END;
      
      for(;i <= j; i+=0.5){
        var am_pm = i < 12 ? ' AM' : ' PM',
        class_name = i % 1 ? 'half-hour' : 'on-hour',
        tmp = i < 13 ? i : (i-12);

        tmp = Math.floor(tmp);
        tmp += i % 1 ? ':30' : ':00';
        //convert to string, replace 0.5 with :30
        time_layout += utils.substitute(
          time_tmpl, 
          {className: class_name, time: tmp + (i % 1 ? '' : am_pm)}
        );
      }

      return time_layout;
    }

    return {
      create: create
    };

  };

}());

var c = Cal();
c.create(test_set_two);
