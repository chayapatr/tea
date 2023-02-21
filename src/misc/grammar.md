expression → literal
| unary
| binary
| grouping ;

literal → NUMBER | STRING | "true" | "false" | "nil" ;
grouping → "(" expression ")" ;
unary → ( "-" | "!" ) expression ;
binary → expression operator expression ;
operator → "==" | "!=" | "<" | "<=" | ">" | ">="
| "+" | "-" | "\*" | "/" ;

expression → equality ;
equality → comparison ( ( "!=" | "==" ) comparison )_ ;
comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )_ ;
term → factor ( ( "-" | "+" ) factor )_ ;
factor → unary ( ( "/" | "_" ) unary )\* ;
unary → ( "!" | "-" ) unary
| primary ;
primary → NUMBER | STRING | "true" | "false" | "nil"
| "(" expression ")" ;
