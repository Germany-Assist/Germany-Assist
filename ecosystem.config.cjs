module.exports = {
  apps: [
    {
      name: "backend", // Name of your app
      script: "npm",
      args: "run dev",
      instances: 1, // Use all CPU cores (cluster mode)
      autorestart: true, // Restart on crash
      watch: false, // Set true only for dev
      max_memory_restart: "500M", // Restart if memory exceeds this
      log_date_format: "YYYY-MM-DD HH:mm:ss", // Timestamp format in logs
      error_file: "./logs/err.log", // Error logs
      out_file: "./logs/out.log", // Standard logs
      merge_logs: true, // Merge logs from all instances
    },
  ],
};
