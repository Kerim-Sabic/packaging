"""Standard-library fallback. No Node, pip packages, model, or internet required."""
import functools, http.server, pathlib, sys, webbrowser
root=pathlib.Path(__file__).resolve().parents[1]/'dist'
if not (root/'index.html').exists():
    raise SystemExit('Built app missing. Run scripts/setup.ps1 once online, or use the offline ZIP containing dist/.')
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
handler=functools.partial(QuietHandler,directory=str(root))
try: server=http.server.ThreadingHTTPServer(('127.0.0.1',4173),handler)
except OSError:
    raise SystemExit('Port 4173 is already in use. If PackProof is running, open http://127.0.0.1:4173/#/app; otherwise free the port yourself.')
print('PackProof offline: http://127.0.0.1:4173/#/app | Press Ctrl+C to stop.')
if '--no-browser' not in sys.argv: webbrowser.open('http://127.0.0.1:4173/#/app')
try: server.serve_forever()
except KeyboardInterrupt: server.server_close()
