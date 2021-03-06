import flask
from flask import Flask

from .billing import billing_bp
from .inventory import inventory_bp
from .bills import bills_bp
from .manage import manage_bp

def create_app():
    app = Flask(__name__)

    app.register_blueprint(billing_bp, url_prefix='/billing')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')
    app.register_blueprint(bills_bp, url_prefix='/bills')
    app.register_blueprint(manage_bp, url_prefix='/manage')

    @app.route('/')
    def billing():
        return flask.redirect('/billing')

    @app.errorhandler(404)
    def error(e):
        return {
            'errormsg': 'Not Found'
        }, 404

    return app
