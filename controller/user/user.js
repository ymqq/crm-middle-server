'use strict';

import BaseComponent from '../../prototype/baseComponent'
import formidable from 'formidable'


class User extends BaseComponent {
  constructor() {
    super();

    this.login = this.login.bind(this);
    this.saveTeam = this.saveTeam.bind(this);
    this.modifyPwd = this.modifyPwd.bind(this);
    this.forgetPwdForCheckAccount = this.forgetPwdForCheckAccount.bind(this);
    this.forgetPwdForCheckSmsCode = this.forgetPwdForCheckSmsCode.bind(this);
    this.forgetPwdForSetNewPwd = this.forgetPwdForSetNewPwd.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let {account, password} = fields;
      let deviceInfo = {
        sysVerId: fields['deviceInfo[sysVerId]'],
        deviceId: fields['deviceInfo[deviceId]'],
        deviceModel: fields['deviceInfo[deviceModel]'],
        deviceSystem: fields['deviceInfo[deviceSystem]'],
        deviceSystemVersion: fields['deviceInfo[deviceSystemVersion]'],
        macAddr: fields['deviceInfo[macAddr]']
      };

      this.msg.detail = {
        loginName: account,
        password: password,
        target: 'login',
        sysType: 'CRM_MOBILE'
      };

      this.msg.keyId = 'LOGIN';
      this.msg.keyValue = account;
      this.msg.deviceInfo = deviceInfo;

      let result = await this.fetch('loginAction!login', this.msg);

      if (result.error) {
        res.json(result);
      } else {
        req.session.deviceInfo = deviceInfo;
        req.session.account = account;
        req.session.user = result;
        res.json({
          code: 200,
          result: result.team
        });
      }
    });
  }

  async saveTeam(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let {teamId, smsCode} = fields;
      let user = req.session.user;

      if (!user) {
        return res.json({
          code: 400,
          error: '亲，您还没有登录',
        });
      }

      let employee = user.employee;
      let other = user.otherLoginInfoRsp;
      let checkNumber = user.checkNumber || user.checkNumberDefault;
      let team; 
      let staffInfo = {};

      try {
        if (smsCode !== checkNumber) {
          return res.json({
            code: 400,
            error: '短信随机码验证错误'
          });
        }

        await user.team.forEach(function(t) {
          if (teamId === t.teamId) {
            team = t;
          }
        });

        staffInfo['staff_ID'] = employee.postalCode;
        staffInfo['staff_CODE'] = employee.id;
        staffInfo['staff_NAME'] = employee.partyInfo.chineseName;
        staffInfo['staff_ACCOUNT'] = employee.phone;
        staffInfo['code'] = employee.code;

        staffInfo['team_MEMBER_ID'] = team.teamMemberId;
        staffInfo['team_ID'] = team.teamId;
        staffInfo['team_NAME'] = team.teamName;
        staffInfo['area_ID'] = team.localAreaId;
        staffInfo['area_CODE'] = team.areaCode;
        staffInfo['region_CD'] = team.areaId;
        staffInfo['position_ID'] = team.positionId;
        staffInfo['channelType'] = team.channelType;
        staffInfo['channelNbr'] = team.channelNbr;
        staffInfo['channelNbr'] = team.channelNbr;
        staffInfo['is_AIR_RECHARGE'] = team.isAirRecharge;

        staffInfo['security_TOKEN'] = other.security_TOKEN;

        let token = await this.md5(staffInfo);
        req.session.staffInfo = staffInfo;
        req.session.token = token;
        req.session.logId = other.logId;
        // 登陆成功就初始化订单数据缓存节点。
        // 之后在订单受理开始时重置
        req.session.orderInfo = {};

        res.json({
          code: 200,
          token: token,
          result: staffInfo
        });
      } catch(err) {
        console.log('saveTeam', err);
        res.json({
          code: 200,
          error: '保存团队失败'
        });
      }
    });
  }

  async modifyPwd(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let {account, oldPassowrd, newPassword} = fields;

      if (account !== req.session.account) {
        return res.json({
          code: 400,
          error: '帐号错误'
        });
      }

      this.msg.detail.old_PASSWORD = oldPassowrd;
      this.msg.detail.new_PASSWORD = newPassword;

      this.msg.keyId = 'STAFF_CODE';
      this.msg.keyValue = account;

      let result = await this.fetch('userAction!staffPasswordModAction', this.msg, req);

      if (result.error) {
        res.json(result);
      } else {
        res.json({
          code: 200
        });
      }
    });
  }

  /**
   * 接口成功返回没有测试，后续正式使用时，再联调翼销售服务器调试。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async forgetPwdForCheckAccount(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let {account, mobile, certNo} = fields;

      if (!account || !mobile || !certNo) {
        return res.json({
          code: 400,
          error: '请求参数错误'
        });
      }

      this.msg.detail.staff_CODE = account;
      this.msg.detail.mobile_NUMBER = mobile;
      this.msg.detail.cert_NUMBER = certNo;

      this.msg.keyId = 'STAFF_CODE';
      this.msg.keyValue = account;

      let result = await this.fetch('userAction!userCheckAction', this.msg);

      if (result.error) {
        res.json(result);
      } else {
        req.session.forgetPwd = {
          account: account,
          mobile: mobile,
          certNo: certNo,
          smsCode: result.verify_CODE.check_CODE
        };
        res.json({
          code: 200,
          hint: '请输入序号[' + result.verify_CODE.verify_SEQ + ']短信随机码',
          error: '已发送短信随机码到绑定手机，请查收！'
        });
      }
    });
  }

  async forgetPwdForCheckSmsCode(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let smsCode = fields.smsCode;

      if (!smsCode) {
        return res.json({
          code: 400,
          error: '请求参数错误'
        });
      }

      if (smsCode !== req.session.forgetPwd.smsCode) {
        res.json({
          code: 400,
          error: '验证码错误！'
        });
      } else {
        res.json({
          code: 200
        });
      }
    });
  }

  async forgetPwdForSetNewPwd(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let {account, mobile, certNo} = req.session.forgetPwd;
      let newPassword = fields.newPassword;

      this.msg.detail.staff_CODE = account;
      this.msg.detail.mobile_NUMBER = mobile;
      this.msg.detail.cert_NUMBER = certNo;
      this.msg.detail.new_PWD = newPassword;

      this.msg.keyId = 'STAFF_CODE';
      this.msg.keyValue = account;

      let result = await this.fetch('userAction!modAccountPasswordAction', this.msg);

      if (result.error) {
        res.json(result);
      } else {
        res.json({
          code: 200
        });
      }
    });
  }

  async logout(req, res, next) {
    try {
      req.session.account = null;
      req.session.staffInfo = null;
      req.session.user = null;
      req.session.token = null;
      req.session.logId = null;
      req.session.deviceInfo = null;

      res.json({
        code: 200
      });
    } catch(err) {
      console.log('logout', err);
      res.json({
        code: 400,
        error: '清除Session信息失败'
      });
    }
  }

}

export default new User();