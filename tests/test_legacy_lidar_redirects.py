import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('redirect_builder',ROOT/'scripts/build_legacy_lidar_redirects.py')
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)


class RedirectTests(unittest.TestCase):
    def setup_root(self,folder):
        root=Path(folder);(root/'data').mkdir()
        data=json.loads((ROOT/'data/lidar-slam-legacy-routes.json').read_text())
        (root/'data/lidar-slam-legacy-routes.json').write_text(json.dumps(data))
        return root,data

    def test_all_routes_point_to_exact_matching_new_paths(self):
        with tempfile.TemporaryDirectory() as folder:
            root,data=self.setup_root(folder);builder.build(root)
            for route in data['routes']:
                text=(root/'lidar_slam_ros2'/route).read_text()
                self.assertIn('href="'+data['destination']+route+'"',text)
                self.assertIn('window.location.replace(target.href)',text)
                self.assertIn('target.search = window.location.search',text)
                self.assertIn('target.hash = window.location.hash',text)
                self.assertIn('<noscript>',text)
            builder.build(root)

    def test_invalid_destination_or_traversal_is_rejected(self):
        for change in [{'destination':'https://evil.test/'},{'routes':['../outside.html']},{'routes':['/outside.html']}]:
            with tempfile.TemporaryDirectory() as folder:
                root,data=self.setup_root(folder);data.update(change)
                (root/'data/lidar-slam-legacy-routes.json').write_text(json.dumps(data))
                with self.assertRaises(ValueError):builder.build(root)

if __name__=='__main__':unittest.main()
