import { Expr } from './expr.ts'

interface TokenParse {
    tokens: Token[],
    loc: number
}

// primary → NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")"
const match = (token: Token, type: TokenTypeStrings) => {
    return token?.tokenType === type
}

const primary = ({tokens, loc}: TokenParse): [any, number] => {
    // console.log("asdf", loc, tokens[loc])
    if(match(tokens[loc], "FALSE")) return [Expr.Literal(false), loc + 1]
    if(match(tokens[loc], "TRUE")) return [Expr.Literal(true), loc + 1]
    if(match(tokens[loc], "NIL")) return [Expr.Literal(null), loc + 1]

    if(match(tokens[loc], "NUMBER")) return [Expr.Literal(tokens[loc].value), loc + 1]
    if(match(tokens[loc], "STRING")) return [Expr.Literal(tokens[loc].value), loc + 1]

    if(match(tokens[loc], "LEFT_PAREN")) {
        const [expr, next] = expression({tokens, loc: loc + 1})
        if(!match(tokens[next], "RIGHT_PAREN")) console.log("error")
        return [Expr.Grouping(expr), next + 1]
    }

    return [{
        type: "IDENTIFIER",
        value: tokens[loc].value
    }, loc + 1]
}

// unary → ( "!" | "-" ) unary | primary
const unary = ({tokens, loc}: TokenParse): [any, number] => {
    if(match(tokens[loc], "BANG") || match(tokens[loc], "MINUS")) {
        const [expr, nextLoc]: [any, number] = unary({ 
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
const factor = ({tokens, loc}: TokenParse) => {
    const [expr, nextLoc] = unary({ tokens, loc })
    const next = ({ tokens, loc, expr }: TokenParse & { expr: any }): [any, number] => {
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
const term = ({tokens, loc}: TokenParse) => {
    const [expr, nextLoc] = factor({ tokens, loc })
    const next = ({ tokens, loc, expr }: TokenParse & { expr: any }): [any, number] => {
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
const comparison = ({tokens, loc}: TokenParse) => {
    const [expr, nextLoc] = term({ tokens, loc })
    const next = ({ tokens, loc, expr }: TokenParse & { expr: any }): [any, number] => {
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
const equality = ({tokens, loc}: TokenParse) => {
    const [expr, nextLoc] = comparison({ tokens, loc })
    const next = ({ tokens, loc, expr }: TokenParse & { expr: any }): [any, number] => {
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
const expression = ({tokens, loc}: TokenParse) => equality({tokens, loc})

const parseToken = ({tokens, loc}: TokenParse): any[] => {
    if(loc >= tokens.length - 1) return []
    const [expr, next] = expression({ tokens, loc })
    return [expr, ...parseToken({
        tokens, 
        loc: next}
    )]
}

const parse = (tokens: Token[]) => parseToken({
        tokens,
        loc: 0
    })

export { parse }