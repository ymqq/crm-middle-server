'use strict';

import BaseComponent from '../prototype/baseComponent'


class Check extends BaseComponent {
	constructor(){
		super();

		this.checkLogin = this.checkLogin.bind(this);
	}

	checkLogin(req, res, next) {
		const token = req.session.token;
		const logId = req.session.logId;
		const staffInfo = req.session.staffInfo;
		const deviceInfo = req.session.deviceInfo;

		if (!token && !logId && !staffInfo) {
			return res.json({
				code: 400,
				error: '亲，您还没有登录',
			});
		}
		
		next();
	}
}

export default new Check();