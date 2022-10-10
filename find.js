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

function findDataOnTable(table,db){
    return new Promise( async (resolve,reject) => {
        try{
            const data = await sql.executeQueryOnFirebird(`
            SELECT * FROM ${table}
            `,db)
            resolve(data)
        }catch(err){
            reject('Erro ao procurar dados na tabela: ' + err);
        }
    })
}

module.exports = {findTablesOnDatabease,findCollumnsOnTable,findDataOnTable}