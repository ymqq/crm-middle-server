'use strict';

import BaseComponent from '../../prototype/baseComponent'


class Zone extends BaseComponent {
  constructor() {
    super();

    this.queryAll = this.queryAll.bind(this);
    this.queryItemBySaleOrderType = this.queryItemBySaleOrderType.bind(this);
    this.queryZoneBySaleOrderType = this.queryZoneBySaleOrderType.bind(this);
  }

  /** /v2/zones/all
   * 查询所有专区数据：快捷专区、天翼专区、3升4专区、宽带专区...
   * 只返回一级专区列表，二级数据需要使用另外接口查询。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryAll(req, res, next) {
    let saleOrderType = 'CONTAIN_SCENE_AREA';
    this.msg.detail.sale_ORDER_TYPE = saleOrderType;
    this.msg.detail.is_QUERY_TWO_LEVEL = 'NO';

    this.msg.keyId = 'SALE_ORDER_TYPE';
    this.msg.keyValue = saleOrderType;

    let result = await this.fetch('qryAction!qryFunctionMenuAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      this.zoneListDataHandler(result, res);
    }
  }

  /** /v2/zones/zone?saleOrderType=
   * qryAction!qryFunctionMenuAction
   * 查询单个专区下的场景列表数据。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryZoneBySaleOrderType(req, res, next) {
    let saleOrderType = req.query.saleOrderType;

    if (!saleOrderType) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.detail.sale_ORDER_TYPE = saleOrderType;
    this.msg.detail.is_QUERY_TWO_LEVEL = 'NO';

    this.msg.keyId = 'SALE_ORDER_TYPE';
    this.msg.keyValue = saleOrderType;

    let result = await this.fetch('qryAction!qryFunctionMenuAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      this.zoneListDataHandler(result, res);
    }
  }

  /** /v2/zones/item?saleOrderType=
   * qryAction!qryServiceMenuByCdnAction
   * 根据saleOrderType查询场景配置。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async queryItemBySaleOrderType(req, res, next) {
    let saleOrderType = req.query.saleOrderType;

    if (!saleOrderType) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.detail.service_CODE = saleOrderType;


    this.msg.keyId = 'SERVICE_CODE';
    this.msg.keyValue = saleOrderType;

    let result = await this.fetch('qryAction!qryServiceMenuByCdnAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      this.zoneItemDataHandler(result, res);
    }
  }

  /**
   * 专区列表数据整理方法，这里将CRM翼销售返回的数据节点重新组装，剔除多余的节点。
   * 
   * @param {Object} result 
   * @param {Response} res 
   */
  zoneListDataHandler(result, res) {
    Promise.resolve().then(() => {
      let list = [];
      result.function_MENU_LIST && result.function_MENU_LIST.forEach(item => {
        let data = {
          id: item.function_ID,
          name: item.function_NAME,
          description: item.function_DESC,
          type: item.function_TYPE,
          typeName: item.function_TYPE_NAME,
          code: item.function_CODE,
          saleOrderType: item.sale_ORDER_TYPE,
          sort: item.display_SORT,
          enabled: item.is_EFFECTIVE === '1000',
        };
        list.push(data);
      });
      res.json({
        code: 200,
        result: list
      });
    }).catch(err => {
      res.json({
        code: 400,
        error: '数据解析失败！'
      });
    });
  }

  /**
   * 专区场景单项数据整理，剔除多余节点，同时将业务控件配置列表与更多信息配置列表优化整理
   * 
   * @param {*} result 
   * @param {*} res 
   */
  zoneItemDataHandler(result, res) {
    Promise.resolve().then(() => {
      let menu = result.service_MENU_LIST[0];
      let data = {
        id: menu.operation_ID,
        name: menu.operation_NAME,
        code: menu.operation_CODE,
        type: menu.operation_TYPE,
        saleOrderType: menu.sale_ORDER_TYPE,
        businessAttrList: this.attrDataHandler(menu.operation_ATTR_LIST),
        otherAttrList: this.attrDataHandler(menu.other_ATTR_LIST),
      };
      res.json({
        code: 200,
        result: data
      });
    }).catch(err => {
      res.json({
        code: 400,
        error: '数据解析失败！'
      })
    });
  }

  /**
   * 专区属性列表数据整理
   * 
   * @param {Array} list 
   */
  attrDataHandler(list) {
    let attrList = [];
    list && list.forEach(item => {
      let attr = {
        id: item.attr_ID,
        name: item.attr_NAME,
        type: item.attr_TYPE,
        valueId: '',
        value: item.default_VALUE || '',
        valueList: item.attr_VALUE_LIST,
        notNull: item.is_MUST_FILL_IN === '1',
        productIds: item.product_IDS,
      };

      let valueList = [];
      item.attr_VALUE_LIST && item.attr_VALUE_LIST.forEach(value => {
        valueList.push({
          id: value.attr_VALUE_ID,
          name: value.attr_VALUE_NAME,
          value: value.attr_VALUE
        });
      });

      attrList.push(attr);
    });
    return attrList;
  }

}


export default new Zone();