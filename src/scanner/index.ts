interface TokenScan {
    token: Token | null
    next: {
        loc: number, // currentLocation
        cur: number, // currentLineStartPosition
        line: number
    }
}

interface SourceData {
    source: string
    cur: number
    loc: number
    line: number
}

const addTokenScan = (
        type: TokenTypeStrings, 
        value: string, 
        start: number, 
        end: number, 
        cur: number,
        line: number, 
        next: number,
    ): TokenScan => {
    return {
        token: {
            tokenType: type,
            value: value,
            start: start - cur,
            end: end - cur,
            line: line,
        },
        next: {
            loc: end,
            cur: cur,
            line: next
        }
    } as TokenScan
}

const matchMisc = ({source, cur, loc, line}: SourceData): TokenScan | void => {
    if(source[loc] === " " || source[loc] === "\r" || source[loc] === "\t") return {
        token: null,
        next: {
            loc: loc + 1,
            cur: cur,
            line: line
        }
    }
    
    if(source[loc] === "\n") return {
        token: null,
        next: {
            loc: loc + 1,
            cur: loc + 1,
            line: line + 1
        }
    }
    
    if(source[loc] !== "/") return undefined
    if(source[loc + 1] !== "/") return undefined

    return {
        token: null,
        next: {
            loc: source.indexOf("\n", loc + 1) + 1,
            cur: source.indexOf("\n", loc + 1) + 1,
            line: line + 1
        }
    }
}

const matchSingleCharSymbol = ({source, cur, loc, line}: SourceData): TokenScan | void => {
    const symbol: { [key: string]: string } = {
        '(': "LEFT_PAREN",
        ')': "RIGHT_PAREN",
        '{': "LEFT_BRACE",
        '}': "RIGHT_BRACE",
        ',': "COMMA",
        '.': "DOT",
        '-': "MINUS",
        '+': "PLUS",
        ';': "SEMICOLON",
        '*': "STAR",
        '/': "SLASH",
      }

    const value: string = source[loc]
    if(value in symbol) 
        return addTokenScan(symbol[value] as TokenTypeStrings, value, loc, loc+1, cur, line, line)
    return undefined
}

const matchComparator = ({source, cur, loc, line}: SourceData): TokenScan | void => {
    const [first, second] = source.substring(loc, loc+2).split("")
    const symbol: { [key: string]: [string, string]} = {
        "!": ["BANG", "BANG_EQUAL"],
        "<": ["LESS", "LESS_EQUAL"],
        ">": ["GREATER", "GREATER_EQUAL"],
        "=": ["EQUAL", "EQUAL_EQUAL"],
    }

    if(!(first in symbol)) return undefined
    const tokenSymbol = second === "=" ? symbol[first][1] : symbol[first][0]
    const tokenvalue =  second === "=" ? first + second : first
    const nextLoc = second === "=" ? loc + 2 : loc + 1
    return addTokenScan(tokenSymbol as TokenTypeStrings, tokenvalue, loc, nextLoc, cur, line, line)
}

const matchString = ({source, cur, loc, line}: SourceData): TokenScan | void => {
    if(source[loc] === `"`) {
        const endLoc = source.indexOf(`"`, loc + 1)
        if(source.indexOf(`"`, loc + 1) !== -1)
        return addTokenScan("STRING", source.substring(loc, endLoc + 1), loc, endLoc + 1, cur, line, line)
    }
}

const matchNumber = ({source, cur, loc, line}: SourceData): TokenScan | void => {
    if(!source[loc]) return undefined
    if(!(source[loc].match(/[0-9]/))) return undefined

    const scanNext = (source: string, loc: number, value: string, dot: boolean): [string, number] => {
        if(!source[loc]) return [value, loc]
        if(source[loc] === "." && !dot) return scanNext(source, loc + 1, value + source[loc], true)
        else if((source[loc].match(/[0-9]/))) return scanNext(source, loc + 1, value + source[loc], dot)
        return [value, loc]
    }

    const [value, next] = scanNext(source, loc, "", false)
    return addTokenScan("NUMBER", value, loc, next, cur, line, line)
}

const matchIdentifier = ({source, cur, loc, line}: SourceData): TokenScan | void => {
    if(!source[loc]) return undefined
    if(!(source[loc].match(/[A-Za-z]/i))) return undefined

    const scanNext = (source: string, loc: number, value: string): [string, number] => {
        if(!source[loc]) return [value, loc]
        if((source[loc].match(/[A-Za-z]/))) return scanNext(source, loc + 1, value + source[loc])
        return [value, loc]
    }

    const [value, next] = scanNext(source, loc, "")

    const symbol: { [key: string]: string } = {
        and:  "AND",
        class:  "CLASS",
        else:  "ELSE",
        false:  "FALSE",
        for:  "FOR",
        fun:  "FUN",
        if:  "IF",
        nil:  "NIL",
        or:  "OR",
        print:  "PRINT",
        return: "RETURN",
        super:  "SUPER",
        this:  "THIS",
        true:  "TRUE",
        var:  "VAR",
        while:  "WHILE",
    }
    const identifierType = symbol[value] ?? "IDENTIFIER"
    return addTokenScan(identifierType as TokenTypeStrings, value, loc, next, cur, line, line)
}

const scanToken = (source: SourceData): Token[] => {
    const matchResult = [
        matchMisc,
        matchComparator,
        matchSingleCharSymbol,
        matchString,
        matchNumber,
        matchIdentifier
    ].map((fn) => 
        fn({
            source: source.source, 
            cur: source.cur,
            loc: source.loc,
            line: source.line})
    )

    if(matchResult[0]) return scanToken({
        source: source.source,
        cur: matchResult[0].next.cur,
        loc: matchResult[0].next.loc,
        line: matchResult[0].next.line
    })

    const filteredResult = matchResult.filter((res) => res)
    if(filteredResult.length !== 0 && filteredResult[0] && filteredResult[0].token)
    return [filteredResult[0].token].concat(scanToken({
            source: source.source,
            cur: filteredResult[0].next.cur,
            loc: filteredResult[0].next.loc,
            line: filteredResult[0].next.line
    }))

    return [{
        tokenType: "EOF" as TokenTypeStrings,
        value: "",
        start: source.loc - source.cur,
        end: source.loc - source.cur + 1,
        line: source.line
    }]
}

const scan = (source: string) => {
    const tokens: Token[] = scanToken({
        source: source,
        cur: 0,
        loc: 0,
        line: 1
    })
    return tokens
}

export { scan }