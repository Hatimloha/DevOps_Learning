#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-21
# Description: script: compress a directory into .tar.gz
##########################

file="/root/Dockerfile"
backup="/root"
currentDate=$(date + %Y-%m-%d_%H-%M-%S)

tar -czf "${backup}/dockerfile_${currentDate}.tar.gz" "$file"

echo "File is compressed now"


