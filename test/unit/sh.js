var rewire = require('rewire');
var cmd = require('../mocks/command');
var expect = require('chai').use(require('sinon-chai')).expect;
var sh = rewire('../../lib/sh');

describe('Shell', function () {
  beforeEach(function () {
    sh.__set__('cmd', cmd);
  });

  afterEach(function () {
    cmd.restore();
  });

  describe('#run', function () {
    it('should call cmd.spawn', function (done) {
      sh.run('my-command', ['-x'], { cwd: '/root' }, done);

      expect(cmd.spawn).to.be.calledWith(
        '/bin/sh',
        ['-c', 'my-command', '-x'],
        { cwd: '/root', logPrefix: '@ ' }
      );
    });
  });
});