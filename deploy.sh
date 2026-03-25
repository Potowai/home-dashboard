#!/usr/bin/env bash
set -euo pipefail

source /home/user/.nvm/nvm.sh
cd /home/user/home-dashboard
npm run build
sudo -n systemctl restart home-dashboard.service
