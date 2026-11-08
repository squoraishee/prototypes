"""Embed strikes.json and the U.S. basemap in index.html, between the DATA markers."""
import re
from pathlib import Path
here = Path(__file__).parent
page = here.parent / "index.html"
block = ('<!--DATA-->\n'
         f'<script type="application/json" id="strike-data">{(here / "strikes.json").read_text()}</script>\n'
         f'<script type="application/json" id="states-data">{(here / "states-albers.json").read_text()}</script>\n'
         '<!--/DATA-->')
html = re.sub(r"<!--DATA-->.*?<!--/DATA-->", lambda m: block, page.read_text(), count=1, flags=re.S)
page.write_text(html)
print("embedded", page.stat().st_size // 1024, "KB")
