#!/bin/bash

echo "node provisioning..."

home=/home/$1

git clone git@github.com:hokaccha/nodebrew.git $home/.nodebrew

curl -L git.io/nodebrew | perl - setup
export PATH=$HOME/.nodebrew/current/bin:$PATH
nodebrew install stable