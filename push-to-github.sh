#!/bin/bash
# Script para automatizar la inicialización de Git y la subida del proyecto a GitHub

# Detener el script si ocurre algún error
set -e

echo "===================================================="
echo "🚀 Automatización de Git: Subir a GitHub"
echo "===================================================="

# 1. Inicializar Git si no existe
if [ ! -d .git ]; then
  echo "📦 Inicializando repositorio Git local..."
  git init
else
  echo "✓ Repositorio Git ya inicializado localmente."
fi

# 2. Agregar archivos
echo "🗂️ Añadiendo archivos al área de preparación (staging)..."
git add .

# 3. Crear Commit
echo "💾 Creando commit inicial..."
# Permitimos continuar si no hay cambios nuevos para subir
git commit -m "feat: initial release polla mundialista 2026 with firebase and netlify redirects" || echo "✓ No hay cambios nuevos para commitear."

# 4. Cambiar nombre de la rama a 'main'
echo "🌿 Configurando rama predeterminada a 'main'..."
git branch -M main

# 5. Solicitar URL remota al usuario
echo ""
echo "🔔 VINCULACIÓN CON REPOSITORIO REMOTO"
echo "Por favor, introduce la URL HTTPS de tu repositorio de GitHub."
echo "Ejemplo: https://github.com/tu-usuario/tu-repositorio.git"
echo "----------------------------------------------------"
read -p "➔ URL del Repositorio Remoto: " REPO_URL
echo ""

if [ -z "$REPO_URL" ]; then
  echo "⚠️ No se ingresó ninguna URL. Puedes terminar el enlace manualmente con:"
  echo "   git remote add origin <TU_URL_DE_GITHUB>"
  echo "   git push -u origin main"
  exit 0
fi

# 6. Añadir origen remoto y realizar push
echo "🔗 Vinculando repositorio remoto..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "📤 Subiendo código a GitHub (rama main)..."
echo "Nota: Si se te solicita, ingresa tus credenciales de GitHub (o Personal Access Token)."
git push -u origin main

echo ""
echo "🎉 ¡Operación completada! Tu repositorio local ya está sincronizado con GitHub."
