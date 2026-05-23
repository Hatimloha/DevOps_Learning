#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-21
# Description: script that:
#              monitors a website
#              if website is down → print alert
##########################


website="https://example.com"


# Check if website is reachable

if curl -s --head "$website" | grep 200 > /dev/null; then
    echo "Website is UP"
else
    echo "ALERT: Website is DOWN!"
fi
