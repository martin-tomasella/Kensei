#!/usr/bin/env python3
import json, re, os, sys

job_file = sys.argv[1]

with open(job_file) as f:
    d = json.load(f)

total = 0
archivos_escritos = {}

for r in d.get('resultados', []):
    agente = r.get('agente', '')
    if agente not in ['frontend', 'backend']:
        continue
    codigo = r.get('codigo', '')
    pattern = r'ARCHIVO:(/home/agentes/[^\n]+)\n(.*?)FIN_ARCHIVO'
    matches = re.findall(pattern, codigo, re.DOTALL)
    for filepath, content in matches:
        filepath = filepath.strip()
        content = content.strip()
        if len(content) < 50:
            print(f'Ignorando placeholder en {filepath}')
            continue
        placeholders = ['[contenido]', '[CODIGO AQUI]', '[HTML COMPLETO]', '[HTML COMPLETO CON TODO EL CODIGO]']
        if content in placeholders:
            print(f'Ignorando placeholder en {filepath}')
            continue
        if filepath in archivos_escritos:
            print(f'Ya escribimos {filepath}, saltando')
            continue
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'OK {filepath} ({len(content)} bytes)')
        archivos_escritos[filepath] = True
        total += 1

if total == 0:
    print('No se encontraron archivos para aplicar')
else:
    print(f'Total: {total} archivos aplicados')
