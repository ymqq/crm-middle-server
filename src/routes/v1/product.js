'use strict';

import express from 'express'
import Product from '../../controller/product/product'
import Check from '../../middlewares/check'

const router = express.Router();


router.get('/byAccNbr', Check.checkLogin, Product.queryProductsByAccNbr);
router.get('/byProdInstId', Check.checkLogin, Product.queryProductByProdInstId);
router.get('/byProdOfferInstId', Check.checkLogin, Product.queryProductByProdOfferInstId);
router.get('/byAccNbrAndCustId', Check.checkLogin, Product.queryProductsByAccNbrAndCustId);
router.get('/prodOffers/byCustId', Check.checkLogin, Product.queryProdOffersByCustId);


export default router;