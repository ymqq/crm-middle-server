import fetch from 'node-fetch'
import Ids from '../models/ids'
import config from 'config-lite'
import crypto from 'crypto'

const BASE_URL = config.remoteUrl;
const DES_KEY = config.remoteDesKey;


export default class BaseComponent {
	constructor() {
		this.msg = {
			detail: {},
			keyId: '',
			keyValue: '',
			logId: '9999',
			systemCode: '207',
			versionCode: '9999',
			device: 'Android',
			deviceInfo: {
				sysVerId: 585,
				deviceId: '12345678900000111',
				deviceModel: 'Mi5s',
				deviceSystem: 'Android',
				deviceSystemVersion: '6.0.1',
				macAddr: '90:98:30:40:54'
			}
		};

		this.idList = ['statis_id'];

		this.fetch = this.fetch.bind(this);
	}

	//获取id列表
	async getId(type) {
		if (!this.idList.includes(type)) {
			console.log('id类型错误');
			throw new Error('id类型错误');
			return
		}
		try {
			const idData = await Ids.findOne();
			idData[type]++;
			await idData.save();
			return idData[type]
		} catch (err) {
			console.log('获取ID数据失败');
			throw new Error(err)
		}
	}

	/**
	 * 用于请求CRM翼销售服务端接口。<br/>
	 * 返回：
	 * 	成功：msg下的detail节点
	 * 	失败：msg下的message节点
	 * 
	 * @param {String} url 翼销售服务端接口的action部分，头尾部分在config中配置
	 * @param {Object} data 请求数据msg对象，base下有一个基础msg，外部只需对特定的节点赋值即可
	 * @param {String} type 请求方式，默认为post
	 * @param {String} resType 返回数据格式，默认text
	 */
	async fetch(url = '', data = {}, req = {}, type = 'POST', resType = 'TEXT') {
		let responseJson;
		try {
			type = type.toUpperCase();
			resType = resType.toUpperCase();

			url = BASE_URL.replace('$', url);

			if (req.session) {
				data.detail.current_STAFF_INFO = req.session.staffInfo || null;
				data.logId = req.session.logId || '999999';
				data.deviceInfo = req.session.deviceInfo || {};
			}

			if (type == 'GET') {
				url = this.urlHandlerForGet(url, data);
			}

			let requestConfig = this.getResuestConfig(type);

			if (type == 'POST') {
				var value = await this.encrypt3DesEcb(JSON.stringify(data), DES_KEY);
				Object.defineProperty(requestConfig, 'body', {
					value: value
				});
			}

			const response = await fetch(url, requestConfig);
			responseJson = await response.text();

			responseJson = await this.decrypt3DesEcb(responseJson, DES_KEY);
			responseJson = JSON.parse(responseJson);

			responseJson = this.msgHandler(responseJson);
		} catch (err) {
			console.log('获取http数据失败', err);
			responseJson = {
				code: 400,
				error: '获取http数据失败: ' + err
			}
		}

		return responseJson;
	}

	urlHandlerForGet(url, data) {
		let dataStr = ''; // 数据拼接字符串
		Object.keys(data).forEach(key => {
			dataStr += key + '=' + data[key] + '&';
		});

		if (dataStr !== '') {
			dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
			if (url.indexOf('?') > -1) {
				url += '&' + dataStr;
			} else {
				url = url + '?' + dataStr;
			}
		}

		return url;
	}

	getResuestConfig(type) {
		return {
			method: type,
			headers: {
				'Content-Type': 'text/xml;charset=UTF-8',
				'Charset': 'UTF-8',
				'Accept-Encoding': 'gzip,deflate',
				'Connection': 'keep-Alive'
			},
		};
	}

	msgHandler(data) {
		let msg = data.msg;
		let result = {};

		if (msg.stateCode === '0') {
			result = msg.detail;

			if (result.error) {
				result = {
					code: 400,
					error: result.error.message
				};
			}
		} else {
			result = {
				code: 400,
				error: msg.message
			};
		}

		return result;
	}

	encrypt3DesEcb(data, key) {
		return new Promise((resolve, reject) => {
			try {
				var algorithm = 'des-ede3';
				var clearEncoding = 'utf8';
				var iv = '';
				var cipherEncoding = 'base64';
				var cipher = crypto.createCipheriv(algorithm, key, iv);

				var cipherChunks = '';
				cipherChunks = cipher.update(data, clearEncoding, cipherEncoding);
				cipherChunks += cipher.final(cipherEncoding);
				resolve(cipherChunks);
			} catch (err) {
				console.log('请求数据加密失败', err);
				reject('请求数据加密失败');
			}
		});
	}

	decrypt3DesEcb(data, key) {
		return new Promise((resolve, reject) => {
			try {
				var algorithm = 'des-ede3';
				var clearEncoding = 'utf8';
				var iv = '';
				var cipherEncoding = 'base64';

				var decipher = crypto.createDecipheriv(algorithm, key, iv);
				var plainChunks = '';
				plainChunks = decipher.update(data, cipherEncoding, clearEncoding);
				plainChunks += decipher.final(clearEncoding);
				resolve(plainChunks);
			} catch (err) {
				console.log('返回数据解密失败', err);
				reject('返回数据解密失败');
			}
		});
	}

	md5(data) {
		return new Promise((resolve, reject) => {
			try {
				var md5 = crypto.createHash('md5');
				md5.update(typeof (data) === 'string' ? data : JSON.stringify(data), 'utf8');
				resolve(md5.digest('hex'));
			} catch (err) {
				console.log('md5摘要处理失败', err);
				reject('md5摘要处理失败');
			}
		});
	}
}