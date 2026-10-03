"""Local ks-buddy preview with a durable SQLite activity record."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, sqlite3, os
ROOT=Path(__file__).resolve().parent
DATA=ROOT.parents[1]/'work'/'ks-buddy.sqlite3'
DATA.parent.mkdir(parents=True,exist_ok=True)
with sqlite3.connect(DATA) as db: db.execute('CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, payload TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT/'dist'),**kwargs)
 def reply(self,status,payload):
  raw=json.dumps(payload).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
 def do_GET(self):
  if self.path=='/api/records':
   with sqlite3.connect(DATA) as db: rows=db.execute('SELECT payload FROM records ORDER BY created_at DESC, rowid DESC').fetchall()
   self.reply(200,[json.loads(r[0]) for r in rows])
  else:super().do_GET()
 def do_POST(self):
  if self.path!='/api/records':return self.reply(404,{'error':'Unknown endpoint'})
  try:
   size=int(self.headers.get('Content-Length','0'))
   if size<=0 or size>1000000:raise ValueError('Invalid size')
   item=json.loads(self.rfile.read(size));required=['id','work','learn','date','hours','codes','files','title','project']
   if not all(k in item for k in required) or not isinstance(item['work'],str) or not item['work'].strip():raise ValueError('Missing activity fields')
   if not isinstance(item['hours'],(int,float)) or not 0<=item['hours']<=24:raise ValueError('Invalid hours')
   if not isinstance(item['codes'],list) or not set(item['codes'])<=set(['K1','K2','K3','K4','S1','S3','S6','S8','B1','B2']):raise ValueError('Invalid codes')
   with sqlite3.connect(DATA) as db:db.execute('INSERT OR IGNORE INTO records(id,payload) VALUES(?,?)',(item['id'],json.dumps(item)))
   self.reply(201,{'saved':True})
  except (ValueError,KeyError,TypeError,json.JSONDecodeError) as e:self.reply(400,{'error':str(e)})
  except Exception:self.reply(503,{'error':'Could not save activity'})
if __name__=='__main__':
 print('ks-buddy ready at http://127.0.0.1:4173',flush=True)
 ThreadingHTTPServer(('127.0.0.1',4173),Handler).serve_forever()
