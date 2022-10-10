const firebird = require('node-firebird');

function getDatabase(dbInfo){
    return new Promise( async (resolve,reject) => {
        try{
            firebird.attach(dbInfo, (err,db) => {
                if(err){
                    console.error('Erro ao Conectar ao Banco de Dados: ' + err);
                    resolve('default')
                }else{
                    resolve(db)
                }
            })
        }catch(err){
            reject('Erro na conexão com o Banco de Dados: ' + err);
        }
    })
}

function executeQueryOnFirebird(query,database){
    return new Promise( async (resolve,reject) => {
        try{
            database.query(query, (err,result) => {
                if(err){
                    console.error('Erro ao executar query: ' + err);
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        }catch(err){
            reject('Erro na Execução da Query: ' + err);
        }
    })
}

module.exports = {getDatabase,executeQueryOnFirebird}