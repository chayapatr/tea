import { scan } from "../scanner/index.ts"
import { parse } from "../parser/index.ts"
import { interpret } from "../interpreter/index.ts"

const run = (cmds: string) => {
    const tokens = scan(cmds)
    console.log(tokens)
    const ast = parse(tokens)
    console.log(ast)
    const run = interpret(ast)
}

const cmds = `print "one";
print true;
print 2 + 1;
var a = 10;
print a;
var a = 20;
print a + 10;
`

run(cmds)

export { run }