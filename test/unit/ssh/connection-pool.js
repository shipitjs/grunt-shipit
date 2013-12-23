var expect = require('chai').use(require('sinon-chai')).expect;
var sinon = require('sinon');
var Connection = require('../../../lib/ssh/connection');
var ConnectionPool = require('../../../lib/ssh/connection-pool');

describe('SSH Connection pool', function () {
  var connection1, connection2, pool;

  beforeEach(function () {
    connection1 = new Connection('user@host1');
    connection2 = new Connection('user@host2');

    pool = new ConnectionPool([connection1, connection2]);

    sinon.stub(connection1, 'run').yields();
    sinon.stub(connection2, 'run').yields();
    sinon.stub(connection1, 'copy').yields();
    sinon.stub(connection2, 'copy').yields();
  });

  describe('constructor', function () {
    it('should be possible to create a new ConnectionPool using shorthand syntax', function () {
      var pool = new ConnectionPool(['myserver', 'myserver2']);
      expect(pool.connections[0].config).to.deep.equal({ user: 'deploy', host: 'myserver' });
      expect(pool.connections[1].config).to.deep.equal({ user: 'deploy', host: 'myserver2' });
    });
  });

  describe('#run', function () {
    it('should run command on each connection', function (done) {
      pool.run('my-command', function (err) {
        if (err) return done(err);
        expect(connection1.run).to.be.called;
        expect(connection2.run).to.be.called;
        done();
      });
    });
  });

  describe('#copy', function () {
    it('should run command on each connection', function (done) {
      pool.copy('/src/dir', '/dest/dir', function (err) {
        if (err) return done(err);
        expect(connection1.copy).to.be.called;
        expect(connection2.copy).to.be.called;
        done();
      });
    });
  });
});