import moment from 'moment-timezone';

export default new (class Clock {
  constructor() { }

  checkDates(dates) {
    return dates.every(date => moment(date).isValid());
  }

  // format:
  // datetime = string, 2019-11-05 12:34:56
  // fromFormat, toFormat = string, "+00:00", "+08:00", "-06:00", "sport", "fifa", "utc"
  convert(datetime, fromFormat, toFormat) {
    const tzOffsetFrom = this.toTimezone(fromFormat);
    const tzOffsetTo = this.toTimezone(toFormat);
    return this.convertDateTimeByTimezone(datetime, tzOffsetFrom, tzOffsetTo);
  }

  range([datefrom, dateto], fromFormat, toFormat, type = 'datetime') {
    const dates = [datefrom, dateto];
    const isValid = this.checkDates(dates);

    if (!isValid) {
      return Array(dates.length).fill(null).map((v) => v);
    }

    const tzOffsetFrom = this.toTimezone(fromFormat);
    const tzOffsetTo = this.toTimezone(toFormat);
    const from = this.convertDateTimeByTimezone(datefrom, tzOffsetFrom, tzOffsetTo);
    const to = this.convertDateTimeByTimezone(dateto, tzOffsetFrom, tzOffsetTo);

    // in range, date-TO need to add one day for date-time query
    // >= 2019-11-04 00:00:00 && < 2019-11-06 00:00:00
    // NOT >= 2019-11-04 00:00:00 && < 2019-11-05 00:00:00
    let cdatefrom, cdateto;
    switch (type) {
      case 'date':
        cdatefrom = from.format('YYYY-MM-DD');
        cdateto = to.format('YYYY-MM-DD');
        break;
      case 'datetime':
        cdatefrom = from.format();
        cdateto = to.add(1, 'days').format();
        break;
    }

    return [cdatefrom, cdateto];
  }

  // predefine for date, not datetime
  // we still returning moment object
  // but please never use the time(HH:mm:ss) in format.
  // but please never add/substract in time manner.
  // date = reference for "today", in case user need to know a specific predefine date range of that date
  // usually date = today
  predefine(range, fromFormat, toFormat, today = moment().format()) {
    const tzOffsetFrom = this.toTimezone(fromFormat);
    const tzOffsetTo = this.toTimezone(toFormat);

    today = moment(today).utcOffset(tzOffsetFrom);

    let from, to, start;
    start = this.convertDateTimeByTimezone(today.format(), tzOffsetFrom, tzOffsetTo);
    start = moment(start.format('YYYY-MM-DD 00:00:00'));

    // console.log('today ', today.format());
    // console.log('start ', start.format());

    switch (range) {
      case 'today':
        from = start;
        to = from.clone().add(0, 'day');
        break;
      case 'yesterday':
        from = start.subtract(1, 'day');
        to = from.clone().add(0, 'day');
        break;
      case 'tomorrow':
        from = start.add(1, 'day');
        to = from.clone().add(0, 'day');
        break;
      case 'this-week':
        from = start.startOf('isoWeek'); // start on monday
        to = from.clone().add(1, 'weeks').subtract(1, 'days');
        break;
      case 'last-week':
        from = start.startOf('isoWeek').subtract(1, 'weeks'); // start on monday
        to = from.clone().add(1, 'weeks');
        break;
      case 'next-week':
        from = start.startOf('isoWeek').add(1, 'weeks'); // start on monday
        to = from.clone().add(1, 'weeks');
        break;
      case 'this-month':
        from = start.startOf('month');
        to = from.clone().endOf('month');
        break;
      case 'last-month':
        from = start.startOf('month').subtract(1, 'months');
        to = from.clone().endOf('month');
        break;
      case 'next-month':
        from = start.startOf('month').add(1, 'months');
        to = from.clone().endOf('month');
        break;
    }

    return [from, to];
  }


  // The most lowsest level of convert function
  // it expect date-time only, with timezone-from and timezone-to
  // format:
  // datetime = string, 2019-11-05 12:34:56
  // tzOffsetFrom, tzOffsetTo = string, "+00:00", "+08:00", "-06:00"
  // WARNING: it return in UTC anyhow.
  //  the return moment object is NOT for timezone purpose
  //  it just make the user convenient in add/substract, formating.
  convertDateTimeByTimezone(datetime, tzOffsetFrom, tzOffsetTo) {
    const tzOffsetFromInv = this.inverseTimezone(tzOffsetFrom);

    const AtoUTC = moment(datetime).utcOffset(tzOffsetFromInv);
    // console.log('AtoUTC ', AtoUTC.format());

    const UTCtoB = moment(AtoUTC.format()).utcOffset(tzOffsetTo);
    // console.log('UTCtoB ', UTCtoB.format());

    const result = moment(UTCtoB.format())

    return result;
  }

  toTimezone(format) {
    switch (format) {
      case 'fifa':
      case 'sports': return "-04:00";
      case 'utc': return "+00:00";
      default: return format;
    }
  }

  inverseTimezone(tzoffset) {
    switch (tzoffset[0]) {
      case "+": return tzoffset.replace('+', '-');
      case "-": return tzoffset.replace('-', '+');
    }
  }

  // util
  dates(from, to) {
    // turn (from, to) into [from,...,to]
    from = moment(from);
    to = moment(to);
    const dates = [];
    let days = to.diff(from, 'days') + 1;
    while (days--) {
      dates.unshift(from.clone().add(days, 'days').format('YYYY-MM-DD'));
    }
    return dates;
  }


})();
