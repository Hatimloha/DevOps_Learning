#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-20
# Description: script to check if a file exists
# If yes → print "File exists || If no → create it
##########################


read -p "Enter file path: " path # use for custom path 

read -p "Enter a file name: " filename

fullpath="$path/$filename"

if [ -f "$fullpath" ]; then
    echo "File exists: $filename"
else
    echo "File does not exist"
    touch "$filename"
    echo "File created successfully"
fi
