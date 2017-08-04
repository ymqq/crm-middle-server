'use strict';

import express from 'express'
import Phone from '../../controller/phone/phone'
import Check from '../../middlewares/check'

const router = express.Router();


router.get('/4g', Check.checkLogin, Phone.queryByFilter);
router.post('/4g/occupation', Check.checkLogin, Phone.occupy);
router.get('/4g/reservation', Check.checkLogin, Phone.queryReservation);
router.post('/4g/release', Check.checkLogin, Phone.release);


export default router;