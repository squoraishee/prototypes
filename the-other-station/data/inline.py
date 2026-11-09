"""Embed station.json in index.html between the DATA markers."""
import json, pathlib, re
here = pathlib.Path(__file__).parent
data = json.loads((here / "station.json").read_text())
block = '<!--DATA--><script type="application/json" id="station-data">' + json.dumps(data, separators=(",", ":")) + "</script><!--/DATA-->"
page = here.parent / "index.html"
html = re.sub(r"<!--DATA-->.*?<!--/DATA-->", lambda m: block, page.read_text(), flags=re.S)
page.write_text(html)
print("inlined", len(block), "bytes")
