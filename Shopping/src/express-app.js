const express = require('express');
const cors = require('cors');
const { shopping } = require('./api');
const HandleErrors = require('./utils/error-handler');

module.exports = async (app) => {

    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors());

    app.use(express.static(__dirname + '/public'));

    // Health del Shopping Service
    app.get('/', (req, res) => {
        res.json({
            service: 'Shopping Service',
            status: 'running',
            message: 'Shopping microservice funcionando correctamente'
        });
    });

    // APIs
    shopping(app);

    // Error handling
    app.use(HandleErrors);
};
