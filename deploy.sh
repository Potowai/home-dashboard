#!/usr/bin/env bash
set -euo pipefail

source /home/user/.nvm/nvm.sh
cd /home/user/home-dashboard
# Increment version on deploy
npm version patch --no-git-tag-version
npm run build
sudo -n systemctl restart home-dashboard.service
