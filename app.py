import time
import redis

from flask import Flask, request

app = Flask(__name__, static_url_path='', static_folder='files')
cache = redis.Redis(host='redis', port=6379)


def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.execptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)


@app.route('/')
def hello():
    count = get_hit_count()
    return 'Hello World! I have been seen {} times.\n'.format(count)


@app.route('/color/')
def color():
    return '<!DOCTYPE html>\n<html>\n<head>\n<title>HTML Backgorund Color</title>\n</head>\n<body style="background-color:red;">\n</body>\n</html>'


@app.route('/cookie/')
def index():
    resp = app.make_response('Now with cookies!')
    resp.set_cookie('hello', 'world')
    return resp


@app.route('/third/')
def send():
    return app.send_static_file('third.html')
