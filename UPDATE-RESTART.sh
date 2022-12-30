#!/bin/bash
echo ""
echo "           ▄▄         ▄▄          ▄▄           "
echo "          ▄██        ▄██        ▀███           "
echo "           ██         ██          ██           "
echo "  ▄█▀██▄   ██▄████▄   ██▄████▄    ██  ▄█▀██▄   "
echo " ██   ██   ██    ▀██  ██    ▀██   ██ ██   ██   "
echo "  ▄█████   ██     ██  ██     ██   ██  ▄█████   "
echo " ██   ██   ██▄   ▄██  ██▄   ▄██   ██ ██   ██   "
echo " ▀████▀██▄ █▀█████▀   █▀█████▀  ▄████▄████▀██▄ "                                           
                                             
echo " "
echo "RESTART PM2"
echo " "

sleep 2

pm2 restart all

echo " "
echo "ABBLA REINICIADO!!!"
echo " "