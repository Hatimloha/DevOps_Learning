#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-20
# Description: script that counts: number of files in a directory
##########################

read -p "Enter directory path: " dir

if [ -d "$dir" ]; then
    count=$(find "$dir" -type f | wc -l)
    echo "Number of files: $count"
else
    echo "Directory does not exist"
fi

