const cron = require('node-cron');
const axios = require('axios');

// Fetch Python API URL from your .env
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

const initAutoRetrain = () => {
  // ┌────────────── second (optional)
  // │ ┌──────────── minute
  // │ │ ┌────────── hour
  // │ │ 1 ┌──────── day of month
  // │ │ │ ┌──────── month
  // │ │ │ │ ┌────── day of week (0 = Sunday)
  // │ │ │ │ │
  // * * * * * *

  // SCHEDULE: Every Sunday at 3:00 AM
  cron.schedule('0 3 * * 0', async () => {
    console.log('🕒 Starting Scheduled AI Retraining...');
    try {
      // Trigger the POST endpoint in your main.py
      const response = await axios.post(`${PYTHON_API_URL}/model/train`);
      console.log('✅ AI Retraining Complete:', response.data.message);
    } catch (error) {
      console.error('❌ Scheduled Retraining Failed:', error.message);
    }
  });

  console.log('📅 AI Retraining Scheduler: Active (Running every Sunday at 3AM)');
};

module.exports = { initAutoRetrain };