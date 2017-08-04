'use strict';

import express from 'express'
import Configuration from '../../controller/configuration/configuration'
const router = express.Router();

router.get('/update', Configuration.update);
router.get('/query', Configuration.find);
router.get('/codeToName', Configuration.codeToName);
router.get('/nameToCode', Configuration.nameToCode);

export default router;