import { scan } from "../scanner/index.ts"
import { parse } from "../parser/index.ts"
import { interpret } from "../interpreter/index.ts"

const run = (cmds: string) => {
    const tokens = scan(cmds)
    const ast = parse(tokens)
    const run = interpret(ast)
}

const cmds = `a = ((1+2)*(2+(4+5)))
b = 20`

run(cmds)

export { run }