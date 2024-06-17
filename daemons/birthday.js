let { spawn } = require('child_process');

module.exports = {
    name: 'birthday',
    async execute(client) {
        client.log(0, 'running python/birthdayReminder.py', 'birthday');
        let python = spawn(
            process.platform.includes('win') ? 'python' : 'python3',
             ['python/birthdayReminder.py'])
        python.stdout.on('data', (data) => {
            client.log(0, data.toString())
        })
    }
}