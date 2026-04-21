const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`一品翠坊后端启动成功：http://localhost:${PORT}`);
  console.log(`健康检查：http://localhost:${PORT}/api/health`);
});
