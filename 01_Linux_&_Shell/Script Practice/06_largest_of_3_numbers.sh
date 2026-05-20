#!/bin/bash

##########################
# Author: Hatim Lohawala
# Date: 2026-05-20
# Description: script to find the largest of 3 numbers
##########################

read -p "Enter First Number: " num1;
read -p "Enter Sec Number: " num2;
read -p "Enter Third Number: " num3;


if (( "$num1" > "$num2" && "$num1" > "$num3" )); then
    echo "NUM1: $num1 is greater"
elif (( "$num2" > "$num1" && "$num2" > "$num3" )); then
    echo "NUM2: $num2 is greater"
else
    echo "NUM3: $num3 is greater"
fi