type Expr = string | number | boolean | null
type Opr = Token

const Binary = (left: Expr, opr: Opr, right: Expr) => {
    return { type: "BINARY", left, opr, right }
}

const Grouping = (expr: Expr) => {
    return { type: "GROUPING", expr }
}

const Literal = (expr: Expr) => {
    if (expr == null) return {type: "LITERAL", expr: "nil"} ;
    return {type: "LITERAL", expr: expr.toString()}
}

const Unary = (opr: Opr, right: Expr) => {
    return { type: "UNARY", opr, right }
}

export const Expr = {
    Binary,
    Grouping,
    Literal,
    Unary
}