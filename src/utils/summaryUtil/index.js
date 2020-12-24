import LogUtil from '../logUtil';

module.exports = class SummaryUtil {

  constructor() {
    this.updated = 0;
    this.errors = 0;
  }

  update(value) {
    if (value) {
      this.updated += 1;
    } else {
      this.errors += 1;
    }
  }

  print() {
    LogUtil.log(`\n=====\nSummary\n====\nUpdated: ${this.updated}\nErrors: ${this.errors}\n`);
  }
}
