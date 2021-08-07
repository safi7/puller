import _ from "lodash";
import moment from "moment";


export default new (class Article {

  getPagination(data) {
    const info = data.match(/<ul class="pagination"([^]*)<\/ul\>/g);
    return info ? info[0] : '';
  }

  getPaginateLi(data) {
    const info = data.match(/<li id="total_page"([^]*)<\/li\>/g);
    return info ? info[0] : '';
  }

  getTotalPages(data) {
    const info = data.match(/data-val=\d+/g);
    return info ? info[0] : '';
  }

  getTotalPagesValue(data) {
    const info = data.match(/\d+/g);
    return info ? +info[0] : null;
  }

  getTables(data) {
    const info = data.match(/<table id="table-announcements"([^]*)<\/table\>/g);
    return info ? info[0] : '';
  }

  getAnnouncementTable(data) {
    const info = data.split('</table>');
    return info ? info[0] : '';
  }

  getTableBody(data) {
    const info = data.match(/<tbody([^]*)<\/tbody\>/g);
    return info ? info[0] : '';
  }

  getTableRow(data) {
    return data.split('</tr>');
  }

  getTableTd(data) {
    return data.split('</td>');
  }

  getPublishDate(data) {
    let info = data.match(/([0-9)([A-Z])\w+/g);
    if (info) {
      let date = `${info[0]}-${info[1]}-${info[2]}`;
      date = moment(date, 'DD-MMM-YYYY').format('YYYY-MM-DD');
      info = date;
    }
    return info || '';
  }

  getArticleText(data) {
    let info = data.match(/([A-Z])\w+/g);
    return info ? info.join(' ') : '';
  }

  getUrl(data) {
    let info = data.match(/href="(.*?)"/g);
    return info ? info[0].split('"').join('').split('href=').join('') : '';
  }

  stringToHex(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

  ensure(data) {
    return data.title && data.url;
  }


})();
