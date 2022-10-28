const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    connection_database: (dbo) => ipcRenderer.send('database-connection', dbo),
    loadProfiles: () => ipcRenderer.send('loadProfiles','lp'),
    addProfile: (profile) => ipcRenderer.send('addProfile',profile),
    removeProfile: (removeId) => ipcRenderer.send('removeProfile',removeId),
    search_value: (search) => ipcRenderer.send('search-value', search),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    onConnection_database: (callback) => ipcRenderer.on('database-connection',callback),
    onSearch_value:(callback) => ipcRenderer.on('search-value',callback),
    onRows_update:(callback) => ipcRenderer.on('rows_update',callback),
    onLoadProfiles:(callback) => ipcRenderer.on('loadProfiles',callback),
})