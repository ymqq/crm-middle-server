'use strict';

import configuration from './v1/configuration'
import user from './v1/user'
import customer from './v1/customer'
import product from './v1/product'
import zone from './v2/zone'
import phone from './v2/phone'
import address from './v2/address'
import achievement from './v2/achievement'


import testApi from './test'


export default app => {
	// v1 api
	app.use('/v1/configs', configuration);
	app.use('/v1/users', user);
	app.use('/v1/customers', customer);
	app.use('/v1/products', product);

	// v2 api
	app.use('/v2/zones', zone);
	app.use('/v2/phones', phone);
	app.use('/v2/addresses', address);
	app.use('/v2/achievements', achievement);


	app.use('/tests', testApi)
}