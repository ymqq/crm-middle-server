'use strict';

import express from 'express'
import Check from '../../middlewares/check'
import Address from '../../controller/address/address'

const router = express.Router();


router.get('/fj', Check.checkLogin, Address.queryForFj);
router.get('/fj/detail', Check.checkLogin, Address.queryDetailForFj);
router.post('/fj/choice', Check.checkLogin, Address.chooseAddressForFj);
router.get('/hn', Check.checkLogin, Address.queryForHn);
router.get('/hn/resourcesCover', Check.checkLogin, Address.queryCoverInfoForHn);
router.post('/hn/choice', Check.checkLogin, Address.chooseAddressForHn);


export default router;