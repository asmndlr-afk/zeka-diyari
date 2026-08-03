import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("Zeka Diyarı'ndaki", "MİNİKİO'daki")
    new_content = new_content.replace("Zeka Diyarı'nı", "MİNİKİO'yu")
    new_content = new_content.replace("Zeka Diyarı'na", "MİNİKİO'ya")
    new_content = new_content.replace("Zeka Diyarı", "MİNİKİO")
    new_content = new_content.replace("zeka_diyari", "minikio")
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

for ext in ('*.html', '*.js', '*.json', '*.css'):
    for filepath in glob.glob(f'**/{ext}', recursive=True):
        if 'node_modules' not in filepath:
            replace_in_file(filepath)
