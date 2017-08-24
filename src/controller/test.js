'use strict';

import fetch from 'node-fetch'


class TestApi {
  constructor() {
    this.checkOrderAmount = this.checkOrderAmount.bind(this);

  }

	async fetch(url = '', data = {}) {
		let config = {
			method: 'POST',
			headers: {
        'Accept-Type': 'application/json;charset=UTF-8',
				'Content-Type': 'application/json;charset=UTF-8',
				'Charset': 'UTF-8',
				'Accept-Encoding': 'gzip,deflate',
				'Connection': 'keep-Alive',
				'Cookie': 'JSESSIONID=L65tZJsKT9gyLVVGZ1h2DW8rbvnnPr808JGV1X7tVSzXzbchZMrp!-654348948',
			},
		};

		Object.defineProperty(config, 'body', {
			value: JSON.stringify(data),
		});

		let response = await fetch(url, config);
    let responseJson = await response.text();
    
    return responseJson;
	}
  
  async checkOrderAmount(req, res, next) {
    let preNo = req.query.preNo;

    let result = await this.fetch('http://202.100.220.217:9001/m/revive/order/orderCostCheck', {pNo: preNo});

    res.send(result);
    res.end();
  }
}

export default new TestApi();