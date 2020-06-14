import Pino from 'pino'

export const log = Pino({
    name: 'chartd',
    level: 'debug',
})
