import json_parser
import requests

from flask import Flask, request, jsonify

app = Flask(__name__, static_url_path='/')

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/result')
def serve_result():
    return app.send_static_file('result/index.html')

@app.route('/api')
def api():
    url = request.args.get('url')
    headers = {}

    for key in request.args.keys():
        if key == "url":
            continue
        headers[key] = request.args.get(key)

    if url:
        if not url.startswith("http"):
            url = "https://"+url
        return jsonify(extract(url, headers))
    else:
        return "silly"

def extract(url, headers):
    data = requests.get(url, headers=headers).text

    index = 0
    founds = []

    while "{" in data[index:] or "[" in data[index:]:
        was_set = False
        if "{" in data[index:]:
            index = data.index("{", index)
            was_set = True
        if "[" in data[index:] and data.index("[", index) < index or not was_set:
            index = data.index("[", index)
        sub = data[index:]
        res = json_parser.parse(sub)
        
        start = index
        end = index+res[1]+1

        if res[0]:
            prefix = find_prefix(data, start)
            suffix = find_suffix(data, start, end+1)
            founds.append({
                "json_data": res[0],
                "prefix": prefix,
                "suffix": suffix
                })
        index = end

    return founds

def find_prefix(data, start):
    """
    find the token to search for to get the starting index of the json
    """
    length = 0
    while True:
        length+=5
        sub = data[start-length:start]
        if data.index(sub) + len(sub) == start:
            return sub
        
def find_suffix(data, start, end):
    """
    find the token to search for to get the ending index of the json
    """
    length = 0
    while True:
        length+=5
        sub = data[end:end+length]
        if data.index(sub, start) == end:
            return sub

if __name__ == '__main__':
    app.run(port=3000)