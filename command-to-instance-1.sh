echo "Executando script command-to-instance-1.sh"

echo "Iniciando atualização na instancia da 4th"

cd 4thd-abbla

echo "Diretório atual: $(pwd)"

./UPDATE.sh

echo "UPDATE.sh executado com sucesso"

cd ..

echo "Diretório atual: $(pwd)"

pm2 restart 4thd-backend

echo "Processo 4thd-backend reiniciado com sucesso"

pm2 restart 4thd-frontend

echo "Processo 4thd-frontend reiniciado com sucesso"

echo "Iniciando atualização na instancia da Gemeos"

cd Gemeos

echo "Diretório atual: $(pwd)"

./UPDATE.sh

echo "UPDATE.sh executado com sucesso"

cd ..

echo "Diretório atual: $(pwd)"

pm2 restart Gemeos-backend

echo "Processo Gemeos-backend reiniciado com sucesso"

pm2 restart Gemeos-frontend

echo "Processo Gemeos-frontend reiniciado com sucesso"