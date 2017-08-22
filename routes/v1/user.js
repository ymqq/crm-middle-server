'use strict';

import express from 'express'
import User from '../../controller/user/user'
import Check from '../../middlewares/check'


const router = express.Router();

router.post('/login', User.login);
router.post('/saveTeam', User.saveTeam);
router.post('/modifyPwd', Check.checkLogin, User.modifyPwd);
router.post('/forgetPwd/checkAccount', User.forgetPwdForCheckAccount);
router.post('/forgetPwd/checkSmsCode', User.forgetPwdForCheckSmsCode);
router.post('/forgetPwd/setNewPwd', User.forgetPwdForSetNewPwd);
router.post('/logout', Check.checkLogin, User.logout);
router.get('/info', Check.checkLogin, User.getInfo);

export default router;