import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },

  paper: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },

  settingOption: {
    marginLeft: "auto",
  },

  margin: {
    margin: theme.spacing(1),
  },

  color: {
    color: theme.palette.secondary.main,
  },

  text: {
    marginLeft: "42px",
    color: theme.palette.text.secondary,
  },

  textP: {
    marginLeft: "42px",
    color: theme.palette.text.secondary,
  },
}));

const Api = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container>
        <h2>Documentação para envio de mensagens</h2>

        <h2 className={classes.color}>Métodos de Envio</h2>

        <p className={classes.text}>1. Mensagens de Texto</p>
        <p className={classes.text}>2. Mensagens de Mídia</p>

        <h2 className={classes.color}>Instruções</h2>
        <p>
          <b>Observações Importantes</b>
        </p>
        <ul>
          <li className={classes.text}>
            Para pegar o token da API, vá na ultima opção do menu lateral{" "}
            <strong>apikey</strong> que seu token estará lá, sem ele não será
            possivel enviar mensagens ou criar grupos.
          </li>
          <li className={classes.text}>
            O número para envio não deve ter mascara ou caracteres especiais e
            deve ser composto por:
          </li>
          <br />
          <ol>
            <ul>
              <li className={classes.text}>Código do pais - Ex: 55 (Brasil)</li>
              <li className={classes.text}>DDD</li>
              <li className={classes.text}>Número</li>
            </ul>
          </ol>
        </ul>
        <h2 className={classes.color}>1. Mensagens de Texto</h2>
        <p>
          Seguem abaixo a lista de informações necessárias para envio das
          mensagens de texto:
        </p>
        <p className={classes.textP}>
          <b>URL: </b>
          {process.env.REACT_APP_BACKEND_URL}api/messages/send
        </p>
        <p className={classes.textP}>
          <b>Metódo: </b>POST
        </p>
        <p className={classes.textP}>
          <b>Headers: </b>Authorization: Bearer (token) e Content-Type
          application/json
        </p>
        <p className={classes.textP}>
          <b>Body: </b>"number": "5599999999999", "body": "Enviado via api",
          "whatsappId": 1
        </p>
        <p className={classes.textP}>
          Para ter exito no envio de mensagens via api, uma sessão do whatsapp
          precisa está ativa na aplicação o campo whatsappId se dá pelo id da
          sessão de whatsapp ativa.
        </p>

        <h2 className={classes.color}>2. Mensagens de Mídia</h2>
        <p>
          Seguem abaixo a lista de informações necessárias para envio de midias:
        </p>
        <p className={classes.textP}>
          <b>URL: </b>
          {process.env.REACT_APP_BACKEND_URL}/api/messages/send
        </p>
        <p className={classes.textP}>
          <b>Metódo: </b>POST
        </p>
        <p className={classes.textP}>
          <b>Headers: </b>Authorization: Bearer (token) e Content-Type
          multipart/form-data
        </p>
        <p className={classes.textP}>
          <b>Body: </b>"number": "5599999999999", "medias": "aqui vai sua
          midia", "body": "Enviado via api", "whatsappId": 1
        </p>
        <p className={classes.textP}>
          Para ter exito no envio de mensagens via api, uma sessão do whatsapp
          precisa está ativa na aplicação o campo whatsappId se dá pelo id da
          sessão de whatsapp ativa.
        </p>

        <h2>Documentação para manipulação de grupos</h2>

        <h2 className={classes.color}>Instruções</h2>
        <p>
          <b>Observações Importantes</b>
        </p>
        <ul>
          <li className={classes.text}>
            Para pegar o token da API, vá na ultima opção do menu lateral{" "}
            <strong>apikey</strong> que seu token estará lá, sem ele não será
            possivel enviar mensagens ou criar grupos.
          </li>
        </ul>
        <h2 className={classes.color}>1. Criação de groupos</h2>
        <p>
          Seguem abaixo a lista de informações necessárias para criação de
          groupos:
        </p>
        <p className={classes.textP}>
          <b>URL: </b>
          {process.env.REACT_APP_BACKEND_URL}api/groups/create
        </p>
        <p className={classes.textP}>
          <b>Metódo: </b>POST
        </p>
        <p className={classes.textP}>
          <b>Headers: </b>Authorization: Bearer (token) e Content-Type
          application/json
        </p>
        <p className={classes.textP}>
          <b>Body: </b>{" "}
          {
            '"contacts": [{ name: "nome do contato", number: "numero do contato" }]'
          }
          , "groupName": "nome do grupo", "userId": 1, "whatsappId": 1,
        </p>
        <p className={classes.textP}>
          Para ter exito na criação do grupo via api, uma sessão do whatsapp
          precisa está ativa na aplicação, o campo whatsappId se dá pelo id da
          sessão de whatsapp ativa e o userId se dá pelo id do usuário da sessão
          ativa.
        </p>

        <h2 className={classes.color}>2. Buscar todos os grupos</h2>
        <p>
          Seguem abaixo a lista de informações necessárias para buscar todos os
          groupos:
        </p>
        <p className={classes.textP}>
          <b>URL: </b>
          {process.env.REACT_APP_BACKEND_URL}api/groups/getAll
        </p>
        <p className={classes.textP}>
          <b>Metódo: </b>GET
        </p>
        <p className={classes.textP}>
          <b>Headers: </b>Authorization: Bearer (token) e Content-Type
          application/json
        </p>
        <p className={classes.textP}>
          Para ter exito na busca por todos grupo via api, uma sessão do
          whatsapp precisa está ativa na aplicação.
        </p>

        <h2 className={classes.color}>
          3. Buscar participantes pelo id do groupo
        </h2>
        <p>
          Seguem abaixo a lista de informações necessárias para buscar
          participantes pelo id do groupos:
        </p>
        <p className={classes.textP}>
          <b>URL: </b>
          {process.env.REACT_APP_BACKEND_URL}api/groups/getAllParticipants
        </p>
        <p className={classes.textP}>
          <b>Metódo: </b>POST
        </p>
        <p className={classes.textP}>
          <b>Headers: </b>Authorization: Bearer (token) e Content-Type
          application/json
        </p>
        <p className={classes.textP}>
          <b>Body: </b> , "groupId": "campo number do objeto do grupo",
          "whatsappId": 1,
        </p>
        <p className={classes.textP}>
          Para ter exito na busca por participantes do grupo via api, uma sessão
          do whatsapp precisa está ativa na aplicação, o campo whatsappId se dá
          pelo id da sessão de whatsapp ativa.
        </p>
      </Container>
    </div>
  );
};

export default Api;
