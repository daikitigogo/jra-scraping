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
            ],
            level: process.env.NODE_LOG_LEVEL || 'debug'
        },
        app: {
            appenders: [
                'console',
                'app'
            ],
            level: process.env.NODE_LOG_LEVEL || 'debug'
        }
    }
});

const category = process.env.NODE_LOG_CATEGORY;
export default log4js.getLogger(category);
