import http.server, socketserver, sys, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.endswith('.html') or self.path == '/':
            self.send_header('Content-Type', 'text/html; charset=utf-8')
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 5501
with socketserver.TCPServer(("", port), UTF8Handler) as httpd:
    httpd.serve_forever()
