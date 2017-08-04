'use strict';

import BaseComponent from '../../prototype/baseComponent'
import formidable from 'formidable'


class Address extends BaseComponent {
  constructor() {
    super();

    this.queryForFj = this.queryForFj.bind(this);
    this.queryDetailForFj = this.queryDetailForFj.bind(this);
    this.chooseAddressForFj = this.chooseAddressForFj.bind(this);
    this.queryForHn = this.queryForHn.bind(this);
    this.queryCoverInfoForHn = this.queryCoverInfoForHn.bind(this);
    this.chooseAddressForHn = this.chooseAddressForHn.bind(this);
  }


  /** /v2/addresses/fj?q=&parentId=
   * qryAction!qryAddrByCdnAction
   * 查询装机地址，根据关键字与父地址ID查询，由于地址层级多，不应该考虑复用列表展示。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryForFj(req, res, next) {
    let pageCount = 20;
    let { q, parentId, page } = req.query;
    let staffInfo = req.session.staffInfo;

    // 两个都不能为空
    // 只有parentId时查询父地址ID下的所有地址列表
    // 只有q时，查询权限范围内的所有模糊匹配地址列表
    // 同时有q与parentID时，查询父地址下的模糊匹配地址列表
    if (!q && !parentId) {
      return res.json({
        code: 400,
        error: '请求参数错误！'
      });
    }

    this.msg.detail.pages = {
      page: page + '',
      page_COUNT: pageCount + ''
    };

    this.msg.detail.parent_ADDRESS_ID = parentId;
    this.msg.detail.addrName = q;
    this.msg.detail.area_CODE = staffInfo.area_CODE;

    this.msg.keyId = 'AREA_CODE';
    this.msg.keyValue = staffInfo.area_CODE;

    let result = await this.fetch('qryAction!qryAddrByCdnAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }
  }

  /** /v2/addresses/fj/detail?id=&areaCode
   * qryAction!qryAddrDetailAction
   * 查询装机地址详情信息
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryDetailForFj(req, res, next) {
    let { id, areaCode } = req.query;

    if (!id || !areaCode) {
      return res.json({
        code: 400,
        error: '请求参数错误！'
      });
    }

    this.msg.detail.address_ID = id;
    this.msg.detail.area_CODE = areaCode;

    this.msg.keyId = 'ADDRESS_ID';
    this.msg.keyValue = id;

    let result = await this.fetch('qryAction!qryAddrDetailAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }
  }

  /** /v2/addresses/fj/choice
   * qryAction!chooseAddrAction
   * 选址装机地址，使用产品实例ID与产品规格ID占用选中地址。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async chooseAddressForFj(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let { addressId, productInstId, productSpecId } = fields;

      if (!addressId || !productInstId || !productSpecId) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      this.msg.detail.area_CODE = req.session.staffInfo.area_CODE;
      this.msg.detail.address_ID = addressId;
      this.msg.detail.prod_ID = productInstId;
      this.msg.detail.prodSpecId = productSpecId;
      // 该标识需要根据产品规格ID去判断：固话(1)与宽带(2) iTV跟着宽带走
      this.msg.detail.flag = config.productClass.gh.indexOf(productSpecId) > -1 ? '1' : '2';

      this.msg.keyId = 'ADDRESS_ID';
      this.msg.keyValue = addressId;

      let result = await this.fetch('qryAction!chooseAddrAction', this.msg, req);

      if (result.error) {
        res.json(result);
      } else {
        let data = {
          id: result.addr_ID,
          fullName: result.addr_NAME,
          exchId: result.exch_ID,
          exchName: result.exch_NAME,
          areaCode: result.sub_AREA_CODE,
          productInstId,
          mesureId: result.mesure_ID,
          mesureName: result.mesure_NAME
        };
        req.session.orderInfo.address = data;
        res.json({
          code: 200,
          result: data
        });
      }
    });
  }

  /** /v2/addresses/hn?q=&type=&page=&areaCode=
   * qryAction!qryAddrInfoAction
   * 查询装机地址，根据关键字与类型查询
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryForHn(req, res, next) {
    let pageCount = 20;
    let { q, type, page, areaCode } = req.query;

    if (!q || !type || !page || !areaCode) {
      return res.json({
        code: 400,
        error: '请求参数错误！'
      });
    }

    this.msg.detail.fromeCode = (pageCount * (page - 1) + 1) + '';
    this.msg.detail.endCode = pageCount * page + '';
    this.msg.detail.obdCode = type === 'OBD' ? q : '';
    this.msg.detail.addrName = type === 'ADDRESS' ? q : '';
    this.msg.detail.areaCode = areaCode;

    this.msg.keyId = 'AREA_CODE';
    this.msg.keyValue = areaCode;

    let result = await this.fetch('qryAction!qryAddrInfoAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      let list = [];
      result.addressInfo && result.addressInfo.forEach(item => {
        list.push({
          id: item.addrId,
          name: item.name,
          fullName: item.fullName,
          areaCode: item.areaCode,
          geoId: item.geoId,
          nonModifiablePart: item.noModeName,
          modifiablePart: item.modeName,
        });
      });
      res.json({
        code: 200,
        result: list
      });
    }
  }

  /** /v2/addresses/hn/resourcesCover?id=&fullName=&areaCode=
   * qryAction!qryAddrCoverAction
   * 查询选中的地址资源覆盖信息
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryCoverInfoForHn(req, res, next) {
    let { id, fullName, areaCode } = req.query;

    if (!id || !fullName || !areaCode) {
      return res.json({
        code: 400,
        error: '请求参数错误！'
      });
    }

    this.msg.detail.addrId = id;

    this.msg.keyId = 'ADDRESS_ID';
    this.msg.keyValue = id;

    let result = await this.fetch('qryAction!qryAddrCoverAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }
  }

  /** /v2/addresses/hn/choice
   * 选择装机地址，将选择的地址保存在session中。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async chooseAddressForHn(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      let { id, fullName, areaCode, exchId, exchName, mesureId, mesureName, geoId } = fields;

      if (!id || !fullName || !areaCode || !exchId
        || !exchName || !mesureId || !mesureName || !geoId) {

        return res.json({
          code: 400,
          error: '请求数据错误'
        });
      }

      req.session.orderInfo.address = {
        id,
        fullName,
        areaCode,
        exchId,
        exchName,
        mesureId,
        mesureName,
        geoId,
      };
    });
  }


}


export default new Address();