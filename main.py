import flask
from flask import Flask

app = Flask(__name__)


@app.route('/')
@app.route('/billing')
def main():
    return flask.render_template('index.html',
                css=flask.url_for('static', filename='css'),
                js=flask.url_for('static', filename='js'))
