/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
import {
  invalidDateError,
  invalidDateRegExp,
} from './utils';

const metaSecond = 1000;
const metaMinute = 60 * metaSecond;
const metaHour = 60 * metaMinute;
const metaDay = 24 * metaHour;

class Now {
  constructor(...args) {
    this._firstDayMonday = false;
    this.now = new Date(...args);
    if (invalidDateRegExp.test(this.now)) {
      throw new TypeError(invalidDateError);
    }
  }

  get value() {
    return +this.now;
  }

  get year() {
    return this.now.getFullYear();
  }

  get month() {
    return this.now.getMonth() + 1;
  }

  get day() {
    return this.now.getDate();
  }

  get weekDay() {
    return this.now.getDay();
  }

  get hour() {
    return this.now.getHours();
  }

  get minute() {
    return this.now.getMinutes();
  }

  get second() {
    return this.now.getSeconds();
  }

  get milliSecond() {
    return this.now.getMilliseconds();
  }

  get firstDayMonday() {
    return this._firstDayMonday;
  }

  set firstDayMonday(value) {
    this._firstDayMonday = value;
  }

  addMilliSeconds(value) {
    this.now.setMilliseconds(this.now.getMilliseconds() + value);
    return this;
  }

  addSeconds(value) {
    this.now.setSeconds(this.now.getSeconds() + value);
    return this;
  }

  addMinutes(value) {
    this.now.setMinutes(this.now.getMinutes() + value);
    return this;
  }

  addHours(value) {
    this.now.setHours(this.now.getHours() + value);
    return this;
  }

  addDays(value) {
    this.now.setDate(this.now.getDate() + value);
    return this;
  }

  addWeeks(value) {
    return this.now.addDays(7 * value);
  }

  addMonths(value) {
    this.now.setMonth(this.now.getMonth() + value);
    return this;
  }

  clone() {
    const clone = new Now(this.now);
    clone.firstDayMonday = this.firstDayMonday;
    return clone;
  }

  truncate(name) {
    switch (name) {
      case 'year':
        this.now.setMonth(0);
        this.now.setDate(1);
        this.now.setHours(0);
        this.now.setMinutes(0);
        this.now.setSeconds(0);
        this.now.setMilliseconds(0);
        return this;
      case 'month':
        this.now.setDate(1);
        this.now.setHours(0);
        this.now.setMinutes(0);
        this.now.setSeconds(0);
        this.now.setMilliseconds(0);
        return this;
      case 'day':
        this.now.setHours(0);
        this.now.setMinutes(0);
        this.now.setSeconds(0);
        this.now.setMilliseconds(0);
        return this;
      case 'hour':
        this.now.setMinutes(0);
        this.now.setSeconds(0);
        this.now.setMilliseconds(0);
        return this;
      case 'minute':
        this.now.setSeconds(0);
        this.now.setMilliseconds(0);
        return this;
      default:
        return this;
    }
  }

  parse(ifMiliSecond) {
    const year = this.now.getFullYear();
    let month = this.now.getMonth() + 1;
    let date = this.now.getDate();
    let hour = this.now.getHours();
    let minute = this.now.getMinutes();
    let second = this.now.getSeconds();
    const milliSecond = this.now.getMilliseconds();
    month = month < 10 ? `0${month}` : month;
    date = date < 10 ? `0${date}` : date;
    hour = hour < 10 ? `0${hour}` : hour;
    minute = minute < 10 ? `0${minute}` : minute;
    second = second < 10 ? `0${second}` : second;
    if (ifMiliSecond) {
      return `${year}-${month}-${date} ${hour}:${minute}:${second}.${milliSecond}`;
    }
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
  }

  beginningOfMinute() {
    const clone = this.clone();
    return clone.truncate('minute');
  }

  beginningOfHour() {
    const clone = this.clone();
    return clone.truncate('hour');
  }

  beginningOfDay() {
    const clone = this.clone();
    return clone.truncate('day');
  }

  beginningOfWeek() {
    const clone = this.clone();
    let weekDay = clone.now.getDay();
    if (clone.firstDayMonday) {
      if (weekDay === 0) {
        weekDay = 7;
      }
      weekDay -= 1;
    }
    clone.addDays(-weekDay);
    return clone.truncate('day');
  }

  beginningOfMonth() {
    const clone = this.clone();
    return clone.truncate('month');
  }

  beginningOfQuarter() {
    const clone = this.clone().beginningOfMonth();
    const offset = clone.now.getMonth() % 3;
    return clone.addMonths(-offset);
  }

  beginningOfYear() {
    const clone = this.clone();
    return clone.truncate('year');
  }

  endOfMinute() {
    const clone = this.clone();
    return clone.beginningOfMinute().addMilliSeconds(metaMinute - 1);
  }

  endOfHour() {
    const clone = this.clone();
    return clone.beginningOfHour().addMilliSeconds(metaHour - 1);
  }

  endOfDay() {
    const clone = this.clone();
    return clone.beginningOfDay().addMilliSeconds(metaDay - 1);
  }

  endOfWeek() {
    const clone = this.clone();
    return clone.beginningOfWeek().addMilliSeconds((7 * metaDay) - 1);
  }
}

export default Now;
