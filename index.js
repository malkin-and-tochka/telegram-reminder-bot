const telegramApi = require('node-telegram-bot-api')

const token = '6317598314:AAGuRDmLkt_snhc5FA-DLHcDSo0riinGbyE'

const bot = new telegramApi(token, {polling: true})

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
        {command: '/help', description: "Как пользоваться ботом"},
        {command: '/menu', description: "Меню для пользования ботом"}
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id

        if (text === '/help') {

            return await bot.sendMessage(chatId, 'Нажмите на меню или же введите "/menu" в сообщении, далее для установки напоминания нажмите на кнопку: "Установить напоминание ⏰"')

        } else if (text === '/menu') {

            return await bot.sendMessage(chatId, 'Меню бота', {
                reply_markup: {
                    keyboard: [
                        ['Установить напоминание ⏰'],
                        ['Мои задачи 🗒']
                    ],
                    resize_keyboard: true
                }
            })

        } else if (text === 'Установить напоминание ⏰') {

            return await bot.sendMessage(chatId, 'Пожалуйста, введите через пробел такой запрос: \n1) /task\n2) количество секунд, через которое вам надо напомнить о вашем запросе\n3) сам запрос')

        } else if (text.startsWith('/task')) {
            const arr = text.split(' ')
            const time = arr[1]

            arr.splice(0, 2)
            const task = arr.join(' ')

            setTimeout(async () => {
                myTasks.delete(time)
                return await bot.sendMessage(chatId, 'Напоминание: ' + task)
            }, time * 1000)

            myTasks.set(time, task)

            return await bot.sendMessage(chatId, 'Задача установлена')

        } else if (text === 'Мои задачи 🗒') {

            let myTasksStr = ''

            for (let key of myTasks.keys()) {
                myTasksStr += `\nЗадача: ${myTasks.get(key)}, Напомнить через  ${formatDuration(key)}`
            }

            if (!myTasks.size) {
                return await bot.sendMessage(chatId, 'У вас нет активных задач')
            } else {
                return await bot.sendMessage(chatId, `<b>Ваши Задачи:</b> ${myTasksStr}`, {

                    parse_mode: "HTML"

                })
            }

        }


        return await bot.sendMessage(chatId, 'Простите, я вас не понимаю')
    })


    bot.on('callback_query', msg => {

        // let timer
        //
        // if(msg.data === 'timer'){
        //     timer =
        // }

    })

}

start()


function formatDuration(time) {
    if (time === 0) return "now"

    const years = (time - time % (3600 * 24 * 365)) / (3600 * 24 * 365)
    const days = (time - time % (3600 * 24) - years * 24 * 3600 * 365) / (24 * 3600)
    const hours = (time - time % 3600 - days * 24 * 3600 - years * 24 * 3600 * 365) / 3600
    const min = (time - hours * 3600 - time % 60 - days * 24 * 3600 - years * 24 * 3600 * 365) / 60
    const sec = time - hours * 3600 - min * 60 - days * 24 * 3600 - years * 24 * 3600 * 365

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