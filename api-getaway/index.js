const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.use((req, res, next) => {
    console.log(`[API GATEWAY] ${req.method} -> ${req.originalUrl}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'API Gateway is running'
    });
});

// ==============================
// CUSTOMERS
// ==============================

app.use(
    '/customer',
    createProxyMiddleware({
        target: process.env.CUSTOMER_SERVICE_URL,
        changeOrigin: true,

        onProxyReq: (proxyReq, req, res) => {
            console.log(
                `[GATEWAY -> CUSTOMERS] ${req.method} ${req.originalUrl}`
            );
        },

        onError: (err, req, res) => {
            console.error(
                '[Gateway Error] Customer Service no disponible:',
                err.message
            );

            if (!res.headersSent) {
                res.status(503).json({
                    error: 'Customer Service actualmente fuera de línea'
                });
            }
        }
    })
);


// ==============================
// PRODUCTS
// ==============================

app.use(
    '/products',
    createProxyMiddleware({
        target: process.env.PRODUCTS_SERVICE_URL,
        changeOrigin: true,

        pathRewrite: {
            '^/products': ''
        },

        onProxyReq: (proxyReq, req, res) => {
            console.log(
                `[GATEWAY -> PRODUCTS] ${req.method} ${req.originalUrl}`
            );
        },

        onError: (err, req, res) => {
            console.error(
                '[Gateway Error] Products Service no disponible:',
                err.message
            );

            if (!res.headersSent) {
                res.status(503).json({
                    error: 'Products Service actualmente fuera de línea'
                });
            }
        }
    })
);


// ==============================
// SHOPPING
// ==============================

app.use(
    '/shopping',
    createProxyMiddleware({
        target: process.env.SHOPPING_SERVICE_URL,
        changeOrigin: true,

        onProxyReq: (proxyReq, req, res) => {
            console.log(
                `[GATEWAY -> SHOPPING] ${req.method} ${req.originalUrl}`
            );
        },

        onError: (err, req, res) => {
            console.error(
                '[Gateway Error] Shopping Service no disponible:',
                err.message
            );

            if (!res.headersSent) {
                res.status(503).json({
                    error: 'Shopping Service actualmente fuera de línea'
                });
            }
        }
    })
);


// ==============================
// 404
// ==============================

app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada en el API Gateway'
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`API Gateway escuchando en el puerto ${PORT}`);
    });
}

module.exports = app;
