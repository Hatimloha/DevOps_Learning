#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-20
# Description: script that takes a number as input and checks:even or odd.
##########################

read -p "Enter a number: " num;

if (( num % 2 == 0 )); then
    echo "Number Is Even : $num";
else
    echo "Number Is Odd: $num";
fi

