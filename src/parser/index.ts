import { Expr } from './expr.ts'
import { Stmt } from './stmt.ts'

interface TokenParse {
    tokens: Token[],
    loc: number
}

// primary → NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")"
const match = (token: Token, type: TokenTypeStrings) => {
    return token?.tokenType === type
}

const check = ({tokens, loc, type, message}: TokenParse & { type: TokenTypeStrings, message: string }) => {
    if(!(match(tokens[loc], type))) throw new Error(message)
}

const primary = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    // console.log("asdf", loc, tokens[loc])
    if(match(tokens[loc], "FALSE")) return [Expr.Literal(false), loc + 1]
    if(match(tokens[loc], "TRUE")) return [Expr.Literal(true), loc + 1]
    if(match(tokens[loc], "NIL")) return [Expr.Literal(null), loc + 1]

    if(match(tokens[loc], "NUMBER")) return [Expr.Literal(tokens[loc].value), loc + 1]
    if(match(tokens[loc], "STRING")) return [Expr.Literal(tokens[loc].value), loc + 1]

    if(match(tokens[loc], "LEFT_PAREN")) {
        const [expr, next] = expression({tokens, loc: loc + 1})
        check({tokens, loc: next, type: "RIGHT_PAREN", message: "Expect Right Parenthesis"})
        return [Expr.Grouping(expr), next + 1]
    }

    return [Expr.Variable(tokens[loc]), loc + 1]
}

// unary → ( "!" | "-" ) unary | primary
const unary = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    if(match(tokens[loc], "BANG") || match(tokens[loc], "MINUS")) {
        const [expr, nextLoc]: [ASTNode, number] = unary({ 
            tokens, 
            loc: loc + 1
        })
        return [Expr.Unary(tokens[loc], expr), nextLoc]
    }
    return primary({
        tokens,
        loc: loc
    })
}

// factor → unary ( ( "/" | "*" ) unary )*
const factor = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    const [expr, nextLoc] = unary({ tokens, loc })
    const next = ({ tokens, loc, expr }: TokenParse & { expr: ASTNode }): [ASTNode, number] => {
        if(!(
            match(tokens[loc], "STAR") || 
            match(tokens[loc], "SLASH")
            )) return [expr, loc]
        const [uniExpr, uniLoc] = unary({ tokens, loc: loc + 1})
        return next({tokens, loc: uniLoc, expr: Expr.Binary(
            expr, tokens[loc], uniExpr
        )})
    }
    return next({
        tokens,
        loc: nextLoc,
        expr
    })
}

// term → factor ( ( "-" | "+" ) factor )*
const term = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    const [expr, nextLoc] = factor({ tokens, loc })
    const next = ({ tokens, loc, expr }: TokenParse & { expr: ASTNode }): [ASTNode, number] => {
        if(!(
            match(tokens[loc], "MINUS") || 
            match(tokens[loc], "PLUS")
            )) return [expr, loc]
        const [factorExpr, factorLoc] = factor({ tokens, loc: loc + 1})
        return next({tokens, loc: factorLoc, expr: Expr.Binary(
            expr, tokens[loc], factorExpr
        )})
    }
    return next({
        tokens,
        loc: nextLoc,
        expr
    })
}

// comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )*
const comparison = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    const [expr, nextLoc] = term({ tokens, loc })
    const next = ({ tokens, loc, expr }: TokenParse & { expr: ASTNode }): [ASTNode, number] => {
        if(!(
            match(tokens[loc], "LESS") || 
            match(tokens[loc], "GREATER") ||
            match(tokens[loc], "LESS_EQUAL") ||
            match(tokens[loc], "GREATER_EQUAL")
            )) return [expr, loc]
        const [termExpr, termLoc] = term({ tokens, loc: loc + 1})
        return next({tokens, loc: termLoc, expr: Expr.Binary(
            expr, tokens[loc], termExpr
        )})
    }
    return next({
        tokens,
        loc: nextLoc,
        expr
    })
}

// equality → comparison ( ( "!=" | "==" ) comparison )*
const equality = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    const [expr, nextLoc] = comparison({ tokens, loc })
    const next = ({ tokens, loc, expr }: TokenParse & { expr: ASTNode }): [ASTNode, number] => {
        if(!(match(tokens[loc], "BANG_EQUAL") || match(tokens[loc], "EQUAL_EQUAL"))) return [expr, loc]
        const [comExpr, comLoc] = comparison({ tokens, loc: loc + 1})
        return next({tokens, loc: comLoc, expr: Expr.Binary(
            expr, tokens[loc], comExpr
        )})
    }
    return next({
        tokens,
        loc: nextLoc,
        expr
    })
}

// expression → equailty 
const expression = ({tokens, loc}: TokenParse): [ASTNode, number] => equality({tokens, loc})

const printStatement = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    const [expr, next] = expression({tokens, loc})
    check({tokens, loc: next, type: "SEMICOLON", message: "Expect ';' after value."})
    return [Stmt.Print(expr), next + 1]
} 

const exprStatement = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    const [expr, next] = expression({tokens, loc})
    // console.log("statement", expr, next, tokens[next])
    check({tokens, loc: next, type: "SEMICOLON", message: "Expect ';' after value."})
    return [Stmt.Expression(expr), next + 1]
}

const statement = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    if(match(tokens[loc], "PRINT")) return printStatement({tokens, loc: loc + 1})
    return exprStatement({ tokens, loc })
}

const varDeclaration = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    check({ tokens, loc, type: "IDENTIFIER", message: "Expect variable name"})
    const name = tokens[loc].value
    if(match(tokens[loc + 1], "EQUAL")) {
        const [expr, next] = expression({ tokens, loc: loc + 2})
        check({ tokens, loc: next, type: "SEMICOLON", message: "Expect ';' after variable declaration."})
        return [Stmt.Var(name, expr), next + 1]
    }
    check({ tokens, loc: loc + 1, type: "SEMICOLON", message: "Expect ';' after variable declaration."})
    return [Stmt.Var(name, null), loc + 2]
}

const synchronize = () => {
    // TODO
}

const declaration = ({tokens, loc}: TokenParse): [ASTNode, number] => {
    try {
        if (match(tokens[loc], "VAR")) return varDeclaration({tokens, loc: loc + 1});
        return statement({tokens, loc});
      } catch (error) {
        console.log(error)
        synchronize();
        throw new Error("Declaration Error")
      }
}

const parseToken = ({tokens, loc}: TokenParse): ASTNode[] => {
    if(loc == tokens.length - 1) return []
    const [expr, next] = declaration({ tokens, loc })
    return [expr, ...parseToken({
        tokens, 
        loc: next}
    )]
}

const parse = (tokens: Token[]) => {
    return parseToken({
        tokens,
        loc: 0
    })
}

export { parse }