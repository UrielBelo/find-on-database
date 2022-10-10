const $databasePath = document.getElementById('pathInput')
const $userInput = document.getElementById('userInputText')
const $powerButton = document.getElementById('powerBtn')
const $passwordInput = document.getElementById('passwordInputText')
const $eyeButton = document.getElementById('eyeButton')
const $folderSelector = document.getElementById('folderSelector')
const $searchBarText = document.getElementById('searchBarText')
const $searchBarSubmit = document.getElementById('searchBarSubmit')
const $checkTable = document.getElementById('checkTable')
const $checkCollumn = document.getElementById('checkCollumn')
const $checkData = document.getElementById('checkData')
const $tablesTable = document.getElementById('tablesTableElement')
const $collumnsTable = document.getElementById('collumnsTableElement')
const $dataTable = document.getElementById('dataTableElement')

const globalObject = {
    tables: [],
    collumns: [],
    data: []
}

$powerButton.addEventListener('mousedown', () => {
    const databasePathValue = $databasePath.value 
    const userValue = $userInput.value
    const passwordValue = $passwordInput.value

    connectionObject = {
        dbPath: databasePathValue,
        dbUser: userValue,
        dbPass: passwordValue
    }

    window.electronAPI.connection_database(JSON.stringify(connectionObject))
})

$folderSelector.addEventListener('mousedown', async () => {
    const filePath = await window.electronAPI.openFile()
    $databasePath.value = filePath
})

$searchBarSubmit.addEventListener('mousedown', () => {
    const dataToFind = {
        find: $searchBarText.value,
        table: $checkTable.checked,
        collumn: $checkCollumn.checked,
        data: $checkData.checked
    }

    window.electronAPI.search_value(dataToFind)
})

// RETORNOS

window.electronAPI.onConnection_database( (_event, value) => {
    //Retorno da conexão, mostra o resultado dos valores passados
    console.log(value)
})

window.electronAPI.onSearch_value( (_event, value) => {
    const tables = value.tables != undefined ? value.tables : []
    const collumns = value.collumns != undefined ? value.collumns : []
    const data = value.data != undefined ? value.data : []
    
    while(globalObject.tables.length > 0){globalObject.tables.pop()}
    while(globalObject.collumns.length > 0){globalObject.collumns.pop()}

    if(tables.length > 0){
        for(t of tables){
            globalObject.tables.push({
                name: t.TABELA.replace(/ /g,''),
                color: '#CE5'
            })
        }
    }

    if(collumns.length > 0){
        for(c of collumns){
            if(globalObject.tables.findIndex(x => x.name == c.RDB$RELATION_NAME.replace(/ /g,'') == -1)){
                globalObject.tables.push({
                    name: c.RDB$RELATION_NAME.replace(/ /g,''),
                    color: '#EEE'
                })
            }
            globalObject.collumns.push({
                name: c.RDB$FIELD_NAME.replace(/ /g,''),
                tableName: c.RDB$RELATION_NAME.replace(/ /g,''),
                color: '#CE5'
            })
        }
    }
    if(data.length > 0){
        for(d of data){
            console.log(d)
        }
    }


    updateTables()
})

window.electronAPI.onRows_update( (_event,value) => {
    console.log(value)
})

//Funções do sistema

function updateTables(){
    while($tablesTable.children.length > 0){
        $tablesTable.removeChild($tablesTable.firstChild)
    }

    for(t of globalObject.tables){
        $tablesTable.appendChild(getRow(t.name,t.color))
    }
}

function getRow(inner,color){
    const tr = document.createElement('tr')
    const el = document.createElement('td')
    el.innerHTML = inner
    el.style.backgroundColor = color
    tr.appendChild(el)
    tr.addEventListener('mousedown', () => {
        showCollumns(inner)
    })
    return tr
}

function showCollumns(table){
    while($collumnsTable.children.length > 0){
        $collumnsTable.removeChild($collumnsTable.firstChild)
    }
    for(c of globalObject.collumns){
        if(c.tableName == table){
            $collumnsTable.appendChild(getRow(c.name,c.color))
        }
    }
}