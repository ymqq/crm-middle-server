'use strict';

module.exports = {
	port: 8001,
	dbUrl: 'mongodb://localhost:27017/crm',
	remoteUrl: 'http://202.100.220.217:9001/m/$?encoding=010000&appId=207',
	remoteDesKey: 'FFCRM_MOBILE_FFCRM_MOBIL',
	// remoteUrl: 'http://192.168.55.103:8080/m/$?encoding=010000&appId=205',
	// remoteUrl: 'http://218.85.155.71:7003/m/$?encoding=010000&appId=205',
	// remoteDesKey: 'FFCRM_MOBILE_DEV20170517',
	session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
		    secure:   false,
		    maxAge:   365 * 24 * 60 * 60 * 1000,
		}
	}
}