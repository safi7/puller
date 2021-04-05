export default class ValidationError extends Error {
  constructor(message, info) {
    super(message);
    this.name = this.constructor.name;
    this.info = info;
    //   console.log('type', typeof Error.captureStackTrace);
    if (typeof Error.captureStackTrace === 'function') {
      //  console.log('case1', this, this.constructor);
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
