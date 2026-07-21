const schedule = require('node-schedule');
const Admin = require('../models/adminModel');
const moment = require('moment');

// Runs every day at midnight (00:00)
const initNotificationCleanup = () => {
    schedule.scheduleJob('0 0 * * *', async () => {
        try {
            const twoDaysAgo = moment().subtract(2, 'days').toDate();
            
            const result = await Admin.updateMany(
                {}, 
                { 
                    $pull: { 
                        notifications: { 
                            created_at: { $lt: twoDaysAgo } 
                        } 
                    } 
                }
            );

            console.log(`[Cleanup] Removed old notifications. Modified ${result.modifiedCount} admin records.`);
        } catch (error) {
            console.error('[Cleanup Error] Failed to delete old notifications:', error);
        }
    });
    
    console.log('Notification cleanup job scheduled (Daily at midnight).');
};

module.exports = { initNotificationCleanup };
