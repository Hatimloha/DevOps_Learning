#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-21
# Description: script: automatically kill a process by name
##########################

process=$1

# Kill the process by name
pkill -9 "$process"

echo "Process '$process' has been terminated."

