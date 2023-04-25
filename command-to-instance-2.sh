echo "Executando script command-to-instance-2.sh"

pm2 stop all

cd abbla

echo "Iniciando atualização na instancia da Plincred"

cd plincred

echo "Diretório atual: $(pwd)"

./UPDATE.sh

echo "UPDATE.sh executado com sucesso"

cd ..

echo "Iniciando atualização na instancia da qwer"

cd qwer

echo "Diretório atual: $(pwd)"

./UPDATE.sh

echo "UPDATE.sh executado com sucesso"

cd ..

echo "Iniciando atualização na instancia da rtyu"

cd rtyu

echo "Diretório atual: $(pwd)"

./UPDATE.sh

echo "UPDATE.sh executado com sucesso"

cd ..

echo "Iniciando atualização na instancia da wert"

cd wert

echo "Diretório atual: $(pwd)"

./UPDATE.sh

echo "UPDATE.sh executado com sucesso"

cd ..

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

pm2 restart demo101-backend

echo "Processo demo101-backend reiniciado com sucesso"

pm2 restart demo101-frontend

echo "Processo demo101-frontend reiniciado com sucesso"

pm2 restart baileys-api

echo "Processo baileys-api reiniciado com sucesso"





