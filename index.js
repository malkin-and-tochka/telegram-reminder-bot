const telegramApi = require('node-telegram-bot-api')

const token = '6317598314:AAGuRDmLkt_snhc5FA-DLHcDSo0riinGbyE'

const bot = new telegramApi(token, {polling: true})
const mainDateRegex = new RegExp("^([0-9]{2})\\.([0-9]{2})\\.([0-9]{2})\\.([0-9]{2})\\.([1-2][0-9]{3})$");
const shortDateRegex = new RegExp("^([0-9]{2}):([0-9]{2})$")

// const gameOptions = {
//     reply_markup: JSON.stringify({
//         inline_keyboard: [
//             [{text: 'Ввести напоминание', callback_data: 'reminder'}],
//             [{text: 'Ввести дату', callback_data: 'timer'}]]
//     })
// }

let myTasks = new Map

const start = () => {
    bot.setMyCommands([
        {command: '/help', description: "How to use the bot"},
        {command: '/menu', description: "Menu for using"}
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id

        if (text === '/start') {
            return await bot.sendMessage(chatId, 'Nice to see you there, type the "/menu" to start')
        } else if (text === '/help') {

            return await bot.sendMessage(chatId, 'Click on menu or type "/menu" in the message')

        } else if (text === '/menu') {

            return await bot.sendMessage(chatId, 'Bot menu', {
                reply_markup: {
                    keyboard: [
                        ['Set a reminder ⏰'],
                        ['My tasks 🗒'],
                        ['Delete reminder 🗑']
                    ],
                    resize_keyboard: true
                }
            })
        } else if (text === 'Set a reminder ⏰') {

            return await bot.sendMessage(chatId, 'Please, if you want to set a reminder fo today type with a space:\n1) Date in view: HH:MM\n2) Your reminder\nFor example: 14:30 My reminder \nIn other cases: \n1) Date in view: HH.MinMin.DD.MM.YYYY\n2) Your reminder\nFor example: 14.30.13.07.2023 My reminder')

        } else if (mainDateRegex.test(text.substring(0, 16))) {

            //------------------------------------ set Reminder

            const arr = text.split(' ')
            const strTime = arr[0]
            const time = (dateToMS(arr[0]) - Date.now()) / 1000

            arr.splice(0, 1)

            setTask(time, arr, strTime, chatId)

            return await bot.sendMessage(chatId, 'Reminder has been established')

        } else if (shortDateRegex.test(text.substring(0, 5))) {


            const nowTime = Date.now() / 1000 - 60 * 60 * 24 + 60 * 60 * 3
            const hoursAndMinInMs = nowTime % (60 * 60 * 60)

            const arr = text.split(' ')
            const strTime = arr[0]
            const time = Math.floor((shortDateToMs(strTime) / 1000) - hoursAndMinInMs)


            arr.splice(0, 1)

            setTask(time, arr, strTime, chatId)

            return await bot.sendMessage(chatId, 'Reminder has been established')

        } else if (text === 'My tasks 🗒') {

            let myTasksStr = ''
            let counter = 1
            for (let key of myTasks.keys()) {
                myTasksStr += `\n${counter}) Task: ${myTasks.get(key)}, reminder after: ${formatDuration(key)}`
                counter++
            }

            if (!myTasks.size) {
                return await bot.sendMessage(chatId, 'You have no tasks')
            } else {
                return await bot.sendMessage(chatId, `<b>Your tasks:</b> ${myTasksStr}`, {

                    parse_mode: "HTML"

                })
            }

        } else if (text === 'Delete reminder 🗑') {
            return await bot.sendMessage(chatId, 'Type this: /delete N, where N is a number from your list of tasks.\nFor example: \n' +
                '/delete 1')
        } else if (text.startsWith('/delete')) {
            const targetNumber = text.split(' ')[1] - 1
            let counter = 0
            for (let key of myTasks.keys()) {
                if (counter === targetNumber) {
                    myTasks.delete(key)
                    return await bot.sendMessage(chatId, 'Reminder is removed')
                }
                counter++
            }

            return await bot.sendMessage(chatId, 'Task with this number do not exist')
        }

        return await bot.sendMessage(chatId, 'Sorry, i don`t understand you')
    })
}

start()


function formatDuration(time) {
    if (time === 0) return "now"

    const years = (time - time % (3600 * 24 * 365)) / (3600 * 24 * 365)
    const days = (time - time % (3600 * 24) - years * 24 * 3600 * 365) / (24 * 3600)
    const hours = (time - time % 3600 - days * 24 * 3600 - years * 24 * 3600 * 365) / 3600
    const min = (time - hours * 3600 - time % 60 - days * 24 * 3600 - years * 24 * 3600 * 365) / 60
    const sec = Math.floor(time - hours * 3600 - min * 60 - days * 24 * 3600 - years * 24 * 3600 * 365)

    let mapTime = new Map
    if (years !== 1) {
        mapTime.set("years", years)
    } else {
        mapTime.set("year", years)
    }
    if (days !== 1) {
        mapTime.set("days", days)
    } else {
        mapTime.set("day", days)
    }
    if (hours !== 1) {
        mapTime.set("hours", hours)
    } else {
        mapTime.set("hour", hours)
    }
    if (min !== 1) {
        mapTime.set("minutes", min)
    } else {
        mapTime.set("minute", min)
    }
    if (sec !== 1) {
        mapTime.set("seconds", sec)
    } else {
        mapTime.set("second", sec)
    }


    for (let time of mapTime.keys()) {
        if (mapTime.get(time) === 0) mapTime.delete(time)
    }

    let result = ''

    let count = 0
    for (let time of mapTime.keys()) {
        if (count !== mapTime.size - 1) {
            result += mapTime.get(time) + ' ' + time + ', '
        } else {
            result += mapTime.get(time) + ' ' + time
        }
        count++
    }
    if (result.lastIndexOf(",") === -1) return result

    return result.substr(0, result.lastIndexOf(',')) + " and " + result.substr(result.lastIndexOf(',') + 2)
}

function dateToMS(str) {
    const arrDate = str.split('.')
    return Date.UTC(arrDate[4], arrDate[3] - 1, arrDate[2], arrDate[0] - 3, arrDate[1])
}

function shortDateToMs(str) {
    const arrDate = str.split(':')
    return arrDate[0] * 60 * 60 * 1000 + arrDate[1] * 60 * 1000
}

const setTask = (time, arr, strTime, chatId) => {
    let task = arr.join(' ') + ', installed on ' + ` (${strTime})`

    setTimeout(async () => {
        myTasks.delete(time)
        return await bot.sendMessage(chatId, 'Reminder: ' + task)
    }, time * 1000)

    myTasks.set(time, task)
}