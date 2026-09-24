// PM2 konfiguratsiyasi: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "cut-king",
      script: "dist/server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
