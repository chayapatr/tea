enum TokenType {
    // Single-character tokens.
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
    COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,
  
    // One or two character tokens.
    BANG, BANG_EQUAL,
    EQUAL, EQUAL_EQUAL,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,
  
    // Literals.
    IDENTIFIER, STRING, NUMBER,
  
    // Keywords.
    AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
    PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,
  
    EOF
  }

type TokenTypeStrings = keyof typeof TokenType

interface Token {
    tokenType: TokenTypeStrings
    value: string
    start: number
    end: number
    line: number
}

type Opr = Token

type Expr = {
    type: string
}

interface BinaryExpr extends Expr {
    left: ASTNode,
    opr: Opr,
    right: ASTNode
}

interface GroupingExpr extends Expr {
    expr: ASTNode
}

interface LiteralExpr extends Expr {
    expr: ASTNode | string
}

interface UnaryExpr extends Expr {
    opr: Opr,
    right: ASTNode
}

interface IdentifierExpr extends Expr {
    expr: ASTNode | string
}

interface VariableExpr extends Expr {
    name: Toekn
}

interface Stmt {
    type: string
    expr: ASTNode
}

interface VarStmt {
    type: string,
    name: string
    expr: ASTNode | null
}

type ASTNode = Expr | BinaryExpr | GroupingExpr | UnaryExpr | IdentifierExpr | Stmt