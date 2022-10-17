const find = require('./find')
const connection = require('./connection')
const {app,BrowserWindow,nativeImage,ipcMain, dialog} = require('electron')
const path = require('path')

require('electron-reload')(__dirname,{
    electron: require(`${__dirname}/node_modules/electron`)
})

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