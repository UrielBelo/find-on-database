const sql = require('./connection');

function findTablesOnDatabease(db,table){
    return new Promise( async (resolve,reject) => {
        try{
            const tables = await sql.executeQueryOnFirebird(`
            SELECT * FROM
            (SELECT RDB$RELATION_NAME AS TABELA FROM RDB$RELATIONS
            WHERE ("RDB$SYSTEM_FLAG" = 0) OR ("RDB$SYSTEM_FLAG" IS NULL) AND 
            RDB$VIEW_SOURCE IS NULL 
            ORDER BY "RDB$RELATION_NAME") f
            WHERE TABELA LIKE '%${table}%'
            `,db)
            resolve(tables)
        }catch(err){
            reject('Erro ao procurar tabelas no banco de dados: ' + err);
        }
    })
}
function findCollumnsOnTable(db,collumn){
    return new Promise( async (resolve,reject) => {
        try{
            const columns = await sql.executeQueryOnFirebird(`
            SELECT RDB$FIELD_NAME,RDB$RELATION_NAME FROM RDB$RELATION_FIELDS
            WHERE RDB$FIELD_NAME LIKE '%${collumn}%'
            AND ("RDB$SYSTEM_FLAG" = 0) OR ("RDB$SYSTEM_FLAG" IS NULL)
            ORDER BY "RDB$FIELD_NAME"
            `,db)
            resolve(columns)
        }catch(err){
            reject('Erro ao procurar colunas na tabela: ' + err);
        }
    })
}
function getAllCollumnsInDatabase(db){
    return new Promise( async (resolve,reject) => {
        try{
            const collumns = await sql.executeQueryOnFirebird(`SELECT rrf."RDB$FIELD_NAME",rrf."RDB$RELATION_NAME",rf."RDB$FIELD_TYPE" FROM RDB$RELATION_FIELDS rrf
            INNER JOIN RDB$FIELDS rf ON rrf.RDB$FIELD_SOURCE = rf."RDB$FIELD_NAME" 
            WHERE (rrf."RDB$SYSTEM_FLAG" = 0) OR (rrf."RDB$SYSTEM_FLAG" IS NULL)
            ORDER BY rrf."RDB$FIELD_NAME"`,db)
            resolve(collumns)
        }catch(err){
            reject('Erro ao procurar colunas no banco de Dados: ' + err);
        }
    })
}
function countAllRegistersOnDatabase(db){
    return new Promise( async (resolve,reject) => {
        try{
            const tabelas = await sql.executeQueryOnFirebird(`SELECT SUM(COLUNAS) AS SOMA FROM
            (SELECT "RDB$RELATION_NAME",COUNT("RDB$FIELD_NAME") AS COLUNAS FROM RDB$RELATION_FIELDS
            WHERE (("RDB$SYSTEM_FLAG" = 0) OR ("RDB$SYSTEM_FLAG") IS NULL)
            GROUP BY "RDB$RELATION_NAME") f`,db)
            resolve(tabelas[0].SOMA)
        }catch(err){
            reject('')
        }
    })
}
function findDataOnTable(db,dt,win){
    return new Promise( async (resolve,reject) => {
        try{
            let contador = 0
            const results = []
            const collumns = await getAllCollumnsInDatabase(db)
            const allRegistersOnDatabase = await countAllRegistersOnDatabase(db)
            for(cl in collumns){
                const collumn = collumns[cl].RDB$FIELD_NAME.replace(/ /g,'')
                const table = collumns[cl].RDB$RELATION_NAME.replace(/ /g,'')
                const collumnType = collumns[cl].RDB$FIELD_TYPE

                let query
                switch (collumnType) {
                    case 7:
                    case 8:
                    case 10:
                    case 16:
                    case 27: 
                        if(!parseInt(dt)){
                            query = `SELECT 1 FROM ${table} WHERE 1 = 2`
                        }else{
                            query = `SELECT ${collumn} FROM ${table}
                            WHERE ${collumn} = ${parseInt(dt)}` 
                        }       
                        break;
                    case 37:
                    case 14:
                        query =`SELECT ${collumn} FROM ${table}
                        WHERE ${collumn} LIKE '%${dt}%'`
                        break;
                    case 12:
                    case 13:
                    case 35:
                        query = `SELECT ${collumn} FROM ${table} WHERE
                        CAST(${collumn} AS VARCHAR(24)) LIKE '%${dt}%'`
                    default:
                        console.log('TIPO BLOB')
                        break;
                }
                const data = query != undefined ? await sql.executeQueryOnFirebird(query,db) : []

                if(data.length > 0){
                    results.push({tb: table, dt: data})
                }

                win.webContents.send('rows_update',{find: contador, total: allRegistersOnDatabase})
                contador++
            }

            resolve(results)
        }catch(err){
            reject('Erro ao procurar dados na tabela: ' + err);
        }
    })
}

module.exports = {findTablesOnDatabease,findCollumnsOnTable,findDataOnTable}