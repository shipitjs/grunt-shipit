var expect = require('chai').expect;
var utils = require('../../lib/utils');

describe('Utils', function () {
  describe('#prefixLines', function () {
    it('should prefix lines with a string', function () {
      expect(utils.prefixLines('prefix', 'my\nmulti\nline')).to.equal(
        'my\nprefixmulti\nprefixline'
      );
    });
  });
});