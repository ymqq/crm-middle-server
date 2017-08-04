'use strict';

import express from 'express'
import Customer from '../../controller/customer/customer'
import Check from '../../middlewares/check'


const router = express.Router();

router.get('/byCert', Check.checkLogin, Customer.queryByCert);
router.get('/byAccNbr', Check.checkLogin, Customer.queryByAccNbr);
router.get('/byCustId', Check.checkLogin, Customer.queryByCustId);

export default router;