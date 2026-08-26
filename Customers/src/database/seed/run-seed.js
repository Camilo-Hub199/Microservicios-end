const mongoose = require('mongoose');
const { DB_URL } = require('../../config');
const { CustomersModel } = require('../models');
const customers = require('./customers');

const force = process.argv.includes('--force');

(async () => {
    try {
        await mongoose.connect(DB_URL);

        for (const customer of customers) {
            const update = force ? { $set: customer } : { $setOnInsert: customer };
            await CustomersModel.updateOne({ email: customer.email }, update, { upsert: true });
        }

        console.log(`Seeded ${customers.length} customers${force ? ' (existing documents overwritten)' : ''}`);
    } catch (err) {
        console.error('Seeding failed', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
