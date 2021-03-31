#!/bin/bash

echo "pulling updates and rebuilding"
git pull
npm ci

echo "removing old version"
rm -rf /opt/kanatran/*

echo "copying updated version"
cp -R node_modules/ /opt/kanatran/
cp -R src/ /opt/kanatran/

echo "restarting service"
systemctl restart kanatran