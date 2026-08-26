const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');

const StartServer = async () => {
    try {
        const app = express();

        await databaseConnection();
        await expressApp(app);

        app.listen(PORT, () => {
            console.log(`listening to port ${PORT}`);
        }).on('error', (err) => {
            console.log(err);
            process.exit(1);
        });

    } catch (err) {
        console.error('Error starting Shopping Service:', err);
        process.exit(1);
    }
};

StartServer();
