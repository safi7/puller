export default class CustomError extends Error {
  constructor(message, info) {
    super(message);
    this.name = this.constructor.name;
    this.info = info;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
