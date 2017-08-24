'use strict';

import BaseComponent from '../../prototype/baseComponent'


class Customer extends BaseComponent {
  constructor() {
    super();

    this.queryByCert = this.queryByCert.bind(this);
    this.queryByAccNbr = this.queryByAccNbr.bind(this);
    this.queryByCustId = this.queryByCustId.bind(this);
  }

  /** /v1/customers/byCert?certType=&certNo=
   * 根据证件号码查询客户信息
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryByCert(req, res, next) {
    let { certType, certNo } = req.query;

    if (!certType || !certNo) {
      return res.json({
        code: 400,
        error: '请求参数错误!'
      });
    }

    // 使用证件号码查询，固定值
    this.msg.detail.query_TYPE = '1';
    // 证件号码
    this.msg.detail.identify_CODE = certNo;
    // 证件类型
    this.msg.detail.identify_CODE_TYPE = certType;

    this.msg.keyId = 'IDENTITY_CODE';
    this.msg.keyValue = certNo;

    let result = await this.fetch('qryAction!queryCustInfoAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result.customer
      });
    }
  }

  /** /v1/customers/byAccNbr?accNbr=
   * 根据接入号码查询客户信息
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryByAccNbr(req, res, next) {
    let { accNbr } = req.query;

    if (!accNbr) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    // 使用接入号码查询，固定值
    this.msg.detail.query_TYPE = '3';
    // 接入号码
    this.msg.detail.acc_NBR = accNbr;

    this.msg.keyId = 'ACC_NBR';
    this.msg.keyValue = accNbr;

    let result = await this.fetch('qryAction!queryCustInfoAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result.customer
      });
    }
  }

  /** /v1/customers/byCustId?custId=
   * 根据客户id查询客户信息
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryByCustId(req, res, next) {
    let { custId } = req.query;

    if (!custId) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    // 使用客户ID查询，固定值
    this.msg.detail.query_TYPE = '2';
    // 客户ID
    this.msg.detail.cust_ID = custId;

    this.msg.keyId = 'CUST_ID';
    this.msg.keyValue = custId;

    let result = await this.fetch('qryAction!queryCustInfoAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result.customer
      });
    }
  }

}

export default new Customer();