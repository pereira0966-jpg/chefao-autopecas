"""Generate products.json from _produtos/*.yml files"""
import os, json, yaml, glob

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUTOS_DIR = os.path.join(PROJECT, '_produtos')

products = []
for fpath in sorted(glob.glob(os.path.join(PRODUTOS_DIR, '*.yml'))):
    with open(fpath, 'r', encoding='utf-8') as f:
        p = yaml.safe_load(f)
    if p and 'id' in p:
        products.append(p)

products.sort(key=lambda p: p['id'])

with open(os.path.join(PROJECT, 'products.json'), 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"Generated products.json with {len(products)} products from _produtos/")