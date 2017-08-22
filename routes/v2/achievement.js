'use strict';

import express from 'express'
import Achievement from  '../../controller/achievement/achievement'
import Check from '../../middlewares/check'

const router = express.Router();

router.get('/today/statistics', Achievement.getTodayStatistics);
router.get('/list', Achievement.getSaleOrderList);
router.get('/cancelled/count', Achievement.getCancelledOrderCount);
router.get('/cancelled/list', Achievement.getCancelledOrderList);
router.get('/agreement', Achievement.getOrderAgreement);
router.get('/orderPhotos', Achievement.getOrderPhotos);
router.get('/crmOrderPool/statistics', Achievement.getCrmOrderPoolStatistics);
router.get('/crmOrderPool/list', Achievement.getCrmOrderPoolList);
router.get('/crmOrderPool/detail', Achievement.getCrmOrderPoolDetail);
router.get('/crmOrderPool/cancelDetail', Achievement.getCrmOrderCancelledReason);


export default router;