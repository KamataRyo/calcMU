#!/bin/bash
sudo yum update
sudo yum upgrade
wget git.io/nodebrew
perl nodebrew setup
export PATH=$HOME/.nodebrew/current/bin:$PATH
source ~/.bashrc