'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const ConfigurationSchema = new Schema({
    id: String,
    domainCode: String,
    valueName: String,
    valueCode: String,
    valueSort: String,
    valueDesc: String,
    statusCd: String,
});

ConfigurationSchema.index({id: 1}, {unique: true});

const Configuration = mongoose.model('Configuration', ConfigurationSchema);


export default Configuration;
