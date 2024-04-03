const { format } = require('date-fns')
const path = require('path')
const fs = require('fs')
const fsPromises = require('fs').promises
const crypto = require('crypto');

const logEvents = async(message, logFileName) =>{
    const id = crypto.randomUUID()
    const dateTime = format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')
    const logItem = `${dateTime}\t${id}\t${message}\n`
    try {
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)

        
    } catch (error) {
        console.log(error)
    }
}
const logger = (req, res, next)=>{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLogs.log')
    console.log(req.method, req.path)
    next()
}

module.exports = { logEvents, logger }