const Binary = (left: Expr, opr: Opr, right: Expr): BinaryExpr => {
    return { type: "BINARY", left, opr, right }
}

const Grouping = (expr: Expr): GroupingExpr => {
    return { type: "GROUPING", expr }
}

const Literal = (expr: string | number | boolean | null): LiteralExpr => {
    if (expr == null) return {type: "LITERAL", expr: "nil"} ;
    return {type: "LITERAL", expr: expr.toString()}
}

const Unary = (opr: Opr, right: Expr): UnaryExpr => {
    return { type: "UNARY", opr, right }
}

const Variable = (name: Token): VariableExpr => {
    return { type: "VARIABLE", name }
}

export const Expr = {
    Binary,
    Grouping,
    Literal,
    Unary,
    Variable
}