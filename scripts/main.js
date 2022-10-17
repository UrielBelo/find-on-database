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
const $check = [...document.getElementsByClassName('check')]
const $main = document.getElementsByTagName('main')[0]
const $header = document.getElementsByTagName('header')[0]
const $body = document.getElementsByTagName('body')[0]

const globalObject = {
    tables: [],
    collumns: [],
    data: []
}

$powerButton.addEventListener('mousedown', () => {
    connectOnDatabase()
})
$powerButton.addEventListener('keydown', (ev) => {
    if(ev.which === 13){connectOnDatabase()}
})
$folderSelector.addEventListener('mousedown', async () => {
    await writeFilePath()
})
$folderSelector.addEventListener('keydown', async (ev) => {
    if(ev.which === 13){await writeFilePath()} 
})
$powerButton.addEventListener('focusin', () => {
    $powerButton.style.border = '2px solid orange'
})
$powerButton.addEventListener('focusout', () => {
    $powerButton.style.border = '1px solid black'
})
for(c in $check){
    $check[c].addEventListener('keydown', (ev) => {    
        if(ev.which === 13){
            document.activeElement.checked = true
        }
    })
}

$searchBarSubmit.addEventListener('mousedown', () => {
    const dataToFind = {
        find: $searchBarText.value,
        table: $checkTable.checked,
        collumn: $checkCollumn.checked,
        data: $checkData.checked
    }

    if(dataToFind.data == true){
        $body.appendChild(createMask())
    }

    window.electronAPI.search_value(dataToFind)
})

// RETORNOS

window.electronAPI.onConnection_database( (_event, value) => {
    //Retorno da conexão, mostra o resultado dos valores passados
    $body.removeChild(document.getElementById('mask'))
    $main.style.filter = ''
    $powerButton.style.color = 'green'
})

window.electronAPI.onSearch_value( (_event, value) => {
    const tables = value.tables != undefined ? value.tables : []
    const collumns = value.collumns != undefined ? value.collumns : []
    const data = value.data != undefined ? value.data : []
    
    while(globalObject.tables.length > 0){globalObject.tables.pop()}
    while(globalObject.collumns.length > 0){globalObject.collumns.pop()}
    while(globalObject.data.length > 0){globalObject.data.pop()}

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
        $main.style.filter = ''
        $body.removeChild(document.getElementById('mask'))
        for(d of data){
            if(globalObject.tables.findIndex(x => x.name == d.tb) == -1){
                globalObject.tables.push({
                    name: d.tb,
                    color: '#EEE'
                })
            }
            if(globalObject.collumns.findIndex(x => x.name == d.cl && x.tableName == d.tb) == -1){
                globalObject.collumns.push({
                    name: d.cl,
                    tableName: d.tb,
                    color: '#EEE'
                })
            }
            globalObject.data.push({
                name: d.dt,
                tableName: d.tb,
                collumnName: d.cl,
                color: 'aqua'
            })
        }
    }


    updateTables()
})

window.electronAPI.onRows_update( (_event,value) => {
    createMask(6,1.4)
    printProgress(value.find,value.total)
})

//Funções do sistema

function updateTables(){
    while($tablesTable.children.length > 0){
        $tablesTable.removeChild($tablesTable.firstChild)
    }

    for(t of globalObject.tables){
        $tablesTable.appendChild(getRow(t.name,t.color,'table',null))
    }
}

function getRow(inner,color,type,info){
    const tr = document.createElement('tr')
    const el = document.createElement('td')
    el.innerHTML = inner
    el.style.backgroundColor = color
    tr.appendChild(el)
    if(type == 'table'){
        tr.addEventListener('mousedown', () => {
            showCollumns(inner)
        })
    }
    if(type == 'collumn'){
        tr.addEventListener('mousedown', () => {
            showData(info,inner)
        })
    }
    return tr
}

function showCollumns(table){
    while($collumnsTable.children.length > 0){
        $collumnsTable.removeChild($collumnsTable.firstChild)
    }
    for(c of globalObject.collumns){
        if(c.tableName == table){
            $collumnsTable.appendChild(getRow(c.name,c.color,'collumn',table))
        }
    }
}
function showData(table,collumn){
    while($dataTable.children.length > 0){
        $dataTable.removeChild($dataTable.firstChild)
    }
    for(d of globalObject.data){
        if(d.tableName == table && d.collumnName == collumn){
            for(i of d.name){
                $dataTable.appendChild(getRow(i[collumn],d.color,'data',null))
            }
        }
    }
}
async function writeFilePath(){
    let filePath = await window.electronAPI.openFile() 
    if(filePath == undefined){filePath = ''}
    $databasePath.value = filePath
}
function connectOnDatabase(){
    const databasePathValue = $databasePath.value 
    const userValue = $userInput.value
    const passwordValue = $passwordInput.value

    connectionObject = {
        dbPath: databasePathValue,
        dbUser: userValue,
        dbPass: passwordValue
    }

    window.electronAPI.connection_database(JSON.stringify(connectionObject))
}
function createMask(blur,darkness){
    const $mask = document.createElement('div')
    $main.style.filter = `blur(${blur}px) brightness(${darkness})`
    $mask.style.width = `${$main.offsetWidth}px`
    $mask.style.height = `${$main.offsetHeight}px`
    $mask.style.position = 'absolute'
    $mask.style.top = `${$header.offsetHeight}px`
    $mask.style.backgroundColor = 'transparent'
    $mask.style.display = 'flex'
    $mask.style.justifyContent = 'center'
    $mask.style.alignItems = 'center'
    $mask.setAttribute('id','mask')
    return $mask
}
function printProgress(current,total){
    const $container = document.getElementById('mask')
    const $block = document.createElement('div')
    $container.innerHTML = ''
    let magicPathNumber = 471

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    const svgNS = svg.namespaceURI
    const path = document.createElementNS(svgNS,'path')
    path.setAttribute('stroke','#22E')
    path.setAttribute('stroke-width',18)
    path.setAttribute('fill','none')
    path.setAttribute('d','M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0')

    //Desenhar Porcentagem na Linha
    let l1c = current*magicPathNumber
    let l2c = l1c / total

    path.setAttribute('stroke-dasharray',magicPathNumber)
    path.setAttribute('stroke-dashoffset',((magicPathNumber * -1) + l2c))
    //Escrever Números
    const percert = document.createElement('div')
    let percertNumber = parseInt((current*100) / total)
    percert.innerHTML = `${percertNumber}%`
    percert.style.position = 'relative'
    percert.style.fontSize = '40px'
    percert.style.fontWeight = '700'
    percert.style.color = '#228'
    percert.style.left = `0px`
    percert.style.width = `200px`
    percert.style.textAlign = `center`
    percert.style.bottom = `140px`

    const compare = document.createElement('div')
    let compareString = `${current}/${total}`
    compare.innerHTML = compareString
    compare.style.position = 'relative'
    compare.style.fontSize = '12px'
    compare.style.fontWeight = '600'
    compare.style.color = '#228'
    compare.style.left = '0px'
    compare.style.width = '200px'
    compare.style.textAlign = 'center'
    compare.style.bottom = '140px'

    svg.setAttribute('width',200)
    svg.setAttribute('height',200)
    svg.setAttribute('transform','rotate(90)')

    svg.appendChild(path)
    $block.appendChild(svg)
    $block.appendChild(percert)
    $block.appendChild(compare)
    $container.appendChild($block)
}
function start(){
    $body.appendChild(createMask(4,1))
}

start()