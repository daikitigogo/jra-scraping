#!/bin/bash

if [ -f /app/package.json ]; then
    if [ ! -f /volume/initialized ]; then
        npm install
        touch /volume/initialized
    fi
else
    npm init
fi

/bin/bash --rcfile /etc/bashrc
