import { environment } from "../misc/environment.ts"
type Env = { [key: string]: any } 

const executeLiteralExpr = (node: LiteralExpr, env: Env) => node.expr
const executeGroupingExpr = (node: GroupingExpr, env: Env) => execute(node.expr, env)
const executeUnaryExpr = (node: UnaryExpr, env: Env) => {
    const right = execute(node.right, env)
    
    if(node.opr.tokenType === "MINUS" && typeof right === "string") {
        return -parseFloat(right)
    }
}
const executeBinaryExpr = (node: BinaryExpr, env: Env) => {
    const left = (execute(node.left, env) ?? "").toString()
    const right = (execute(node.right, env) ?? "").toString()
    const opr = node.opr.tokenType

    if(typeof left === "string" && typeof right === "string") {
        if (opr === "MINUS")
            return parseFloat(left) - parseFloat(right)
        else if (opr === "SLASH")
            return parseFloat(left) / parseFloat(right)
        else if (opr === "STAR")
            return parseFloat(left) * parseFloat(right)
        else
            return parseFloat(left) + parseFloat(right)
        }
    return null
}

const executeVariableExpr = (node: VariableExpr, env: Env) => {
    const value = env.method.get(node.name.value)
    return value
}

const executeExpressionStmt = (node: Stmt, env: Env) => execute(node.expr, env)
const executePrintStmt = (node: Stmt, env: Env) => {
    const value = execute(node.expr, env)
    console.log("PRINT", value + "")
}

const executeVarStmt = (node: VarStmt, env: Env) => {
    const value = node.expr ? execute(node.expr, env) : null
    env.method.set(node.name, value)
    return null
}

const execute = (node: ASTNode, env: Env ): string | number | ASTNode | null | void => {
    const { type } = node
    if (type === "LITERAL") return executeLiteralExpr(node as LiteralExpr, env)
    else if (type === "GROUPING") return executeGroupingExpr(node as GroupingExpr, env)
    else if (type === "BINARY") return executeBinaryExpr(node as BinaryExpr, env)
    else if (type === "UNARY") return executeUnaryExpr(node as UnaryExpr, env)
    else if (type === "VARIABLE") return executeVariableExpr(node as VariableExpr, env)

    else if (type === "EXPRESSION") return executeExpressionStmt(node as Stmt, env)
    else if (type === "PRINT") return executePrintStmt(node as Stmt, env)
    else if (type === "VAR") return executeVarStmt(node as VarStmt, env)
    else return null
}

const interpret = (ast: ASTNode[]) => {
    const env = environment()
    ast.map(node => execute(node, env))
}

export { interpret }