var rewire = require('rewire');
var expect = require('chai').use(require('sinon-chai')).expect;
var childProcess = require('../../mocks/child-process');
var logger = require('../../mocks/logger');
var sinon = require('sinon');
var Connection = require('../../../lib/ssh/connection');
var ConnectionMocked = rewire('../../../lib/ssh/connection');
var ConnectionPool = require('../../../lib/ssh/connection-pool');

describe('SSH Connection pool', function () {
  var connection1, connection2, connection3, pool, poolMocked;

  beforeEach(function () {
    connection1 = new Connection({ remote: 'user@host1' });
    connection2 = new Connection({ remote: 'user@host2' });

    pool = new ConnectionPool([connection1, connection2]);

    sinon.stub(connection1, 'run').yields();
    sinon.stub(connection2, 'run').yields();
    sinon.stub(connection1, 'copy').yields();
    sinon.stub(connection2, 'copy').yields();

    ConnectionMocked.__set__('childProcess', childProcess);
    connection3 = new ConnectionMocked({
        remote: 'user@host3',
        logger: logger
    });

    // instanceof connection3 != Connection
    poolMocked = new ConnectionPool([]);
    poolMocked.connections = [connection3];
  });

  describe('constructor', function () {
    it('should be possible to create a new ConnectionPool using shorthand syntax', function () {
      var pool = new ConnectionPool(['myserver', 'myserver2']);
      expect(pool.connections[0].remote).to.deep.equal({ user: 'deploy', host: 'myserver' });
      expect(pool.connections[1].remote).to.deep.equal({ user: 'deploy', host: 'myserver2' });
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

    it('should return an array of results', function (done) {
      poolMocked.run('my-command', function (err, results) {
        if (err) return done(err);
        expect(results).to.be.eql(['stdout']);
        done();
      });
    })
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