LEFT_BRACE = "LEFT_BRACE"
LEFT_BRACKET = "LEFT_BRACKET"
RIGHT_BRACE = "RIGHT_BRACE"
RIGHT_BRACKET = "RIGHT_BRACKET"
COMMA = "COMMA"
COLON = "COLON"
STRING = "STRING"
VALUE = "VALUE"

def parse(data):
    tokens = lex(data)
    if not tokens:
        return None, 0
    if tokens[0]["type"] == LEFT_BRACE:
        obj, last_token = parse_object(tokens)
        return obj, tokens[last_token-1]["pos"]
    elif tokens[0]["type"] == LEFT_BRACKET:
        arr, last_token = parse_array(tokens)
        return arr, tokens[last_token-1]["pos"]
    else:
        return None, 0

# parser
def parse_object(tokens, index=0):
    obj = {}
    last_token_type = None
    key = None

    while True:
        index+=1
        if index >= len(tokens):
            return None, index
        token = tokens[index]
        token_type = token["type"]
        if token_type == RIGHT_BRACE:
            return obj, index
        if not last_token_type or (token_type == STRING and last_token_type == COMMA):
            key = token["data"]
        if token_type == COLON:
            if last_token_type != STRING:
                return None, index
        if token_type == VALUE:
            if last_token_type != COLON:
                return None, index
            obj[key] = token["data"]
        if token_type == LEFT_BRACE:
            if last_token_type != COLON:
                return None, index
            val, index = parse_object(tokens, index)
            if val == None:
                return None, index
            obj[key] = val
            last_token_type = VALUE
            continue
        if token_type == LEFT_BRACKET:
            if last_token_type != COLON:
                return None, index
            val, index = parse_array(tokens, index)
            if val == None:
                return None, index
            obj[key] = val
            last_token_type = VALUE
            continue
        if token_type == COMMA:
            if last_token_type != VALUE:
                return None, index
        last_token_type = token_type

def parse_array(tokens, index=0):
    arr = []
    last_token_type = COMMA

    while True:
        index+=1
        if index >= len(tokens):
            return None, index
        token = tokens[index]
        token_type = token["type"]
        if token_type == RIGHT_BRACKET:
            return arr, index
        
        if token_type == COMMA:
            if last_token_type != VALUE and last_token_type != STRING:
                return None, index 
        if token_type == STRING or token_type == VALUE:
            if last_token_type != COMMA and last_token_type:
                return None, index
            arr.append(token["data"])
            last_token_type = VALUE
            continue
        if token_type == LEFT_BRACE:
            if last_token_type != COMMA:
                return None, index
            val, index = parse_object(tokens, index)
            if val == None:
                return None, index
            arr.append(val)
            last_token_type = VALUE
            continue
        if token_type == LEFT_BRACKET:
            if last_token_type != COMMA:
                return None, index
            val, index = parse_array(tokens, index)
            if val == None:
                return None, index
            arr.append(val)
            last_token_type = VALUE
            continue
        last_token_type = token_type

# lexer
def lex(data):
    tokens = []
    index = 0
    while index < len(data):
        char = data[index]
        if char == " " or char == "\n":
            pass
        elif char == "{":
            tokens.append(token(LEFT_BRACE, index))
        elif char == "}":
            tokens.append(token(RIGHT_BRACE, index))
        elif char == "[":
            tokens.append(token(LEFT_BRACKET, index))
        elif char == "]":
            tokens.append(token(RIGHT_BRACKET, index))
        elif char == ",":
            tokens.append(token(COMMA, index))
        elif char == "\"":
            string, index = parse_string(data, index+1)
            if tokens[-1]["type"] == COLON:
                tokens.append(token(VALUE, index, string))
            else:
                tokens.append(token(STRING, index, string))
        elif char == ":":
            tokens.append(token(COLON, index))
        elif char in "-0123456789.":
            number, index = parse_number(data, index)
            if number == None:
                return tokens
            tokens.append(token(VALUE, index, number))
        else:
            val, index = parse_value(data, index)
            if val == "true" or val == "false":
                bool_val = val=="true"
                tokens.append(token(VALUE, index, bool_val))
            elif val == "null":
                tokens.append(token(VALUE, index, None))
            else:
                return tokens
        index+=1
    return tokens

def parse_string(data, index):
    string = ""

    is_special_char = False
    hex_digest = None

    while index < len(data):
        char=data[index]
        if char != "\\":
            if not is_special_char:
                if char == "\"":
                    break
                string+=char
            else:
                if hex_digest != None:
                    hex_digest+=char
                    if len(hex_digest) == 4:
                        string+=chr(int(hex_digest, 16))
                        hex_digest = None
                        is_special_char = False
                else:
                    is_special_char = char == "u"
                    if char == "\"":
                        string+="\""
                    if char == "/":
                        string+="/"
                    if char == "b":
                        string+="\b"
                    if char == "f":
                        string+="\f"
                    if char == "n":
                        string+="\n"
                    if char == "r":
                        string+="\r"
                    if char == "t":
                        string+="\t"
                    if char == "u":
                        hex_digest=""
        else:
            if is_special_char:
                string+="\\"
            is_special_char = not is_special_char

        index+=1

    return string, index

def parse_number(data, start_index):
    index = start_index

    while index < len(data):
        char=data[index]
        if not char in "-1234567890.":
            break
        index+=1

    num_str = data[start_index:index]

    if num_str == "-" or num_str == ".":
        return (None, 0)
    if num_str.count("-") == 1 and num_str[0] != "-":
        return (None, 0)
    if num_str.count("-") > 1:
        return (None, 0)

    if num_str.count(".") == 0:
        return int(num_str), index-1
    if num_str.count(".") == 1:
        return float(num_str), index-1
    if num_str.count(".") > 1:
        return (None, 0)
    
def parse_value(data, start_index):
    index = start_index

    while index < len(data):
        char=data[index]
        if char in "}], ":
            break
        index+=1

    val_str = data[start_index:index]

    return val_str, index-1

def token(type, pos, data=""):
    return {
        "type": type,
        "pos": pos,
        "data":data
    }