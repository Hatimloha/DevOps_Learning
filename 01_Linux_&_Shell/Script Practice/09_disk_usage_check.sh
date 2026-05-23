#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-21
# Description: checks disk usage 
#              if usage > 90%
#              print warning
##########################


# NR = Represent Row 
# df -h => count the row number of DIR for Alert
usage=$(df -h | awk 'NR==14 {gsub("%","");print $5}')

threshold=90


if [ "$usage" -gt "$threshold" ]; then
    echo "WARNING: Disk usage is above 90%!"
else 
    echo "Disk usage is normal: ${usage}%"
fi