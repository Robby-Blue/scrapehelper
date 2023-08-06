// gen python

import * as renderer from "/codeRenderer.js";

let pyContainer = document.getElementById("python-container")

function genRequestCode(){
    renderer.addCodeText("r", renderer.WHITE, pyContainer)
    renderer.addCodeText(" = ", renderer.RED, pyContainer)
    renderer.addCodeText("requests", renderer.WHITE, pyContainer)
    renderer.addCodeText(".", renderer.WHITE, pyContainer)
    renderer.addCodeText("get", renderer.WHITE, pyContainer)
    renderer.addCodeText("(", renderer.PARENTHESIS, pyContainer)
    renderer.addCodeNewline(pyContainer)
    renderer.addCodeTab(1, pyContainer)
    renderer.addCodeText("\"", renderer.STRING, pyContainer)
    renderer.addCodeInput(pyContainer)
    renderer.addCodeText("\"", renderer.STRING, pyContainer)
    renderer.addCodeText(", ", renderer.WHITE, pyContainer)
    renderer.addCodeNewline(pyContainer)
    renderer.addCodeTab(1, pyContainer)
    renderer.addCodeText("headers", renderer.ORANGE, pyContainer)
    renderer.addCodeText("=", renderer.RED, pyContainer)
    renderer.addCodeText("{", renderer.GREEN, pyContainer)
    renderer.addCodeNewline(pyContainer)

    renderer.addCodeDiv("python-headers-container", pyContainer)
    
    renderer.addCodeTab(1, pyContainer)
    renderer.addCodeText("}", renderer.GREEN, pyContainer)
    renderer.addCodeNewline(pyContainer)
    renderer.addCodeText(")", renderer.PARENTHESIS, pyContainer)
}

function removeHeader(){
    let headersContainer = document.getElementById("python-headers-container")

    let children = headersContainer.childNodes
    let len = children.length
    if(len == 0)
        return
    let lastChild = children[len-1]
    headersContainer.removeChild(lastChild)
}

function addHeader(){
    let headersContainer = document.getElementById("python-headers-container")
    let headerDiv = renderer.addCodeDiv("python-headers-sub-container", headersContainer)

    renderer.addCodeTab(2, headerDiv)
    renderer.addCodeText("\"", renderer.STRING,headerDiv)
    renderer.addCodeInput(headerDiv)
    renderer.addCodeText("\"", renderer.STRING,headerDiv)
    renderer.addCodeText(": ", renderer.WHITE,headerDiv)
    renderer.addCodeText("\"", renderer.STRING,headerDiv)
    renderer.addCodeInput(headerDiv)
    renderer.addCodeText("\"", renderer.STRING,headerDiv)
    renderer.addCodeText(", ", renderer.WHITE,headerDiv)
    renderer.addCodeNewline(headerDiv)
}

function submit(){
    let headersContainer = document.getElementById("python-headers-container")
    let inputs = document.getElementsByTagName("input")
    let url = inputs[0].value

    let params = `url=${encodeURIComponent(url)}`

    for(let i = 0; i<headersContainer.childNodes.length; i++){
        params += `&${encodeURIComponent(inputs[i*2+1].value)}=${encodeURIComponent(inputs[i*2+2].value)}`
    }

    const redirectUrl = `/result?${params}`;
    console.log(redirectUrl)

    window.location.replace(redirectUrl)
}

genRequestCode()

document.getElementById("remove-button").onclick = removeHeader
document.getElementById("add-button").onclick = addHeader
document.getElementById("submit-button").onclick = submit