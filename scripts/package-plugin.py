"""Create a deterministic ZIP with plugin.json at the archive root."""
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'package.json').read_text())['version']
out = root / 'dist' / f'coderabbit-antigravity-{version}.zip'
out.parent.mkdir(exist_ok=True)
files = [root / name for name in ('plugin.json', 'README.md', 'LICENSE', 'CONTRIBUTING.md', 'SECURITY.md')]
for folder in ('skills', 'agents', 'rules', 'docs'):
    files.extend(p for p in (root / folder).rglob('*') if p.is_file())
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(files):
        if path.is_symlink():
            raise ValueError(f'Refusing symlink: {path}')
        info = zipfile.ZipInfo(path.relative_to(root).as_posix(), (2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, path.read_bytes())
print(out)
