let patch = (client, minLevel) => {
    client.logger = { minLevel: minLevel };
    client.logger.isLevel = (level) => ['DEBUG', 'LOG', 'WARN', 'ERR'].includes(level) || !isNaN(level);

    client.log = (level, message, moduleName) => {
        if(client.logger.minLevel > level) return;
        if(!client.logger.isLevel(level)) message = level;

        switch(level) {
            case 1:
                level = 'WARN';
                break;
            case 2:
                level = 'ERR';
                break;
            case -1:
                level = 'DEBUG';
                break;
            default:
                level = 'LOG';
                break;
        }

        console.log(`(${new Date().toLocaleString()}) [${level}:${moduleName ? moduleName : 'root'}]: ${message}`);
    }
}

module.exports = { patch };