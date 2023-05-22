echo "Executando script demo101-update.sh"

pm2 stop demo101-backend demo101-frontend

cd abbla

echo "Iniciando atualização na instancia da demo101"

cd demo101

echo "Diretório atual: $(pwd)"

./UPDATE.sh

echo "UPDATE.sh executado com sucesso"

cd ..

echo "Diretório atual: $(pwd)"

pm2 restart demo101-backend

echo "Processo demo101-backend reiniciado com sucesso"

pm2 restart demo101-frontend

echo "Processo demo101-frontend reiniciado com sucesso"
