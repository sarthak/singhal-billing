import flask
from flask import Flask

from .billing import billing_bp
from .inventory import inventory_bp

def create_app():
    app = Flask(__name__)

    app.register_blueprint(billing_bp, url_prefix='/billing')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')

    @app.route('/')
    def billing():
        return flask.redirect('/billing')

    @app.errorhandler(404)
    def error(e):
        return "OOPS!"

    return app
