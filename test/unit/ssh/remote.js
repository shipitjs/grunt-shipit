var expect = require('chai').expect,
  remote = require('../../../lib/ssh/remote');

describe('SSH remote', function () {
  describe('#parse', function () {
    it('should parse remote', function () {
      expect(remote.parse('user@host')).to.deep.equal({ user: 'user', host: 'host' });
    });

    it('should use deploy as default user', function () {
      expect(remote.parse('host')).to.deep.equal({ user: 'deploy', host: 'host' });
    });
  });

  describe('#format', function () {
    it('should format remote', function () {
      expect(remote.format({ user: 'user', host: 'host' })).to.equal('user@host');
    });
  });
});