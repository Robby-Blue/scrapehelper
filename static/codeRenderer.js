export let WHITE = "white"
export let RED = "red"
export let STRING = "string"
export let PARENTHESIS = "parenthesis"
export let GREEN = "green"
export let ORANGE = "orange"
export let JSONKEY = "jsonkey"
export let METHOD = "method"

export function addCodeText(text, color, div) {
    let htmlElement = document.createElement("span")
    htmlElement.textContent = text
    htmlElement.classList.add(color)
    div.appendChild(htmlElement)
    return htmlElement
}

export function addCodeNewline(div) {
    let htmlElement = document.createElement("br")
    div.appendChild(htmlElement)
}

export function addCodeInput(div) {
    let htmlElement = document.createElement("input")
    div.appendChild(htmlElement)
}

export function addCodeTab(count=1, div) {
    let spaces = ""
    for(let i = 0;i<count;i++){
        spaces+="    "
    }
    addCodeText(spaces, WHITE, div)
}

export function addCodeDiv(name, div) {
    let htmlElement = document.createElement("div")
    htmlElement.id = name
    div.appendChild(htmlElement)
    return htmlElement
}