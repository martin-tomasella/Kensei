#!/bin/bash
PROJECT=${1:-kensei}
JOB_FILE=$(ls -t /home/agentes/projects/$PROJECT/outputs/*.json 2>/dev/null | head -1)
if [ -z "$JOB_FILE" ]; then echo "No hay outputs para $PROJECT"; exit 1; fi
echo "Aplicando: $JOB_FILE"
python3 - << PYEOF
import json, re, os

with open('$JOB_FILE') as f:
    d = json.load(f)

total = 0
for r in d.get('resultados', []):
    codigo = r.get('codigo', '')
    # Buscar patron ARCHIVO:/ruta ... FIN_ARCHIVO
    matches = re.findall(r'ARCHIVO:(/home/agentes/[^\n]+)\n(.*?)FIN_ARCHIVO', codigo, re.DOTALL)
    for filepath, content in matches:
        filepath = filepath.strip()
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            f.write(content.strip())
        print(f'✅ {filepath}')
        total += 1

if total == 0:
    print('⚠️  No se encontraron archivos para aplicar')
else:
    print(f'Total: {total} archivos aplicados')
PYEOF
