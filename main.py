# Designed by Mingchen Feng.

from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
# from bson.json_util import dumps


app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'Student'
COLLECTION_NAME = 'test'
FIELDS = {'性别': True, '总分': True, '等级': True, '身高': True, '体重': True, '肺活量': True, '短跑': True,
          '立定跳远': True, '坐立体前屈': True, '长跑': True, '其他': True,
          '左眼视力': True, '右眼视力': True, '院系': True, '专业': True, '学院专业': True, 'BMI': True, '_id': False}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/Student/test")
def student_test_projects():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    # print(connection.list_database_names())
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS, limit=10000)
    # projects = collection.find(projection=FIELDS)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=False)
