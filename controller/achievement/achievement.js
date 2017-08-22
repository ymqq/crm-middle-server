'use strict';

import BaseComponent from '../../prototype/baseComponent'
import moment from 'moment'
import ConfigurationModel from '../../models/configuration/configuration'


class Achievement extends BaseComponent {
  constructor() {
    super();

    this.saleOrderTypeConfig = [];

    this.getStartDate = this.getStartDate.bind(this);
    this.getEndDate = this.getEndDate.bind(this);

    this.getTodayStatistics = this.getTodayStatistics.bind(this);
    this.getSaleOrderList = this.getSaleOrderList.bind(this);
    this.getCancelledOrderCount = this.getCancelledOrderCount.bind(this);
    this.getCancelledOrderList = this.getCancelledOrderList.bind(this);
    this.getOrderAgreement = this.getOrderAgreement.bind(this);
    this.getOrderPhotos = this.getOrderPhotos.bind(this);
    this.getCrmOrderPoolStatistics = this.getCrmOrderPoolStatistics.bind(this);
    this.getCrmOrderPoolList = this.getCrmOrderPoolList.bind(this);
    this.getCrmOrderPoolDetail = this.getCrmOrderPoolDetail.bind(this);
    this.getCrmOrderCancelledReason = this.getCrmOrderCancelledReason.bind(this);

    this.getSaleOrderTypeConfigs = this.getSaleOrderTypeConfigs.bind(this);
  }

  /**
   * 获取特定格式的日期字符串
   * 
   * @param {*} date 
   * @param {String} type START / END
   */
  getFormatDate(date, type = 'START') {
    let suffix = 'END' === type ? ' 23:59:59' : ' 00:00:00';
    return moment(new Date(date)).format('YYYY-MM-DD') + suffix;
  }

  /**
   * 获取开始日期字符串
   * 
   * @param {*} date 
   */
  getStartDate(date = new Date()) {
    return this.getFormatDate(date);
  }

  /**
   * 获取结束日期字符串
   * 
   * @param {*} date 
   */
  getEndDate(date = new Date()) {
    return this.getFormatDate(date, "END");
  }

  /** /v2/achievements/today/statistics
   * qryAction!qryPreSaleOrdInfoByCdnAction
   * 查询当日员工业绩统计情况以及订单列表。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getTodayStatistics(req, res, next) {
    this.msg.keyId = 'STATISTICS';
    this.msg.keyValue = new Date();

    this.msg.detail = {
      begin_DATE: this.getStartDate(),
      end_DATE: this.getEndDate(),
      target: '10',
      pages: {
        page: '1',
        page_COUNT: '100'
      }
    };

    let result = await this.fetch('qryAction!qryPreSaleOrdInfoByCdnAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      let pages = result.pages || {};
      let data = {
        totalCount: parseInt(pages.total) || 0,
        amount: {
          total: pages.all_BILL || '0.00',
          paid: pages.pay_BILL || '0.00',
        },
        sold: {
          status: '0001',
          name: '已销售',
          count: 0,
        },
        payment: {
          status: '0002',
          name: '待缴费',
          count: 0,
        },
        accept: {
          status: '0003',
          name: '待受理',
          count: 0,
        },
        accepted: {
          status: '0004',
          name: '已受理',
          count: 0,
        },
        completed: {
          status: '0005',
          name: '已完成',
          count: 0,
        },
        failure: {
          status: '0006',
          name: '销售失败',
          count: 0,
        },
        confirm: {
          status: '0008',
          name: '待确认',
          count: 0,
        }
      };
      result.order_STATISTICS_LIST && result.order_STATISTICS_LIST.forEach(item => {
        let count = parseInt(item.total) || 0;
        let status = item.status_ID || '';
        switch (status) {
          case '0001': // 已销售
            data.sold.count = count;
            break;
          case '0002': // 待缴费
            data.payment.count = count;
            break;
          case '0003': // 待受理
            data.accept.count = count;
            break;
          case '0004': // 已受理
            data.accepted.count = count;
            break;
          case '0005': // 已完成
            data.completed.count = count;
            break;
          case '0006': // 销售失败
            data.failure.count = count;
            break;
          case '0008': // 待确认
            data.confirm.count = count;
            break;
        }
      });
      res.json({
        code: 200,
        result: data
      });
    }

  }


  /** /v2/achievements/list?startDay=yyyy-MM-dd&endDay=yyyy-MM-dd&status=
   * qryAction!qryPreSaleOrdInfoByCdnAction
   * 查询指定日期范围的订单列表数据，同时支持查询指定状态的订单列表数据。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getSaleOrderList(req, res, next) {
    let { startDay, endDay, status } = req.query;

    /**
     * 若起始日期与结束日期为空且状态也为空，则参数错误，
     * 若起始日期与结束日期为空且状态不为空，则查询指定状态的当日列表，
     * 若起始日期与结束日期不为空且状态不为空，则查询指定日期范围的指定状态列表
     * 若起始日期与结束日期不为空且状态也为空，则查询指定日期返回的列表
     */
    if (!startDay && !endDay && !status) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.keyId = 'LIST';
    this.msg.keyValue = 'QUERY_LIST';

    this.msg.detail = {
      begin_DATE: this.getStartDate(startDay),
      end_DATE: this.getEndDate(endDay),
      target: '10',
      stat_CD: status,
      pages: {
        page: '1',
        page_COUNT: '100'
      }
    };

    let result = await this.fetch('qryAction!qryPreSaleOrdInfoByCdnAction', this.msg, req);

    if (result.error) {
      return res.json(result);
    }

    await this.getSaleOrderTypeConfigs();

    let list = [];
    result.pre_SALE_INFO_LIST && result.pre_SALE_INFO_LIST.forEach(item => {
      let status = item.status || '';
      list.push({
        saleOrderNbr: item.sale_ORDER_NBR || '',
        crmOrderNbr: item.cust_ORDER_NBR || '',
        custName: item.cust_NAME || '',
        status: item.stat_NAME || '',
        preAmount: item.pre_AMOUNT || '0.00',
        acceptTime: item.create_DATE || '',
        // 待支付: 已登记且费用大于0
        payable: '100300' === status && parseFloat(item.pre_AMOUNT) > 0,
        // 可撤销:   ['已登记',  '已收费',  '部分竣工', '已转正', '部分转正', '']
        cancelable: ['100300', '100400', '100299', '200000', '200001', '300001'].indexOf(status) > -1,
        // 可作废：重新销售 或者 销售中
        canDelete: ['100102', '100103'].indexOf(status) > -1,
        // 重新销售：重新销售且在配置表中有配置的场景类型
        needResale: '100102' === status && this.saleOrderTypeConfig.indexOf(item.sale_ORDER_TYPE) > -1,
        // 待确认
        needConfirm: '100001' === status,
      });
    });
    res.json({
      code: 200,
      result: list
    });

  }


  /**
   * 获取销售订单类型编码配置数据
   */
  async getSaleOrderTypeConfigs() {
    if (this.saleOrderTypeConfig.length === 0) {
      let configs = await ConfigurationModel.find({
        domainCode: { $regex: 'PHOTO_ORDER_TYPE', $options: 'i' },
      });

      this.saleOrderTypeConfig = configs.map(item => {
        return item.valueCode;
      });
    }
  }


  /** /v2/achievements/cancelled/count
   * saleOrderAction!qryCanceledPreSaleOrdAction
   * 查询已退单列表数量。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getCancelledOrderCount(req, res, next) {
    this.msg.keyId = 'COUNT';
    this.msg.keyValue = new Date();

    this.msg.detail = {
      begin_DATE: this.getStartDate(),
      end_DATE: this.getEndDate(),
      sort_TYPE: 'desc',
      pages: {
        page: '1',
        page_COUNT: '100'
      }
    };

    let result = await this.fetch('saleOrderAction!qryCanceledPreSaleOrdAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: parseInt(result.pages.total) || 0
      });
    }

  }


  /** /v2/achievements/cancelled/list
   * saleOrderAction!qryCanceledPreSaleOrdAction
   * 查询已退单列表数据。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getCancelledOrderList(req, res, next) {
    this.msg.keyId = 'LIST';
    this.msg.keyValue = new Date();

    this.msg.detail = {
      begin_DATE: this.getStartDate(),
      end_DATE: this.getEndDate(),
      sort_TYPE: 'desc',
      pages: {
        page: '1',
        page_COUNT: '100'
      }
    };

    let result = await this.fetch('saleOrderAction!qryCanceledPreSaleOrdAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      Promise.resolve().then(() => {
        let list = [];
        result.pre_SALE_INFO_LIST && result.pre_SALE_INFO_LIST.forEach(item => {
          list.push(this.awaitStatusNameReturn(item));
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
   * 状态转换，由于是Model.find属于异步操作，所以使用async/await方式，返回Promise
   * 然后使用list保存，最后执行完成后，使用Promise.all([])方式统一处理。
   * 
   * @param {Object} item 
   */
  async awaitStatusNameReturn(item) {
    let config = await ConfigurationModel.findOne({
      domainCode: { $regex: 'SALE_ORDER_STATUS_CD', $options: 'i' },
      valueCode: item.status,
    });
    config = config || {};
    let reason = item.canceled_ORDER_REASON || {};
    return {
      saleOrderNbr: item.sale_ORDER_NBR,
      crmOrderNbr: item.cust_ORDER_NBR,
      status: config.valueName || item.status,
      reason: reason.goback_REASON || '',
      staffInfo: item.staff_NAME + '(' + (reason.phone_NUMBER || '') + ')',
      cancelable: true,
      canResend: item.pre_HANDLE_FLAG === 'T',
    };
  }


  /** /v2/achievements/agreement?saleOrderNbr=
   * qryAction!queryAgreeMentPrintAction
   * 查询预受理单协议内容
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getOrderAgreement(req, res, next) {
    let { saleOrderNbr } = req.query;

    if (!saleOrderNbr) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.keyId = 'SALE_ORDER_NBR';
    this.msg.keyValue = saleOrderNbr;

    this.msg.detail.pre_SALE_ORDER_NO = saleOrderNbr;

    let result = await this.fetch('qryAction!queryAgreeMentPrintAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      let order = result.pre_SALE_INFO_LIST || {};
      let config = await ConfigurationModel.findOne({
        domainCode: { $regex: 'SALE_ORDER_STATUS_CD', $options: 'i' },
        valueCode: order.status,
      });

      config = config || {};

      let data = {
        agreement: result.pre_SALE_ORDER_INFO || '',
        status: config.valueName || order.status || '',
        description: order.disposal_RESULT_DESC || '',
        saleOrderNbr: order.sale_ORDER_NBR || '',
      };
      res.json({
        code: 200,
        result: data
      });
    }

  }


  /** /v2/achievements/orderPhotos?saleOrderNbr=
   * saleOrderAction!qryPreSaleOrderPhotoAction
   * 查询预受理订单照片
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getOrderPhotos(req, res, next) {
    let { saleOrderNbr } = req.query;

    if (!saleOrderNbr) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      });
    }

    this.msg.keyId = 'SALE_ORDER_NBR';
    this.msg.keyValue = saleOrderNbr;

    this.msg.detail.sale_ORDER_NBR = saleOrderNbr;

    let result = await this.fetch('saleOrderAction!qryPreSaleOrderPhotoAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      let list = [];
      result.photo_LIST && result.photo_LIST.forEach(item => {
        list.push({
          base64: item.base64,
          type: item.upload_TYPE,
        });
      })
      res.json({
        code: 200,
        result: list
      });
    }

  }



  /** /v2/achievements/crmOrderPool/statistics?type=[staff|team]startDay=yyyy-MM-dd&endDay=yyyy-MM-dd
   * saleOrderAction!qryPreSaleOrderCountAction
   * 查询CRM工单池统计情况，支持日期查询，同时支持查询团队或个人工单池数据。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getCrmOrderPoolStatistics(req, res, next) {
    let { type, startDay, endDay } = req.query;

    /**
     * type为空时，默认staff
     * startDay与endDay为空时，默认当日
     */

    type = type || 'staff';

    this.msg.keyId = 'HANDLE_CODE';
    this.msg.keyValue = '1';

    this.msg.detail = {
      begin_DATE: this.getStartDate(startDay),
      end_DATE: this.getEndDate(endDay),
      handle_CODE: '1',
      select_TYPE: type.toUpperCase(),
      pages: {
        page: '1',
        page_COUNT: '100'
      }
    };

    let result = await this.fetch('saleOrderAction!qryPreSaleOrderCountAction', this.msg, req);

    if (result.error) {
      res.json(result);
    } else {
      res.json({
        code: 200,
        result: result
      });
    }

  }



  /** /v2/achievements/crmOrderPool/list?status=&type=[staff|team]&startDay=yyyy-MM-dd&endDay=yyyy-MM-dd
   * saleOrderAction!qryPreSaleOrderCountAction
   * 查询CRM工单池指定状态的列表数据
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getCrmOrderPoolList(req, res, next) {
    let { type, startDay, endDay, status } = req.query;

    if (!status) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      })
    }

    /**
     * type为空时，默认staff
     * startDay与endDay为空时，默认当日
     */
    type = type || 'staff';

    this.msg.keyId = 'HANDLE_CODE';
    this.msg.keyValue = '2';

    this.msg.detail = {
      begin_DATE: this.getStartDate(startDay),
      end_DATE: this.getEndDate(endDay),
      handle_CODE: '2',
      select_TYPE: type.toUpperCase(),
      status_CD: status,
      pages: {
        page: '1',
        page_COUNT: '100'
      }
    };

    let result = await this.fetch('saleOrderAction!qryPreSaleOrderCountAction', this.msg, req);

    if (result.error) {
      return res.json(result);
    }

    let list = [];
    result.pre_SALE_ORDER && result.pre_SALE_ORDER.forEach(item => {
      list.push({
        id: item.pre_SALE_ORDER_ID || '',
        status: item.status_CD || '',
        acceptTime: item.receive_DATE || '',
        saleOrderNbr: item.sale_ORDER_NBR || '',
        crmOrderNbr: item.cust_ORDER_NBR || '',
      })
    });

    res.json({
      code: 200,
      result: list
    });

  }



  /** /v2/achievements/crmOrderPool/detail?id=&status=&saleOrderNbr=&crmOrderNbr=
   * saleOrderAction!qryPreSaleOrderCountAction
   * 查询CRM工单详情
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getCrmOrderPoolDetail(req, res, next) {
    let { id, status, saleOrderNbr, crmOrderNbr } = req.query;

    if (!id || !status || !saleOrderNbr || !crmOrderNbr) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      })
    }

    this.msg.keyId = 'HANDLE_CODE';
    this.msg.keyValue = '3';

    this.msg.detail = {
      begin_DATE: '',
      end_DATE: '',
      handle_CODE: '3',
      select_TYPE: '',
      status_CD: status,
      pre_SALE_ORDER_ID: id,
      pages: {
        page: '1',
        page_COUNT: '100'
      }
    };

    let result = await this.fetch('saleOrderAction!qryPreSaleOrderCountAction', this.msg, req);

    if (result.error) {
      return res.json(result);
    }

    let pool = result.pre_SALE_ORDER_POOL;
    let detail = {
      saleOrderNbr,
      crmOrderNbr,
      status,
      createStaff: pool.create_STAFF || '无',
      otherMsg: pool.other_INFO || '无',
    };

    if (status.indexOf('已撤单') === -1) {
      detail.acceptStaff = pool.staff_NAME || '无';
      detail.acceptTime = pool.accept_DATE || '无';
    } else {
      detail.cancelStaff = pool.staff_NAME || '无';
      detail.cancelTime = pool.accept_DATE || '无';
      detail.cancelMsg = pool.note || '无';
    }

    res.json({
      code: 200,
      result: detail
    });

  }



  /** /v2/achievements/crmOrderPool/cancelDetail?saleOrderNbr=
   * saleOrderAction!queryPreOrderFlowAction
   * 查看CRM工单池撤单原因详细信息
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getCrmOrderCancelledReason(req, res, next) {
    let { saleOrderNbr } = req.query;

    if (!saleOrderNbr) {
      return res.json({
        code: 400,
        error: '请求参数错误'
      })
    }

    this.msg.keyId = 'SALE_ORDER_NBR';
    this.msg.keyValue = saleOrderNbr;

    this.msg.detail.pre_SALE_ORDER_NO = saleOrderNbr;

    let result = await this.fetch('saleOrderAction!queryPreOrderFlowAction', this.msg, req);

    if (result.error) {
      return res.json(result);
    }

    let list = [];

    result.flow_INFO && result.flow_INFO.forEach(item => {
      let status = item.action_NAME || '';
      let data = {
        status,
        handleTime: item.operate_DATE || '',
        description: item.desc || '',
      };

      if (status.indexOf('重送') === -1) {
        data.acceptStaff = item.staff_NAME || '';
      } else {
        data.cancelStaff = item.staff_NAME || '';
      }

      list.push(data);
    });

    res.json({
      code: 200,
      result: list
    });
  }

}


export default new Achievement();