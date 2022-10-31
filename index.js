const find = require('./find')
const connection = require('./connection')
const {app,BrowserWindow,nativeImage,ipcMain, dialog} = require('electron')
const path = require('path')
const sqlite3 = require('sqlite3')
const { exit } = require('process')
const CryptoJS = require("crypto-js")
const sqlString = require('sqlstring')

const key = 'HellOWorld'

module.paths.push(path.resolve('node_modules'))
module.paths.push(path.resolve('../node_modules'))
// require('electron-reload')(__dirname,{
//     electron: require(`${__dirname}/node_modules/electron`)
// })

const db = new sqlite3.Database('./profiles.db', sqlite3.OPEN_READWRITE, (err) => {
    if(err && err.code == 'SQLITE_CANTOPEN'){
        createDatabase()
        return
    }else if(err){
        console.log('Getting error' + err)
        exit(1)
    }
})

function createDatabase(){
    let newDb = new sqlite3.Database('profiles.db', (err) => {
        if(err){
            console.log('Getting error' + err)
            exit(1)
        }
        createTables(newDb)
    })
}
function createTables(newDb){
    console.log('Criando tabela Profile')
    newDb.exec(`
        CREATE TABLE PROFILE(
            profile_id int primary key not null,
            profile_name text not null,
            profile_path text,
            profile_user text,
            profile_pass text
        );
    `)
}
function insertProfile(db,profile){
    return new Promise( async (resolve,reject) => {
        try{
            db.exec(`INSERT INTO PROFILE
            VALUES(${profile.id},
                '${profile.name}',
                '${profile.path}',
                ${sqlString.escape(encrypt(profile.user))},
                ${sqlString.escape(encrypt(profile.pass))})`)
            resolve()
        }catch(err){
            console.error('Erro ao inserir profile')
            reject()
        }
    })
}
function removeProfile(db,profile){
    return new Promise( async (resolve,reject) => {
        try{
            query = `DELETE FROM PROFILE WHERE profile_id = ${profile}`
            db.exec(query)
            resolve()
        }catch(err){
            console.error('Erro ao remover profile')
            reject()
        }
    })
}

const databaseConnectionInfo = {
    host: '127.0.0.1',
    port: 3050,
    database: '',
    user: '',
    password: '',
    lowercase_keys: false,
    role: null,
    pageSize: 4096,
    retryConnectionInterval: 1000
}
let system = 'default'

app.on('ready', () => {
    const icon = nativeImage.createFromPath(`${__dirname}/build/icon.png`)
    if(app.dock){
        app.dock.setIcon(icon)
    }

    const win = new BrowserWindow({
        icon,
        width: 700,
        height: 660,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname,'preload.js')
        }
    })

    ipcMain.on('database-connection', async (ev,db) => {
        const dbInfo = JSON.parse(db)

        databaseConnectionInfo.database = dbInfo.dbPath
        databaseConnectionInfo.user = dbInfo.dbUser
        databaseConnectionInfo.password = dbInfo.dbPass

        system = await connection.getDatabase(databaseConnectionInfo)

        if(system != 'default'){
            win.webContents.send('database-connection','database-connection-sucess')
        }else{
            win.webContents.send('database-connection','database-connection-error')
        }
    })

    ipcMain.on('search-value', async (ev,search) => {
        let tables,collumns,data
        if(search.table){
            tables = await find.findTablesOnDatabease(system,search.find)
        }
        if(search.collumn){
            collumns = await find.findCollumnsOnTable(system,search.find)
        }
        if(search.data){
            data = await find.findDataOnTable(system,search.find,win)
        }
        win.webContents.send('search-value',{tables: tables,collumns: collumns,data: data})
    })

    ipcMain.on('loadProfiles', async (ev) => {
        const profiles = await getAllProfiles(db)
        
        win.webContents.send('loadProfiles',profiles)
    })
    ipcMain.on('addProfile', async (ev,profile) => {
        await insertProfile(db,{
            id: profile.id,
            name: profile.name,
            path: profile.path,
            user: profile.user,
            pass: profile.pass
        })
        const profiles = await getAllProfiles(db)

        win.webContents.send('loadProfiles',profiles)
    })
    ipcMain.on('removeProfile', async (ev,id) => {
        await removeProfile(db,id)
        const profiles = await getAllProfiles(db)

        win.webContents.send('loadProfiles',profiles)
    })

    ipcMain.handle('dialog:openFile', handleFileOpen)

    win.loadFile('./index.html')
})
app.on('window-all-closed', () => {
    if(process.platform !== "darwin"){
        app.quit()
    }
})

async function handleFileOpen(){
    const {canceled,filePaths} = await dialog.showOpenDialog()
    if(canceled){
        console.log('Operação cancelada pelo user')
        return
    }else{
        return filePaths[0]
    }
}
async function getAllProfiles(db){
    return new Promise( async (resolve,reject) => {
        try{
            const profiles = []
            db.all(`SELECT * FROM PROFILE`, [], (err,rows) => {
                if(err){
                    throw err
                }
                rows.forEach( row => {
                    profiles.push({
                        profile_id: row.profile_id,
                        profile_name: row.profile_name,
                        profile_path: row.profile_path,
                        profile_user: decrypt(row.profile_user),
                        profile_pass: decrypt(row.profile_pass)
                    })
                })
                resolve(profiles)
            })
        }catch(err){
            console.error('Erro ao coletar as Profiles: \n' + err)
            reject()
        }
    })
}

function encrypt(value){
    return CryptoJS.AES.encrypt(value,key).toString()
}
function decrypt(value){
    var bytes = CryptoJS.AES.decrypt(value,key)
    return bytes.toString(CryptoJS.enc.Utf8)
}