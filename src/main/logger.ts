import log4js = require('log4js');

log4js.configure({
    appenders: {
        console: {
            type: 'stdout'
        },
        app: { 
            type: 'file',
            filename: process.env.NODE_LOG_FILE || './app.log'
        }
    },
    categories: {
        default: {
            appenders: [
                'console',
                'app'
            ],
            level: process.env.NODE_LOG_LEVEL || 'debug'
        }
    }
});

export default log4js.getLogger();
