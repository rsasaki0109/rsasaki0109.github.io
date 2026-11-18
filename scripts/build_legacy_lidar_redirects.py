"""Generate static compatibility pages for the renamed project documentation."""
import argparse
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def build(root=ROOT):
    config=json.loads((root/'data/lidar-slam-legacy-routes.json').read_text())
    if config['source_prefix']!='lidar_slam_ros2' or config['destination']!='https://rsasaki0109.github.io/lidar_slam/':
        raise ValueError('Unexpected legacy documentation mapping')
    output=root/config['source_prefix']
    for route in config['routes']:
        if route.startswith('/') or '..' in Path(route).parts or not re.fullmatch(r'[A-Za-z0-9_/-]+\.html',route):
            raise ValueError('Invalid documentation route')
        path=output/route
        path.parent.mkdir(parents=True,exist_ok=True)
        target=config['destination']+route
        html=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Documentation moved — lidar_slam</title>
<link rel="canonical" href="{escape(target,quote=True)}">
<script>
const target = new URL({json.dumps(target)});
target.search = window.location.search;
target.hash = window.location.hash;
window.location.replace(target.href);
</script>
<noscript><meta http-equiv="refresh" content="0; url={escape(target,quote=True)}"></noscript>
</head><body><main><h1>The lidar_slam documentation has moved</h1>
<p>The repository was renamed from lidar_slam_ros2 to lidar_slam.</p>
<p><a href="{escape(target,quote=True)}">Open the documentation at its new address</a>.</p>
<p>If automatic navigation is unavailable, use the link above.</p>
</main></body></html>
'''
        path.write_text(html,encoding='utf-8')
    print(f'Generated {len(config["routes"])} legacy documentation routes')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=ROOT)
    build(parser.parse_args().root)
