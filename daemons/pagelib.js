module.exports = {
    name: 'pagelib',
    async execute(client) {
        client.pagelib = {}
        client.pagelib.perPage = 5;

        client.pagelib.renderQueueString = (queue, page) => {
            queue = queue.slice(page * client.pagelib.perPage, (page + 1) * client.pagelib.perPage);
            let queueString = '';
            for(let i = 0; i < queue.length; i++) {
                queueString += `**\`${i+1}.\`**\` \`[\`${queue[i][3]}\`](${queue[i][2]})\n`;
            }
            return queueString
        }

        client.pagelib.getMaxPages = (queue) => {
            return Math.ceil(queue.length / client.pagelib.perPage);
        }
    }
}