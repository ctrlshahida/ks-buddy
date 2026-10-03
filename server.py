"""Local ks-buddy preview with a durable SQLite activity record."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, sqlite3, os
ROOT=Path(__file__).resolve().parent
DATA=ROOT.parents[1]/'work'/'ks-buddy.sqlite3'
DATA.parent.mkdir(parents=True,exist_ok=True)
with sqlite3.connect(DATA) as db:
 db.execute('CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, payload TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
 db.execute('CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, payload TEXT NOT NULL)')
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT/'dist'),**kwargs)
 def reply(self,status,payload):
  raw=json.dumps(payload).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
 def do_GET(self):
  if self.path=='/api/settings':
   with sqlite3.connect(DATA) as db: row=db.execute("SELECT payload FROM settings WHERE id='workspace'").fetchone()
   self.reply(200,json.loads(row[0]) if row else {})
  elif self.path=='/api/records':
   with sqlite3.connect(DATA) as db: rows=db.execute('SELECT payload FROM records ORDER BY created_at DESC, rowid DESC').fetchall()
   self.reply(200,[json.loads(r[0]) for r in rows])
  else:super().do_GET()
 def do_POST(self):
  if self.path not in ['/api/records','/api/settings']:return self.reply(404,{'error':'Unknown endpoint'})
  try:
   size=int(self.headers.get('Content-Length','0'))
   if size<=0 or size>1000000:raise ValueError('Invalid size')
   item=json.loads(self.rfile.read(size))
   if self.path=='/api/settings':
    if not isinstance(item,dict) or not isinstance(item.get('requirements',[]),list) or not isinstance(item.get('targets',[]),list):raise ValueError('Invalid workspace settings')
    ids=set()
    for req in item.get('requirements',[]):
     if not isinstance(req,dict) or not isinstance(req.get('code'),str) or not req['code'] or len(req['code'])>30 or not isinstance(req.get('title'),str) or not req['title'] or req['code'] in ids:raise ValueError('Invalid or duplicate requirement')
     if not isinstance(req.get('target',5),(int,float)) or req.get('target',5)<=0:raise ValueError('Invalid evidence target')
     ids.add(req['code'])
    with sqlite3.connect(DATA) as db:db.execute("INSERT INTO settings(id,payload) VALUES('workspace',?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",(json.dumps(item),))
    return self.reply(200,{'saved':True})
   required=['id','work','learn','date','hours','codes','files','title','project']
   if not all(k in item for k in required) or not isinstance(item['work'],str) or not item['work'].strip():raise ValueError('Missing activity fields')
   if not isinstance(item['hours'],(int,float)) or not 0<=item['hours']<=24:raise ValueError('Invalid hours')
   if not isinstance(item['codes'],list) or any(not isinstance(c,str) or not c or len(c)>30 for c in item['codes']):raise ValueError('Invalid codes')
   with sqlite3.connect(DATA) as db:db.execute('INSERT OR IGNORE INTO records(id,payload) VALUES(?,?)',(item['id'],json.dumps(item)))
   self.reply(201,{'saved':True})
  except (ValueError,KeyError,TypeError,json.JSONDecodeError) as e:self.reply(400,{'error':str(e)})
  except Exception:self.reply(503,{'error':'Could not save activity'})
if __name__=='__main__':
 print('ks-buddy ready at http://127.0.0.1:4173',flush=True)
 ThreadingHTTPServer(('127.0.0.1',int(os.environ.get('KS_BUDDY_PORT','4173'))),Handler).serve_forever()
