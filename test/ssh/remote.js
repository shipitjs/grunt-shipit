var expect = require('chai').expect,
  remote = require('../../lib/ssh/remote');

describe('SSH remote', function () {
  describe('#parse', function () {
    it('should parse remote', function () {
      expect(remote.parse('user@host')).to.deep.equal({ user: 'user', host: 'host' });
    });
  });

  describe('#format', function () {
    it('should format remote', function () {
      expect(remote.format({ user: 'user', host: 'host' })).to.equal('user@host');
    });
  });
});