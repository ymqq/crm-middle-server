'use strict';

import express from 'express'
import Zone from '../../controller/zone/zone'
import Check from '../../middlewares/Check'


const router = express.Router();


router.get('/all', Check.checkLogin, Zone.queryAll);
router.get('/zone', Check.checkLogin, Zone.queryZoneBySaleOrderType);
router.get('/item', Check.checkLogin, Zone.queryItemBySaleOrderType);


export default router;