import _ from 'lodash';

export default new (class XConsole {
  constructor() {}

  log(color = '', msg, room, event, data) {
    let c = '\x1b[0m';
    switch (color.toLowerCase()) {
      case 'blue':
        c = '\x1b[34m';
        break;
      case 'yellow':
        c = '\x1b[33m';
        break;
      case 'red':
        c = '\x1b[31m';
        break;
      case 'green':
        c = '\x1b[32m';
        break;
    }
    console.log(c);
    console.log(new Date().toLocaleString());
    console.log(msg);
    console.log(room);
    console.log(event);
    console.log(data);
    console.log('\x1b[0m');
  }
})();
