#!/bin/bash

if [ ! -f /app/package.json ]; then
    npm init -y
fi

if [ ! -f /volume/initialized ]; then
    npm install
    touch /volume/initialized
fi

/bin/bash --rcfile /etc/bashrc
