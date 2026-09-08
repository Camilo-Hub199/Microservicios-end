require('dotenv').config({ quiet: true });

module.exports = {
    PORT: process.env.PORT || 8001,
    DB_URL: process.env.DB_URL,
    APP_SECRET: process.env.APP_SECRET,
};
