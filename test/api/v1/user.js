var request = require('superagent');
var expect = require('chai').expect;

describe('v1版本API接口测试', function () {
  describe('users相关接口测试', function () {
    var BASE = 'http://localhost:8001/v1/users';
    var cookie = '';
    

    beforeEach(function () {
      this.timeout(10000);
    })

    it('login接口测试', function (done) {
      var data = {
        account: 'fztest',
        password: 'fZ123123',
        deviceInfo: {
          sysVerId: 9999,
          deviceId: '12345678900000111',
          deviceModel: 'Mi5s',
          deviceSystem: 'Android',
          deviceSystemVersion: '6.0.1',
          macAddr: '90:98:30:40:54'
        }
      };
      request.post(BASE + '/login')
        .send(data)
        .end(function(err, res) {
          console.log('res', res);
          cookie = res.header['set-cookie'][0];
          expect(res.body).to.be.an('object');
          expect(res.body.code).to.be.equal(200);
          done();
        });
    });

    it('saveTeam接口测试', function (done) {
      var data = {
        teamId: '50086',
        smsCode: '123456'
      };
      request.post(BASE + '/saveTeam')
      .send(data)
      .set({'set-cookie': cookie})
      .end(function(err, res) {
        console.log('res', res.body);
        expect(res.body).to.be.an('object');
        expect(res.body.code).to.be.equal(200);
        done();
      });
    });

    it.skip('codeToName接口测试', function (done) {
      fetch(BASE + '/codeToName?domainCode=PAY_AREA&valueCode=0598')
        .then(res => res.json())
        .then(json => {
          expect(json).to.be.an('object');
          expect(json.code).to.be.equal(200);
          expect(json.result).to.be.equal('1');
          done();
        });
    });

    it.skip('nameToCode接口测试', function (done) {
      fetch(BASE + '/nameToCode?domainCode=PAY_AREA&valueName=1')
        .then(res => res.json())
        .then(json => {
          expect(json).to.be.an('object');
          expect(json.code).to.be.equal(200);
          expect(json.result).to.be.equal('0598');
          done();
        });
    });


  });
});