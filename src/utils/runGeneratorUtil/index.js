/*eslint-disable */
/*
  Helper function to make asyn calls look like sync calls
  @param {object} makeGenerator
  @returns {object}
*/
module.exports = function (makeGenerator) {
  return () => {
    const generator = makeGenerator.apply(this, arguments);

    function handle(result) {
      // result => { done: [Boolean], value: [Object] }
      if (result.done) return Promise.resolve(result.value);

      return Promise.resolve(result.value).then((res) => {
        return handle(generator.next(res));
      }, (err) => {
        console.log(err);
        return handle(generator.throw(err));
      });
    }

    try {
      return handle(generator.next());
    } catch (ex) {
      console.log(ex);
      return Promise.reject(ex);
    }
  };
}
/*eslint-enable */
