const Print = (expr: ASTNode): Stmt => {
    return { type: "PRINT", expr }
}

const Expression = (expr: ASTNode): Stmt => {
    return { type: "EXPRESSION", expr }
}

const Var = (name: string, expr: ASTNode | null): VarStmt => {
    return { type: "VAR", name, expr}
}

export const Stmt = {
    Print,
    Expression,
    Var
}