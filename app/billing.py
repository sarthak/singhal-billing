import flask

billing_bp = flask.Blueprint('billing', __name__)


@billing_bp.route('/')
def hello():
    return flask.render_template('index.html',
            css=flask.url_for('static', filename='css'),
            js=flask.url_for('static', filename='js'))
