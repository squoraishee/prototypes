"""Build data/strikes.json from the FAA Wildlife Strike Database and OurAirports.

The FAA publishes the database as an Access file. Export.java reads it with Jackcess, because the Python
Access readers drop its text columns. Downloads and the CSV export are cached in data/raw/.
Needs Java, pandas and numpy.
"""
import json, subprocess, urllib.request, zipfile
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).parent
RAW = HERE / "raw"
RAW.mkdir(exist_ok=True)
FAA = "https://wildlife.faa.gov/assets/database.zip"
AIRPORTS = "https://davidmegginson.github.io/ourairports-data/airports.csv"
JARS = ["com/healthmarketscience/jackcess/jackcess/4.0.5/jackcess-4.0.5.jar",
        "org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.jar",
        "commons-logging/commons-logging/1.3.0/commons-logging-1.3.0.jar"]


def fetch(url, path):
    if not path.exists():
        print("download", url)
        urllib.request.urlretrieve(url, path)
    return path


def export_csv():
    csv = RAW / "strikes.csv"
    if csv.exists():
        return csv
    z = fetch(FAA, RAW / "database.zip")
    with zipfile.ZipFile(z) as f:
        f.extract("Public.accdb", RAW)
    jars = RAW / "jars"
    jars.mkdir(exist_ok=True)
    for j in JARS:
        fetch("https://repo1.maven.org/maven2/" + j, jars / Path(j).name)
    cp = f"{jars}/*"
    subprocess.run(["javac", "-cp", cp, "-d", RAW, HERE / "Export.java"], check=True)
    subprocess.run(["java", "-cp", f"{cp}:{RAW}", "Export", RAW / "Public.accdb", csv], check=True)
    return csv


DAMAGE = ["M", "M?", "S", "D"]
# Species tracked on the trend page. Names are the database's own.
TREND = ["Bald eagle", "Osprey", "Black vulture", "Turkey vulture", "Canada goose", "Gulls", "White-tailed deer"]

df = pd.read_csv(export_csv(), low_memory=False)
df["date"] = pd.to_datetime(df.INCIDENT_DATE, errors="coerce")
df["dmg"] = df.DAMAGE_LEVEL.isin(DAMAGE)
df["height"] = pd.to_numeric(df.HEIGHT, errors="coerce")
last = df.date.max()
full = df[df.INCIDENT_YEAR.between(1990, 2025)]
out = {"last": last.strftime("%Y-%m-%d"), "updated": str(df.LUPDATE.max())[:10]}

# Strikes and damaging strikes each year.
yr = full.groupby("INCIDENT_YEAR").agg(n=("dmg", "size"), d=("dmg", "sum"))
out["years"] = [[int(y), int(r.n), int(r.d)] for y, r in yr.iterrows()]

# This year against last, through the last month that is mostly entered. Reports arrive weeks to months late.
m26 = df[df.date.dt.year == 2026].groupby(df.date.dt.month).size()
ytd_month = int(max(m for m, v in m26.items() if v > 500))
same = lambda y: int(((df.date.dt.year == y) & (df.date.dt.month <= ytd_month)).sum())
out["ytd"] = {"month": ytd_month, "y2025": same(2025), "y2026": same(2026)}

# Damage by bird size in 2025.
y25 = df[df.INCIDENT_YEAR == 2025]
sz = y25.groupby("SIZE").agg(n=("dmg", "size"), d=("dmg", "sum"))
out["size2025"] = {k: [int(r.n), int(r.d)] for k, r in sz.iterrows()}
out["n2025"] = int(len(y25))
out["d2025"] = int(y25.dmg.sum())
out["effects2025"] = {k: int(v) for k, v in y25.EFFECT.value_counts().items() if k in
                      ("Precautionary Landing", "Aborted Take-off", "Engine Shutdown")}

# Cover map: every 2025 strike at an airport that OurAirports can place.
ap = pd.read_csv(fetch(AIRPORTS, RAW / "airports.csv"), low_memory=False)
ap = ap.dropna(subset=["latitude_deg", "longitude_deg"])
coords = {}
for col in ["ident", "gps_code", "icao_code"]:
    for k, la, lo in zip(ap[col], ap.latitude_deg, ap.longitude_deg):
        if isinstance(k, str) and k not in coords:
            coords[k] = (round(lo, 3), round(la, 3))
c = y25[y25.AIRPORT_ID.isin(coords.keys()) & y25.date.notna()]
ids = sorted(c.AIRPORT_ID.unique())
idx = {a: i for i, a in enumerate(ids)}
names = c.groupby("AIRPORT_ID").AIRPORT.first()
size_code = {"Small": 0, "Medium": 1, "Large": 2}
out["airports"] = [[*coords[a], names[a].title()] for a in ids]
out["strikes"] = [[idx[a], int(d.dayofyear) - 1, size_code.get(s, 3), int(g)]
                  for a, d, s, g in zip(c.AIRPORT_ID, c.date, c.SIZE, c.dmg)]
out["mapped2025"] = len(out["strikes"])

# Species, 2015 to 2025: how often each is struck and how often a strike damages the aircraft.
recent = df[df.INCIDENT_YEAR.between(2015, 2025)]
named = recent[~recent.SPECIES.str.startswith("Unknown", na=True)]
g = named.groupby("SPECIES").agg(n=("dmg", "size"), d=("dmg", "sum"),
                                 size=("SIZE", lambda s: s.mode().iat[0] if s.notna().any() else ""),
                                 cost=("COST_REPAIRS_INFL_ADJ", "sum"))
g = g[g.n >= 60]
out["species"] = [[k, int(r.n), int(r.d), r["size"], int(r.cost)] for k, r in g.sort_values("n", ascending=False).iterrows()]

# Trend: strikes of each species per 10,000 reported strikes, so the rise in reporting cancels out.
tot = full.groupby("INCIDENT_YEAR").size()
tr = {}
for s in TREND:
    n = full[full.SPECIES == s].groupby("INCIDENT_YEAR").size().reindex(tot.index, fill_value=0)
    tr[s] = {"n": [int(v) for v in n], "per10k": [round(v, 1) for v in (n / tot * 1e4)]}
out["trend"] = tr
five = lambda s, a, b: int(full[(full.SPECIES == s) & full.INCIDENT_YEAR.between(a, b)].shape[0])
out["fives"] = {s: [five(s, 1990, 1994), five(s, 2020, 2024)] for s in TREND}
out["fivesTotal"] = [int(tot.loc[1990:1994].sum()), int(tot.loc[2020:2024].sum())]

# Black vultures by state in three periods. "FN" is a foreign airport and is left out.
bv = df[(df.SPECIES == "Black vulture") & (df.STATE.str.len() == 2) & (df.STATE != "FN")]
out["vultureStates"] = {f"{a}-{b}": {k: int(v) for k, v in bv[bv.INCIDENT_YEAR.between(a, b)].STATE.value_counts().items()}
                        for a, b in [(1990, 2004), (2005, 2014), (2015, 2025)]}

# Height above ground, 2015 to 2025, with the damage rate in each band.
bands = [0, 1, 101, 501, 1001, 3501, 10001, 60000]
h = recent.dropna(subset=["height"])
cut = pd.cut(h.height, bands, right=False)
hb = h.groupby(cut).agg(n=("dmg", "size"), d=("dmg", "sum"))
out["heights"] = [[int(b.left), int(b.right) - 1, int(r.n), int(r.d)] for b, r in hb.iterrows()]
out["heightKnown"] = int(len(h))
out["heightTotal"] = int(len(recent))

# Month of the year in 2025.
out["months2025"] = [int(v) for v in y25.groupby(y25.date.dt.month).size().reindex(range(1, 13), fill_value=0)]
out["night2025"] = {k: int(v) for k, v in y25.TIME_OF_DAY.value_counts().items()}

(HERE / "strikes.json").write_text(json.dumps(out, separators=(",", ":")))
print("wrote strikes.json", (HERE / "strikes.json").stat().st_size // 1024, "KB; last", out["last"], "ytd", out["ytd"])
