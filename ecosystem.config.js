const path = require('path');

module.exports = {
  apps: [{
    name: 'dashboard',
    script: '/home/ryanw/.openclaw/workspace/dashboard-v2/start.sh',
    args: '',
    cwd: '/home/ryanw/.openclaw/workspace/dashboard-v2',
    interpreter: '/bin/bash',
    interpreter_args: '',
    exec_mode: 'fork',
    instance_var: 'NODE_APP_INSTANCE',
    wait_ready: false,
    listen_timeout: 30000,
    kill_timeout: 5000,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      HOST: '0.0.0.0'
    },
    error_file: '/home/ryanw/.pm2/logs/dashboard-error.log',
    out_file: '/home/ryanw/.pm2/logs/dashboard-out.log',
    pid_file: '/home/ryanw/.pm2/pids/dashboard-0.pid',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
