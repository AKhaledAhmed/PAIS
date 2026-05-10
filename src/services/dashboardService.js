const Inventory = require('../models/inventory');
const StockUpdateLog = require('../models/stockupdateLog');
const axios = require('axios');

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

const getDashboardAnalytics = async (pharmacyId) => {
  // 1. Prepare all requests (don't await them yet)
  const aiPredictReq = axios.get(`${PYTHON_API_URL}/model/predict/${pharmacyId}`);
  const heatmapReq = axios.get(`${PYTHON_API_URL}/analytics/heatmap/${pharmacyId}`);
  const logsReq = StockUpdateLog.find({ pharmacyId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('drugId', 'name');

  // 2. Run them in parallel - allSettled prevents one crash from stopping others
  const [aiRes, heatRes, recentLogs] = await Promise.allSettled([
    aiPredictReq,
    heatmapReq,
    logsReq
  ]);

  // 3. Extract data if successful, or use empty defaults if they failed
  const predictions = aiRes.status === 'fulfilled' ? aiRes.value.data : [];
  const heatmap = heatRes.status === 'fulfilled' ? heatRes.value.data : [];
  const logs = recentLogs.status === 'fulfilled' ? recentLogs.value : [];

  // 4. Log warnings for debugging so you can see them in the Node console
  if (aiRes.status === 'rejected') console.error("AI Predict Error:", aiRes.reason.message);
  if (heatRes.status === 'rejected') console.error("Heatmap Error:", heatRes.reason.message);

  const criticalItemsCount = predictions.filter(p => p.status === 'CRITICAL').length;
  
  return {
    predictions,
    heatmap,
    recentLogs: logs,
    stats: {
      totalItemsPredicted: predictions.length,
      criticalAlerts: criticalItemsCount,
      aiStatus: aiRes.status === 'fulfilled' ? "online" : "offline"
    }
  };
};

module.exports = { getDashboardAnalytics };