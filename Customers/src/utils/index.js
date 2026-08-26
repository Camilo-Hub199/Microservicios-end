const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../config');

const GenerateSalt = async () => {
    return await bcrypt.genSalt(10);
};

const GeneratePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
};

const ValidatePassword = async (enteredPassword, savedPassword) => {
    return await bcrypt.compare(enteredPassword, savedPassword);
};

const GenerateSignature = async (payload) => {
    return jwt.sign(payload, APP_SECRET, {
        expiresIn: '1d'
    });
};

const FormateData = (data) => {
    return { data };
};

module.exports = {
    GenerateSalt,
    GeneratePassword,
    ValidatePassword,
    GenerateSignature,
    FormateData
};
