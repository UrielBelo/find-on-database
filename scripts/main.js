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
const $dropbtn = document.getElementById('dropbtn')
const $dropdownContent = document.getElementById('dropdownContent')
const $addProfile = document.getElementById('addProfile')
const $subProfile = document.getElementById('subProfile')
const $check = [...document.getElementsByClassName('check')]
const $main = document.getElementsByTagName('main')[0]
const $header = document.getElementsByTagName('header')[0]
const $footer = document.getElementsByTagName('footer')[0]
const $body = document.getElementsByTagName('body')[0]

const globalObject = {
    tables: [],
    collumns: [],
    data: []
}
const profiles = []

let currentProfile = 0

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

$eyeButton.addEventListener('mousedown', (ev) => {
    if($passwordInput.type === 'password'){
        $passwordInput.type = 'text'
        $eyeButton.getElementsByTagName('svg')[0].setAttribute('stroke','lime')
        $eyeButton.getElementsByTagName('svg')[0].setAttribute('stroke-width','1px')
    }else{
        $passwordInput.type = 'password'
        $eyeButton.getElementsByTagName('svg')[0].setAttribute('stroke','black')
        $eyeButton.getElementsByTagName('svg')[0].setAttribute('stroke-width','1px')
    }
})

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
$addProfile.addEventListener('mousedown', async (ev) => {
    const path = $databasePath.value
    const user = $userInput.value
    const pass = $passwordInput.value

    const name = await getPrompt()

    if(name){
        window.electronAPI.addProfile({
            id: profiles[profiles.length-1].id + 1,
            path: path,
            user: user,
            pass: pass,
            name: name
        })
    }
})

$subProfile.addEventListener('mousedown', async (ev) => {
    if(currentProfile != 0){
        window.electronAPI.removeProfile(currentProfile)
    }
    currentProfile = 0

    $databasePath.value = profiles[currentProfile].path
    $userInput.value = profiles[currentProfile].user
    $passwordInput.value = profiles[currentProfile].pass
    $dropbtn.innerHTML = profiles[currentProfile].name
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
window.electronAPI.onLoadProfiles( (_event,value) => {
    while(profiles.length > 0){
        profiles.pop()
    }

    profiles.push({
        id: 0,
        name: 'Empty',
        path: null,
        user: null,
        pass: null
    })
    for(i of value){
        profiles.push({
            id: i.profile_id,
            name: i.profile_name,
            path: i.profile_path,
            user: i.profile_user,
            pass: i.profile_pass
        })
    }
    renderProfiles()
})

//Funções do sistema

async function getPrompt(){
    return new Promise( async (resolve,reject) => {
        const $filter = document.createElement('div')
        $filter.style.width = '100vw'
        $filter.style.height = '100vh'
        $filter.style.display = 'flex'
        $filter.style.justifyContent = 'center'
        $filter.style.alignItems = 'center'
        $filter.style.position = 'absolute'
        $filter.style.top = '0'
        $filter.style.backgroundColor = 'rgba(230,230,230,0.5)'

        const $prompt = document.createElement('div')
        $prompt.style.width = '350px'
        $prompt.style.height = '50px'
        $prompt.setAttribute('id','namePrompt')

        const $confirm = document.createElement('button')
        $confirm.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" stroke= class="bi bi-check" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>`
        $confirm.classList.add('confirm')

        const $cancel = document.createElement('button')
        $cancel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>`
        $cancel.classList.add('cancel')

        const $nameInput = document.createElement('input')
        $nameInput.setAttribute('type','text')
        $nameInput.setAttribute('placeholder','Nome da Profile')

        $prompt.appendChild($nameInput)
        $prompt.appendChild($confirm)
        $prompt.appendChild($cancel)
        
        $filter.appendChild($prompt)
        $body.appendChild($filter)

        $confirm.addEventListener('mousedown', (ev) => {
            $body.removeChild($filter)
            resolve($nameInput.value)
        })

        $cancel.addEventListener('mousedown', (ev) => {
            $body.removeChild($filter)
            reject(null)
        })
    })
}

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
function loadProfiles(){
    window.electronAPI.loadProfiles()
}
function renderProfiles(){
    while($dropdownContent.children.length > 0){
        $dropdownContent.removeChild($dropdownContent.firstChild)
    }
    for(p in profiles){
        const item = document.createElement('div')
        item.classList.add('dropdownItem')
        item.setAttribute('id',`p${profiles[p].id}`)
        item.innerHTML = profiles[p].name

        item.addEventListener('mousedown', (ev) => {
            const elID = (ev.target.id).replace('p','')
            const searchObject = profiles.findIndex(x => x.id == elID)
            $databasePath.value = profiles[searchObject].path
            $userInput.value = profiles[searchObject].user
            $passwordInput.value = profiles[searchObject].pass
            $dropbtn.innerHTML = profiles[searchObject].name
            currentProfile = elID
        })

        $dropdownContent.appendChild(item)
    }
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
    loadProfiles()
}

start()