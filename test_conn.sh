#!/bin/bash

# Configuración
SERVER_IP="3.130.97.174"
SERVER_USER="ubuntu"
KEY_PATH="./pagotic.pem"  # Ajusta el nombre de tu archivo .pem

echo "🔍 Probando conexión SSH a AWS..."

# Verificar que existe la clave
if [ ! -f "${KEY_PATH}" ]; then
    echo "❌ Error: No se encontró ${KEY_PATH}"
    echo "💡 Asegúrate de que tu archivo .pem esté en esta carpeta"
    ls -la *.pem 2>/dev/null || echo "No hay archivos .pem en esta carpeta"
    exit 1
fi

# Verificar permisos de la clave
echo "🔐 Verificando permisos de la clave..."
chmod 400 "${KEY_PATH}"
echo "✅ Permisos configurados"

# Prueba 1: Ping básico
echo "🏓 Probando conectividad básica..."
ping -c 3 ${SERVER_IP}

# Prueba 2: SSH con aceptación automática de host key
echo "🔑 Probando conexión SSH..."
echo "⚠️  Vamos a aceptar automáticamente la huella del servidor"

ssh -i "${KEY_PATH}" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    "${SERVER_USER}@${SERVER_IP}" \
    "echo '✅ Conexión SSH exitosa!' && whoami && pwd && date"

if [ $? -eq 0 ]; then
    echo "✅ ¡Conexión SSH funcionando correctamente!"
    
    # Prueba 3: Test de transferencia de archivo
    echo "📁 Probando transferencia de archivo..."
    echo "Archivo de prueba desde $(date)" > test-file.txt
    
    scp -i "${KEY_PATH}" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        test-file.txt "${SERVER_USER}@${SERVER_IP}:/home/ubuntu/"
    
    if [ $? -eq 0 ]; then
        echo "✅ ¡Transferencia de archivo exitosa!"
        
        # Verificar el archivo en el servidor
        ssh -i "${KEY_PATH}" \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            "${SERVER_USER}@${SERVER_IP}" \
            "ls -la /home/ubuntu/test-file.txt && cat /home/ubuntu/test-file.txt && rm /home/ubuntu/test-file.txt"
    else
        echo "❌ Error en transferencia de archivo"
    fi
    
    # Limpiar archivo local
    rm -f test-file.txt
    
else
    echo "❌ Error en conexión SSH"
    echo "💡 Posibles soluciones:"
    echo "   1. Verifica que tu archivo .pem sea correcto"
    echo "   2. Verifica que la IP del servidor sea correcta: ${SERVER_IP}"
    echo "   3. Verifica que el usuario sea correcto: ${SERVER_USER}"
    echo "   4. Verifica que tu instancia EC2 esté ejecutándose"
fi