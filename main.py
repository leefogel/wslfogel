import json
import os
import webapp2
from google.appengine.ext import db
from google.appengine.ext.webapp import template

# header constants
contentTypeHeader = "Content-Type";
jsonHeader = "application/json";

# field name constants
taskIdField = "taskid";
taskTextField = "tasktext";

# Task Model class
class Task(db.Model):
  text = db.StringProperty()
  status = db.BooleanProperty(required=True,default=False)
  insert_timestamp = db.DateTimeProperty(required=True,auto_now_add=True)

# internal Task representation
class __task__:
  def __init__(self, id, text, status):
    self.id = id;
    self.text = text;
    self.status = status;
    
# display main page (using index.html template)
class MainHandler(webapp2.RequestHandler):
  def get(self):
    self.response.out.write(template.render("index.html", {}));

# get tasks (i.e. first screen)
class GetHandler(webapp2.RequestHandler):
  def get(self):
    tasks = [];
    for task in Task.gql("ORDER BY insert_timestamp") :
      tasks.append(__task__(str(task.key().id()), task.text, str(task.status).lower()));
    
    # inject tasks into html
    self.response.headers[contentTypeHeader] = jsonHeader;
    self.response.write(json.dumps({ "tasks" : [task.__dict__ for task in tasks]}));

# add task
class AddHandler(webapp2.RequestHandler):
  def post(self):
    taskText = self.request.get(taskTextField);
    taskKey = Task(text=taskText).put();

    self.response.headers[contentTypeHeader] = jsonHeader;
    self.response.write(json.dumps({ taskIdField : str(taskKey.id()) }));

# delete task
class DeleteHandler(webapp2.RequestHandler):
  def post(self):
    taskIdStr = self.request.get(taskIdField);
    Task.get_by_id(long(taskIdStr)).delete();

# mark task complete
class MarkCompleteHandler(webapp2.RequestHandler):
  def post(self):
    taskIdStr = self.request.get(taskIdField);
    task = Task.get_by_id(long(taskIdStr));
    task.status = True;
    task.put();

app = webapp2.WSGIApplication([
  ('/', MainHandler),
  ('/get', GetHandler),
  ('/add', AddHandler),
  ('/del', DeleteHandler),
  ('/upd', MarkCompleteHandler)  
], debug=True)