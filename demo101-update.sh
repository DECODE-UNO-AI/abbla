echo "Executando script demo101-update.sh"

pm2 stop all

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

pm2 restart plincred-backend

echo "Processo plincred-backend reiniciado com sucesso"

pm2 restart plincred-frontend

echo "Processo plincred-frontend reiniciado com sucesso"

pm2 restart qwer-backend

echo "Processo qwer-backend reiniciado com sucesso"

pm2 restart qwer-frontend

echo "Processo qwer-frontend reiniciado com sucesso"

pm2 restart rtyu-backend

echo "Processo rtyu-backend reiniciado com sucesso"

pm2 restart rtyu-frontend

echo "Processo rtyu-frontend reiniciado com sucesso"

pm2 restart wert-backend

echo "Processo wert-backend reiniciado com sucesso"

pm2 restart wert-frontend

echo "Processo wert-frontend reiniciado com sucesso"