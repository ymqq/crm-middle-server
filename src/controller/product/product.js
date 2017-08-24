'use strict';

import BaseComponent from '../../prototype/baseComponent'


class Product extends BaseComponent {
  constructor() {
    super();

    this.queryProductsByAccNbr = this.queryProductsByAccNbr.bind(this);
    this.queryProductByProdInstId = this.queryProductByProdInstId.bind(this);
    this.queryProductByProdOfferInstId = this.queryProductByProdOfferInstId.bind(this);
    this.queryProductsByAccNbrAndCustId = this.queryProductsByAccNbrAndCustId.bind(this);
    this.queryProdOffersByCustId = this.queryProdOffersByCustId.bind(this);
  }

  /** /v1/products/byAccNbr?accNbr=
   * （query_TYPE='1'）根据接入号码查询产品信息，
   * 返回产品简要信息（产品实例ID，产品ID，号码，产品名称，
   * 区域编码，销售品名称，销售品编码，状态编码，产权客户ID）
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryProductsByAccNbr(req, res, next) {
    let { accNbr } = req.query;

    if (!accNbr) {
      return res.json({
        code: 400,
        error: '接入号码不能为空'
      });
    }

    this.msg.detail.query_TYPE = '1';
    this.msg.detail.acc_NBR = accNbr;

    this.msg.keyId = 'ACC_NBR';
    this.msg.keyValue = accNbr;

    let result = await this.fetch('qryAction!qryProdOfferInstDetailByCdnAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }
  }

  /** /v1/products/byProdInstId?prodInstId=
   * （query_TYPE='2'）根据接入号码查询产品信息，返回销售品详情信息(唯一)
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryProductByProdInstId(req, res, next) {
    let { prodInstId } = req.query;

    if (!prodInstId) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.detail.query_TYPE = '2'
    this.msg.detail.prod_INST_ID = prodInstId;

    this.msg.keyId = 'PROD_INST_ID';
    this.msg.keyValue = prodInstId;

    let result = await this.fetch('qryAction!qryProdOfferInstDetailByCdnAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }
  }

  /** /v1/products/byProdOfferInstId?prodOfferInstId=
   * （query_TYPE='3'）根据销售品实例ID查询产品信息，返回销售品详情信息(唯一)
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryProductByProdOfferInstId(req, res, next) {
    let { prodOfferInstId } = req.query;

    if (!prodOfferInstId) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.detail.query_TYPE = '3'
    this.msg.detail.prod_OFFER_INST_ID = prodOfferInstId;

    this.msg.keyId = 'PROD_OFFER_INST_ID';
    this.msg.keyValue = prodOfferInstId;

    let result = await this.fetch('qryAction!qryProdOfferInstDetailByCdnAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }
  }

  /** /v1/products/byAccNbrAndCustId?accNbr=&custId=
   * （query_TYPE='6'）根据接入号码与客户ID查询查询产品信息，返回销售品详情信息
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryProductsByAccNbrAndCustId(req, res, next) {
    let { accNbr, custId } = req.query;

    if (!accNbr || !custId) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.detail.query_TYPE = '6';
    this.msg.detail.acc_NBR = accNbr;
    this.msg.detail.cust_ID = custId;

    this.msg.keyId = 'ACC_NBR+CUST_ID';
    this.msg.keyValue = accNbr + '+' + custId;

    let result = await this.fetch('qryAction!qryProdOfferInstDetailByCdnAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }
  }

  /** /v1/products/prodOffers/byCustId?custId=
   * 根据客户ID查询客户名下所有销售品列表(列表)
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryProdOffersByCustId(req, res, next) {
    let { custId } = req.query;

    if (!custId) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.detail.cust_ID = custId;
    this.msg.detail.pages = {
      page: '1',
      page_COUNT: '100'
    };

    this.msg.keyId = 'CUST_ID';
    this.msg.keyValue = custId;

    let result = await this.fetch('qryAction!qryProdOfferInstListByCdnAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }
  }
}


export default new Product();