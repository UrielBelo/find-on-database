const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    connection_database: (dbo) => ipcRenderer.send('database-connection', dbo),
    search_value: (search) => ipcRenderer.send('search-value', search),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    onConnection_database: (callback) => ipcRenderer.on('database-connection',callback),
    onSearch_value:(callback) => ipcRenderer.on('search-value',callback),
    onRows_update:(callback) => ipcRenderer.on('rows_update',callback)
})