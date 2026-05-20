#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-20
# Description: Print multiplication table of a number (e.g., 5)
##########################


read -p "Enter a number: " num

for i in {1..10}
do 
    echo "$num x $i = $((num*i))"
done