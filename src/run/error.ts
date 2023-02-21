const report = (line: number, where: string, message: string): void => {
    console.log(`[line ${line}] Error ${where}: ${message}`)
}

const error = (line: number, message: string): void => {
    report(line, "", message)
}

export { report, error }