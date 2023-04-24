echo "Executando script command-to-instance-1.sh"
cd 4thd-abbla
echo "Diretório atual: $(pwd)"
sh UPDATE.sh ${{ secrets.INSTANCE_1_SSH_PASSWORD }}
echo "UPDATE.sh executado com sucesso"
cd ..
echo "Diretório atual: $(pwd)"
pm2 restart 4thd-backend
echo "Processo 4thd-backend reiniciado com sucesso"
pm2 restart 4thd-frontend
echo "Processo 4thd-frontend reiniciado com sucesso"