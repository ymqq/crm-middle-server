'use strict';

import express from 'express'
import TestApi from '../controller/test'

const router = express.Router();


router.get('/checkOrderAmount', TestApi.checkOrderAmount);


export default router;