

const runFile = (fileName: string): number => {
    return 0
}

const runPrompt = () => {}

if (process.argv.length === 2) {
    runPrompt()
} else if (process.argv.length === 3) {
    runFile(process.argv[2])
} else {

}