var fetch = require('node-fetch');
var expect = require('chai').expect;

describe.skip('v1版本API接口测试', function () {
  describe('Configuration相关接口测试', function () {
    var BASE = 'http://localhost:8001/v1/configs';

    beforeEach(function () {
      this.timeout(10000);
    })

    it('update接口测试', function (done) {
      fetch(BASE + '/update')
        .then(function (res) {
          return res.json();
        }).then(function (json) {
          expect(json).to.be.an('object');
          expect(json.code).to.be.equal(400);
          done();
        });
    });

    it('query接口测试', function (done) {
      fetch(BASE + '/query?domainCode=VERSION_NO')
        .then(res => res.json())
        .then(json => {
          expect(json).to.be.an('object');
          expect(json.code).to.be.equal(200);
          done();
        });
    });

    it('codeToName接口测试', function (done) {
      fetch(BASE + '/codeToName?domainCode=PAY_AREA&valueCode=0598')
        .then(res => res.json())
        .then(json => {
          expect(json).to.be.an('object');
          expect(json.code).to.be.equal(200);
          expect(json.result).to.be.equal('1');
          done();
        });
    });

    it('nameToCode接口测试', function (done) {
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