export const environment = () => {
    const db: { [key: string]: any} = {}
    const method = {
        get: (name: string) => {
            if(!(name in db)) throw new Error("Not Declared")
            return db[name]
        },
        set: (key: string, value: any) => {
            db[key] = value
        },
        print: () => {
            console.log(db)
        }
    }
    return { db, method }
}