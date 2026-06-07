#!/bin/bash
PROJECT=${1:-kensei}
JOB_FILE=$(ls -t /home/agentes/projects/$PROJECT/outputs/*.json 2>/dev/null | head -1)
if [ -z "$JOB_FILE" ]; then echo "No hay outputs para $PROJECT"; exit 1; fi
echo "Aplicando: $JOB_FILE"
python3 /home/agentes/apply-job.py "$JOB_FILE"
