import {
  invalidDateError,
  invalidDateRegExp,
  compare,
  slice,
  isDate,
  isUndefined,
  minus,
} from './utils';

const metaSecond = 1000;
const metaMinute = 60 * metaSecond;
const metaHour = 60 * metaMinute;
const metaDay = 24 * metaHour;
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class Now {
  constructor(...args) {
    this.mondayFirst = false;
    this.now = new Date(...args);
    if (invalidDateRegExp.test(this.now)) {
      throw new TypeError(invalidDateError);
    }
    this.now.parse = this.parse;
    this.initDate();
    this.initIsDate();
  }

  initDate() {
    let index = 0;
    const len = days.length;

    while (index < len) {
      const lower = days[index].toLowerCase();
      this[lower] = this.dateIterator(index);
      index += 1;
    }
  }

  initIsDate() {
    let index = 0;
    const len = days.length;

    while (index < len) {
      this[`is${days[index]}`] = this.isDateIterator(index);
      index += 1;
    }
  }

  dateIterator(index) {
    const that = this;
    return () => {
      const weekDay = that.now.getDay();
      that.mondayFirst = false;
      if (weekDay === 0) {
        // today is sunday, so get before sunday
        let offset = index;
        if (index === 0) {
          offset = 7;
        }
        return that.computeBeginningOfWeek().addDays(-(7 - offset)).date;
      }
      // today is not sunday, so get after sunday
      let offset = index;
      if (index === 0) {
        offset = 7;
      }
      return that.computeBeginningOfWeek().addDays(offset).date;
    };
  }

  isDateIterator(index) {
    const that = this;
    return () => that.now.getDay() === index;
  }

  get value() {
    return +this.now;
  }

  get date() {
    return this.now;
  }

  get year() {
    return this.date.getFullYear();
  }

  get month() {
    return this.date.getMonth() + 1;
  }

  get day() {
    return this.date.getDate();
  }

  get weekDay() {
    return this.date.getDay();
  }

  get hour() {
    return this.date.getHours();
  }

  get minute() {
    return this.date.getMinutes();
  }

  get second() {
    return this.date.getSeconds();
  }

  get milliSecond() {
    return this.date.getMilliseconds();
  }

  get firstDayMonday() {
    return this.mondayFirst;
  }

  set firstDayMonday(value) {
    this.mondayFirst = value;
  }

  addMilliSeconds(value) {
    this.date.setMilliseconds(this.date.getMilliseconds() + value);
    return this;
  }

  addSeconds(value) {
    this.date.setSeconds(this.date.getSeconds() + value);
    return this;
  }

  addMinutes(value) {
    this.date.setMinutes(this.date.getMinutes() + value);
    return this;
  }

  addHours(value) {
    this.date.setHours(this.date.getHours() + value);
    return this;
  }

  addDays(value) {
    this.date.setDate(this.date.getDate() + value);
    return this;
  }

  addWeeks(value) {
    return this.date.addDays(7 * value);
  }

  addMonths(value) {
    this.date.setMonth(this.date.getMonth() + value);
    return this;
  }

  addYears(value) {
    this.date.setFullYear(this.date.getFullYear() + value);
    return this;
  }

  clone() {
    const clone = new Now(this.date);
    return clone;
  }

  truncate(name) {
    const context = this.date;
    switch (name) {
      case 'year':
        context.setMonth(0);
        context.setDate(1);
        context.setHours(0);
        context.setMinutes(0);
        context.setSeconds(0);
        context.setMilliseconds(0);
        return this;
      case 'month':
        context.setDate(1);
        context.setHours(0);
        context.setMinutes(0);
        context.setSeconds(0);
        context.setMilliseconds(0);
        return this;
      case 'day':
        context.setHours(0);
        context.setMinutes(0);
        context.setSeconds(0);
        context.setMilliseconds(0);
        return this;
      case 'hour':
        context.setMinutes(0);
        context.setSeconds(0);
        context.setMilliseconds(0);
        return this;
      case 'minute':
        context.setSeconds(0);
        context.setMilliseconds(0);
        return this;
      default:
        return this;
    }
  }

  parse(ifMiliSecond) {
    let context;
    if (this instanceof Now) {
      context = this.date;
    } else {
      context = this;
    }
    const year = context.getFullYear();
    let month = context.getMonth() + 1;
    let date = context.getDate();
    let hour = context.getHours();
    let minute = context.getMinutes();
    let second = context.getSeconds();
    const milliSecond = context.getMilliseconds();
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

  computeBeginningOfMinute() {
    const clone = this.clone();
    return clone.truncate('minute');
  }

  computeBeginningOfHour() {
    const clone = this.clone();
    return clone.truncate('hour');
  }

  computeBeginningOfDay() {
    const clone = this.clone();
    return clone.truncate('day');
  }

  computeBeginningOfWeek() {
    const clone = this.clone();
    clone.firstDayMonday = this.firstDayMonday;
    let weekDay = clone.date.getDay();
    if (clone.firstDayMonday) {
      if (weekDay === 0) {
        weekDay = 7;
      }
      weekDay -= 1;
    }
    clone.addDays(-weekDay);
    return clone.truncate('day');
  }

  computeBeginningOfMonth() {
    const clone = this.clone();
    return clone.truncate('month');
  }

  computeBeginningOfQuarter() {
    const clone = this.clone().computeBeginningOfMonth();
    const offset = clone.date.getMonth() % 3;
    return clone.addMonths(-offset);
  }

  computeBeginningOfYear() {
    const clone = this.clone();
    return clone.truncate('year');
  }

  beginningOfMinute() {
    return this.computeBeginningOfMinute().date;
  }

  beginningOfHour() {
    return this.computeBeginningOfHour().date;
  }

  beginningOfDay() {
    return this.computeBeginningOfDay().date;
  }

  beginningOfWeek() {
    return this.computeBeginningOfWeek().date;
  }

  beginningOfMonth() {
    return this.computeBeginningOfMonth().date;
  }

  beginningOfQuarter() {
    return this.computeBeginningOfQuarter().date;
  }

  beginningOfYear() {
    return this.computeBeginningOfYear().date;
  }

  endOfMinute() {
    const clone = this.clone();
    return clone.computeBeginningOfMinute().addMilliSeconds(metaMinute - 1).date;
  }

  endOfHour() {
    const clone = this.clone();
    return clone.computeBeginningOfHour().addMilliSeconds(metaHour - 1).date;
  }

  endOfDay() {
    const clone = this.clone();
    return clone.computeBeginningOfDay().addMilliSeconds(metaDay - 1).date;
  }

  endOfWeek() {
    const clone = this.clone();
    clone.firstDayMonday = this.firstDayMonday;
    return clone.computeBeginningOfWeek().addMilliSeconds((7 * metaDay) - 1).date;
  }

  endOfMonth() {
    const clone = this.clone();
    return clone.computeBeginningOfMonth().addMonths(1).addMilliSeconds(-1).date;
  }

  endOfQuarter() {
    const clone = this.clone();
    return clone.computeBeginningOfQuarter().addMonths(3).addMilliSeconds(-1).date;
  }

  endOfYear() {
    const clone = this.clone();
    return clone.computeBeginningOfYear().addYears(1).addMilliSeconds(-1).date;
  }

  before(obj) {
    return compare(this.date, obj) === -1;
  }

  after(obj) {
    return compare(this.date, obj) === 1;
  }

  equal(obj) {
    return compare(this.date, obj) === 0;
  }

  min(...args) {
    let result = Infinity;
    let compares = slice.call(args);
    let index = 0;
    const len = compares.length;
    if (len === 0) {
      throw new Error('min require at least one argument');
    }
    const some = compares.some(value => !isDate(value));
    if (some) {
      throw new TypeError('min require Date type');
    }
    compares = [this.date].concat(compares);
    while (index < len + 1) {
      if (+compares[index] < result) {
        result = compares[index];
      }
      index += 1;
    }
    return result;
  }

  max(...args) {
    let result = -Infinity;
    let compares = slice.call(args);
    let index = 0;
    const len = compares.length;
    if (len === 0) {
      throw new Error('max require at least one argument');
    }
    const some = compares.some(value => !isDate(value));
    if (some) {
      throw new TypeError('max require Date type');
    }
    compares = [this.date].concat(compares);
    while (index < len + 1) {
      if (+compares[index] > result) {
        result = compares[index];
      }
      index += 1;
    }
    return result;
  }

  between(date1, date2) {
    if (isUndefined(date1) || isUndefined(date2)) {
      throw new Error('arguments must be defined');
    }
    if (!(isDate(date1) && isDate(date2))) {
      throw new TypeError('arguments must be Date type');
    }
    return this.after(date1) && this.before(date2);
  }

  // return the duration this.date - date.
  sub(date, ...args) {
    if (args.length > 0) {
      return minus(date, args[0]);
    }
    return minus(this.date, date);
  }

  // return the time elapsed by now
  elapse() {
    const now = new Date();
    return minus(now, this.date);
  }

  // return the time elapsed since date
  since(date) {
    const now = new Date();
    return this.sub(now, date);
  }
}

export default Now;

