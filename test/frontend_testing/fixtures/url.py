def _get_origin():
    with open("deploy/promis_api.yaml") as fp:
        origin =  yaml.load(fp)["host"].split(":")
        if origin[0] == "localhost" or origin[0] == "127.0.0.1":
            origin[0] = "172.17.0.1"
        if len(origin) > 1:
            origin[0] += ":" + origin[1]
        return origin[0]

url = "http://" + _get_origin()