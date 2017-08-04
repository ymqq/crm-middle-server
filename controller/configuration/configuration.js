'use strict';

import ConfigurationModel from '../../models/configuration/configuration'
import BaseComponent from '../../prototype/baseComponent'

class Configuration extends BaseComponent {
  constructor() {
    super();

    this.update = this.update.bind(this);
    this.find = this.find.bind(this);
    this.codeToName = this.codeToName.bind(this);
    this.nameToCode = this.nameToCode.bind(this);
  }

  /**
   * 向CRM翼销售服务器发起全局数据配置更新请求 <br/>
   * 当请求间隔小于5分钟，默认是最新的数据，不发送请求，直接返回成功。
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async update(req, res, next) {
    let versionConfig = await ConfigurationModel.findOne({
      domainCode: 'VERSION_NO',
      valueName: 'VERSION_NO'
    });

    if (!versionConfig.id || Date.now() - parseInt(versionConfig.id) < 5 * 60 * 1000) {
      return res.json({
        code: 200
      });
    }

    this.msg.detail = {
      target: 'CONFIG_VERSION',
      version_NO: versionConfig.valueCode
    };
    this.msg.keyId = 'CONFIG_VERSION_NO';
    this.msg.keyValue = '0';

    let result = await this.fetch('loginAction!queryConfigInfoAction', this.msg);

    if (result.error) {
      return res.json(result);
    }

    this.saveConfigurations(result).then(() => {
      res.json({
        code: 200
      });
    }).catch(err => {
      console.log('err', err);
      res.json({
        code: 400,
        error: '保存配置数据失败'
      });
    });
  }

  async find(req, res, next) {
    let opt = this.getQueryFromQuerys(req.query);

    ConfigurationModel.find(opt).then(result => {
      result = result.length === 1 ? result[0] : result;
      res.json({
        code: 200,
        result: result
      });
    }).catch(err => {
      res.json({
        code: 200,
        error: '查询失败：' + JSON.stringify(opt)
      });
    });
  }

  async codeToName(req, res, next) {
    let opt = this.getQueryFromQuerys(req.query);

    if (!opt.valueCode) {
      return res.json({
        code: 400,
        error: '条件错误：缺少查询条件(valueCode)'
      });
    }

    ConfigurationModel.findOne(opt).then(result => {
      if (result.valueCode === opt.valueCode) {
        res.json({
          code: 200,
          result: result.valueName
        });
      } else {
        throw new Error('未查询到数据');
      }
    }).catch(err => {
      console.log('codeToName', err);
      res.json({
        code: 200,
        error: '查询失败：' + JSON.stringify(opt)
      });
    });
  }

  async nameToCode(req, res, next) {
    let opt = this.getQueryFromQuerys(req.query);

    if (!opt.valueName) {
      return res.json({
        code: 400,
        error: '条件错误：缺少查询条件(valueName)'
      });
    }

    ConfigurationModel.findOne(opt).then(result => {
      console.log(result);
      if (result.valueName === opt.valueName) {
        res.json({
          code: 200,
          result: result.valueCode
        });
      } else {
        throw new Error('未查询到数据');
      }
    }).catch(err => {
      console.log('nameToCode', err);
      res.json({
        code: 200,
        error: '查询失败：' + JSON.stringify(opt)
      });
    });
  }

  saveConfigurations(result) {
    return new Promise((resolve, reject) => {
      let versionConfig = new ConfigurationModel();
      versionConfig.id = Date.now();
      versionConfig.domainCode = 'VERSION_NO';
      versionConfig.valueName = 'VERSION_NO';
      versionConfig.valueCode = result.version_NO;
      versionConfig.valueSort = '';
      versionConfig.valueDesc = '配置文件版本信息，同时记录更新时间：' + (new Date());
      versionConfig.statusCd = '1000';

      let list = result.config_VERSION_INFO_LIST.com_DOMAIN_VALUE_LIST.map(function (data) {
        let config = new ConfigurationModel();
        config.id = data.com_DOMAIN_VALUE_ID;
        config.domainCode = data.domain_CODE;
        config.valueName = data.value_NAME;
        config.valueCode = data.value_CODE;
        config.valueSort = data.value_SORT;
        config.valueDesc = data.value_DESC;
        config.statusCd = data.status_CD;

        return config;
      });

      list.unshift(versionConfig);

      ConfigurationModel.remove({}).then(() => {
        ConfigurationModel.create(list).then(() => {
          resolve();
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      });
    });
  }

  getQueryFromQuerys(querys) {
    let { domainCode, valueCode, valueName } = querys;
    let opt = {};

    if (domainCode) {
      opt['domainCode'] = { $regex: domainCode, $options: 'i' };
    } else {
      return res.json({
        code: 400,
        error: '条件错误：缺少查询条件(domainCode)'
      });
    }

    valueCode && (opt['valueCode'] = valueCode);
    valueName && (opt['valueName'] = valueName);

    console.log(opt);

    return opt;
  }


}

export default new Configuration();