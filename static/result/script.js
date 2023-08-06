import * as renderer from "/codeRenderer.js";

function genJsonCode(div, data, indent = 0, path = []) {
  indent += 1;
  if (Array.isArray(data)) {
    renderer.addCodeText("[", renderer.RED, div);
    renderer.addCodeNewline(div);
    for (let i = 0; i < data.length; i++) {
      renderer.addCodeTab(indent, div);
      path.push(i);

      let val = data[i];
      if (Array.isArray(val) || (typeof val == "object" && val != null)) {
        genJsonCode(div, val, indent, path);
        renderer.addCodeText(",", renderer.WHITE, div);
      } else {
        let valString = "" + val;
        if (typeof val == "string") {
          valString = `"${val}"`;
        }
        let text = renderer.addCodeText(valString, renderer.STRING, div);
        registerPath(text, path);
        renderer.addCodeText(",", renderer.WHITE, div);
      }

      path.pop();
      renderer.addCodeNewline(div);
    }
    renderer.addCodeTab(indent - 1, div);
    renderer.addCodeText("]", renderer.RED, div);
  } else {
    renderer.addCodeText("{", renderer.RED, div);
    renderer.addCodeNewline(div);
    for (let key of Object.keys(data)) {
      path.push(key);
      renderer.addCodeTab(indent, div);
      let keyElem = renderer.addCodeText(`"${key}"`, renderer.JSONKEY, div);
      renderer.addCodeText(": ", renderer.WHITE, div);
      registerPath(keyElem, path);

      let val = data[key];
      if (Array.isArray(val) || (typeof val == "object" && val != null)) {
        genJsonCode(div, val, indent, path);
        renderer.addCodeText(",", renderer.WHITE, div);
      } else {
        let valString = "" + val;
        if (typeof val == "string") {
          valString = `"${val}"`;
        }
        let valElem = renderer.addCodeText(valString, renderer.STRING, div);
        renderer.addCodeText(",", renderer.WHITE, div);
        registerPath(valElem, path);
      }

      path.pop();
      renderer.addCodeNewline(div);
    }
    renderer.addCodeTab(indent - 1, div);
    renderer.addCodeText("}", renderer.RED, div);
  }
  indent -= 1;
}

function registerPath(element, path) {
  element.setAttribute("data-path", JSON.stringify(path));
  element.onclick = toggleScraped;
}

function toggleScraped() {
  // add/remove specific data print
  let valuesContainer = document.getElementById("python-values-container");
  let path = this.getAttribute("data-path");
  let dataName = this.parentElement.getAttribute("data-dataName")

  let pythonCode = document.querySelectorAll(`[data-python-path=${JSON.stringify(path)}]`);
  if (pythonCode.length != 0) {
    pythonCode[0].remove()
  }else{
    addPythonValue(valuesContainer, path, dataName)
  }

  // add/remove data getters
  let dataContainer = document.getElementById("python-datas-container");
  let pythonDataCode = document.querySelectorAll(`[data-python-dataName-code="${dataName}"]`);
  let pythonDataDeclaration = document.querySelectorAll(`[data-python-dataName="${dataName}"]`);

  if (pythonDataCode.length == 0) {
    pythonDataDeclaration[0].remove()
    // all were removed, not needed anymore, remove
  }else{
    // theres atleast one which required it, add if not exists
    if (pythonDataDeclaration.length == 0) {
      addPythonData(dataContainer, dataName)
    }
  }
}

function parseHeaders(urlParams) {
  let headers = {};
  for (let headerKey of urlParams.keys()) {
    if (headerKey == "url") continue;
    headers[headerKey] = urlParams.get(headerKey);
  }
  return headers;
}

function genPythonCode(url, headers) {
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }

  let pyContainer = document.getElementById("python-container");

  renderer.addCodeText("import ", renderer.RED, pyContainer);
  renderer.addCodeText("requests ", renderer.ORANGE, pyContainer);
  renderer.addCodeNewline(pyContainer);

  renderer.addCodeText("import ", renderer.RED, pyContainer);
  renderer.addCodeText("json ", renderer.ORANGE, pyContainer);
  renderer.addCodeNewline(pyContainer);
  renderer.addCodeNewline(pyContainer);

  renderer.addCodeText("r", renderer.WHITE, pyContainer);
  renderer.addCodeText(" = ", renderer.RED, pyContainer);
  renderer.addCodeText("requests", renderer.ORANGE, pyContainer);
  renderer.addCodeText(".", renderer.WHITE, pyContainer);
  renderer.addCodeText("get", renderer.METHOD, pyContainer);
  renderer.addCodeText("(", renderer.PARENTHESIS, pyContainer);
  renderer.addCodeNewline(pyContainer);

  renderer.addCodeTab(1, pyContainer);
  renderer.addCodeText(`"${url}"`, renderer.STRING, pyContainer);
  renderer.addCodeText(", ", renderer.WHITE, pyContainer);
  renderer.addCodeNewline(pyContainer);

  if (Object.keys(headers).length > 0) {
    renderer.addCodeTab(1, pyContainer);
    renderer.addCodeText("headers", renderer.ORANGE, pyContainer);
    renderer.addCodeText("=", renderer.RED, pyContainer);
    renderer.addCodeText("{", renderer.GREEN, pyContainer);
    renderer.addCodeNewline(pyContainer);

    for (let headerKey of Object.keys(headers)) {
      renderer.addCodeTab(2, pyContainer);
      renderer.addCodeText(`"${headerKey}"`, renderer.STRING, pyContainer);
      renderer.addCodeText(": ", renderer.WHITE, pyContainer);
      renderer.addCodeText(
        `"${headers[headerKey]}"`,
        renderer.STRING,
        pyContainer
      );
      renderer.addCodeText(", ", renderer.WHITE, pyContainer);
      renderer.addCodeNewline(pyContainer);
    }

    renderer.addCodeTab(1, pyContainer);
    renderer.addCodeText("}", renderer.GREEN, pyContainer);
    renderer.addCodeNewline(pyContainer);
  }

  renderer.addCodeText(")", renderer.PARENTHESIS, pyContainer);
  renderer.addCodeNewline(pyContainer);
  renderer.addCodeNewline(pyContainer);
  renderer.addCodeText("data", renderer.WHITE, pyContainer);
  renderer.addCodeText(" = ", renderer.RED, pyContainer);
  renderer.addCodeText("r", renderer.WHITE, pyContainer);
  renderer.addCodeText(".", renderer.WHITE, pyContainer);
  renderer.addCodeText("text", renderer.WHITE, pyContainer);

  renderer.addCodeDiv("python-datas-container", pyContainer);
  renderer.addCodeDiv("python-values-container", pyContainer);
}

function addPythonValue(valuesContainer, path, dataVariableName){
  let valueContainer = renderer.addCodeDiv("python-value-container", valuesContainer);
  valueContainer.setAttribute("data-python-path", path)
  valueContainer.setAttribute("data-python-dataName-code", dataVariableName)

  renderer.addCodeText("print", renderer.METHOD, valueContainer);
  renderer.addCodeText("(", renderer.PARENTHESIS, valueContainer);
  renderer.addCodeText(dataVariableName, renderer.WHITE, valueContainer);
  for(let segment of JSON.parse(path)){
    renderer.addCodeText("[", renderer.GREEN, valueContainer);
    if (typeof(segment) == "string"){
        renderer.addCodeText(`"${segment}"`, renderer.STRING, valueContainer);
    }else{
        renderer.addCodeText(segment+"", renderer.STRING, valueContainer);
    }
    renderer.addCodeText("]", renderer.GREEN, valueContainer);
  }
  renderer.addCodeText(")", renderer.PARENTHESIS, valueContainer);
}

function addPythonData(datasContainer, dataName){
  console.log(dataName)
  let jsonDataDiv = document.querySelector(`[data-dataname="${dataName}"]`)

  let prefix = JSON.stringify(jsonDataDiv.getAttribute("data-prefix"))
  let suffix = JSON.stringify(jsonDataDiv.getAttribute("data-suffix"))

  // TODO: add escaping

  let dataContainer = renderer.addCodeDiv("python-data-container", datasContainer);
  dataContainer.setAttribute("data-python-dataname", dataName)

  renderer.addCodeText(dataName+"_start_index", renderer.WHITE, dataContainer);
  renderer.addCodeText(" = ", renderer.RED, dataContainer);
  renderer.addCodeText("data.", renderer.WHITE, dataContainer);
  renderer.addCodeText("index", renderer.METHOD, dataContainer);
  renderer.addCodeText("(", renderer.PARENTHESIS, dataContainer);
  renderer.addCodeText(prefix, renderer.STRING, dataContainer);
  renderer.addCodeText(")", renderer.PARENTHESIS, dataContainer);
  renderer.addCodeText(" + ", renderer.RED, dataContainer);
  renderer.addCodeText("len", renderer.METHOD, dataContainer);
  renderer.addCodeText("(", renderer.PARENTHESIS, dataContainer);
  renderer.addCodeText(prefix, renderer.STRING, dataContainer);
  renderer.addCodeText(")", renderer.PARENTHESIS, dataContainer);
  renderer.addCodeNewline(dataContainer);

  renderer.addCodeText(dataName+"_end_index", renderer.WHITE, dataContainer);
  renderer.addCodeText(" = ", renderer.RED, dataContainer);
  renderer.addCodeText("data.", renderer.WHITE, dataContainer);
  renderer.addCodeText("index", renderer.METHOD, dataContainer);
  renderer.addCodeText("(", renderer.PARENTHESIS, dataContainer);
  renderer.addCodeText(suffix, renderer.STRING, dataContainer);
  renderer.addCodeText(", ", renderer.WHITE, dataContainer);
  renderer.addCodeText(dataName+"_start_index", renderer.WHITE, dataContainer);
  renderer.addCodeText(")", renderer.PARENTHESIS, dataContainer);
  renderer.addCodeNewline(dataContainer);

  renderer.addCodeText(dataName, renderer.WHITE, dataContainer);
  renderer.addCodeText(" = ", renderer.RED, dataContainer);
  renderer.addCodeText("json", renderer.ORANGE, dataContainer);
  renderer.addCodeText(".", renderer.WHITE, dataContainer);
  renderer.addCodeText("loads", renderer.METHOD, dataContainer);
  renderer.addCodeText("(", renderer.PARENTHESIS, dataContainer);
  renderer.addCodeText("data", renderer.STRING, dataContainer);
  renderer.addCodeText("[", renderer.GREEN, dataContainer);
  renderer.addCodeText(dataName+"_start_index", renderer.WHITE, dataContainer);
  renderer.addCodeText(":", renderer.WHITE, dataContainer);
  renderer.addCodeText(dataName+"_end_index", renderer.WHITE, dataContainer);
  renderer.addCodeText("]", renderer.PARENTHESIS, dataContainer);
  renderer.addCodeText(")", renderer.PARENTHESIS, dataContainer);
}

const urlParams = new URLSearchParams(window.location.search);

let url = urlParams.get("url");
let headers = parseHeaders(urlParams);
genPythonCode(url, headers);

fetch(`/api?${urlParams.toString()}`)
  .then((res) => res.json())
  .then((data) => {
    let content = document.getElementById("content");

    for (let i in data) {
      let jsonData = data[i]
      let containerElement = document.createElement("div");
      containerElement.classList.add("code-container");
      content.appendChild(containerElement);
      containerElement.setAttribute("data-prefix", jsonData["prefix"])
      containerElement.setAttribute("data-suffix", jsonData["suffix"])
      containerElement.setAttribute("data-dataname", "data"+i)
      genJsonCode(containerElement, jsonData["json_data"]);
    }
  });
