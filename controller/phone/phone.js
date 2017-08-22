'use strict';

import BaseComponent from '../../prototype/baseComponent'
import ConfigurationModel from '../../models/configuration/configuration'
import formidable from 'formidable'


class Phone extends BaseComponent {
  constructor() {
    super();

    this.queryByFilter = this.queryByFilter.bind(this);
    this.occupy = this.occupy.bind(this);
    this.queryReservation = this.queryReservation.bind(this);
    this.release = this.release.bind(this);
  }

  /** /v2/phones/4g?segment=&feature=&prestore=&q=
   * qryAction!queryNumberFromSrmAction
   * 可预约号码查询，条件：号段，特点，预存，期望数字
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryByFilter(req, res, next) {
    let { segment, feature, prestore, q } = req.query;
    let staffInfo = req.session.staffInfo;

    this.msg.detail = {
      page_NUM: '1',
      page_SIZE: '100',
      numAreaType: 'CDMA',
      is_4GNBR: '0',
      limit_CHARGE: 'LIMIT_CHARGE_5',
      number_TYPE: feature, // 号码特点
      save_CHARGE: prestore, // 预存
      qry_MOBILE_NBR: {
        prod_TYPE: '11015763',
        region_CODE: staffInfo.area_CODE,
        workAreaId: staffInfo.team_ID,
        nbr_RANGE: segment, // 号段
        nbr_SECTION: q, // 期望数字
      }
    };

    this.msg.keyId = 'NUMBER_TYPE';
    this.msg.keyValue = '4G';

    let result = await this.fetch('qryAction!queryNumberFromSrmAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      Promise.resolve().then(() => {
        let list = [];
        result.number_INFO && result.number_INFO.forEach(item => {
          list.push(this.awaitAreaNameReturn(item));
        });

        Promise.all(list).then(items => {
          res.json({
            code: 200,
            result: items
          });
        });
      }).catch(err => {
        res.json({
          code: 400,
          error: '数据解析失败！'
        });
      });
    }
  }

  /**
   * 区域转换，由于是Model.find属于异步操作，所以使用async/await方式，返回Promise
   * 然后使用list保存，最后执行完成后，使用Promise.all([])方式统一处理。
   * 
   * @param {Object} item 
   */
  async awaitAreaNameReturn(item) {
    let config = await ConfigurationModel.findOne({
      domainCode: { $regex: 'COMMON_REGION_C3_', $options: 'i' },
      valueCode: item.area_CODE,
    });
    config = config || {};
    return {
      id: item.number_ID,
      phone: item.number,
      level: item.number_CLASS,
      areaCode: item.area_CODE,
      areaName: config.valueName || item.area_CODE,
      description: '预存' + (item.deposit || 0) + '元，保底' + (item.least_COST) + '元/月',
      prestore: item.deposit,
      leastCost: item.least_COST,
    };
  }

  /** /v2/phones/4g/occupation
   * qryAction!preemptNumberFromSrmAction
   * 预约号码，需要客户姓名与证件号码
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async occupy(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let { id, phone, level, areaCode, prestore, leastCost, certNo, custName } = fields;
      let staffInfo = req.session.staffInfo;

      this.msg.detail = {
        lan_ID: areaCode,
        number_LEVEL: level,
        acc_NBR: phone,
        number_ID: id,
        prestore: prestore,
        phone_NBR_PRICE: leastCost,
        staff_ID: staffInfo.staff_ID,
        orgId: staffInfo.team_ID,
        is_4GNBR: '0',
        contact_NUMBER: '',
        numAreaType: 'CDMA',
        ext_PROD_ID: '610003886',
        cert_TYPE: '1',
        cust_NAME: custName,
        cert_NBR: certNo
      };

      this.msg.keyId = 'CERT_NBR';
      this.msg.keyValue = certNo;

      let result = await this.fetch('qryAction!preemptNumberFromSrmAction', this.msg, req);

      if (result.error) {
        res.json(result);
      } else {
        res.json({
          code: 200,
          result: {
            id,
            phone,
            level,
          }
        });
      }
    });
  }

  /** /v2/phones/4g/reservation?certNo=
   * qryAction!qryAppointNumberAction
   * 已预约号码查询
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryReservation(req, res, next) {
    let { certNo } = req.query;

    this.msg.detail = {
      page_NUM: '1',
      page_SIZE: '20',
      deposit: '1',
      filter_FOUR: '0',
      is_4GNBR: '0',
      qry_RESERVE_NBR: {
        user_CODE: certNo,
        cert_TYPE: '1',
      }
    };

    this.msg.keyId = 'CERT_NUMBER';
    this.msg.keyValue = certNo;

    let result = await this.fetch('qryAction!qryAppointNumberAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      let list = [];
      result.number_INFO && result.number_INFO.forEach(item => {
        list.push({
          id: item.number_ID || '',
          phone: item.number,
          level: item.number_CLASS,
        });
      })
      res.json({
        code: 200,
        result: list
      });
    }
  }

  /**
   * 
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async release(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let { id, phone, certNo } = fields;
      let staffInfo = req.session.staffInfo;

      this.msg.detail = {
        area_CODE: staffInfo.area_CODE,
        orgId: staffInfo.team_ID,
        numAreaType: 'CDMA',
        is_4GNBR: '0',
        number: phone,
        number_ID: id,
        cert_NUMBER: certNo,
      };

      this.msg.keyId = 'CERT_NBR';
      this.msg.keyValue = certNo;

      let result = await this.fetch('qryAction!releaseNumberFromSrmAction', this.msg, req);

      if (result.error) {
        res.json(result);
      } else {
        res.json({
          code: 200
        });
      }
    });
  }
}


export default new Phone();