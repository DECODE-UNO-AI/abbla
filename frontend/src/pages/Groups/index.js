import React, { useEffect, useState } from "react";
import MainHeader from "../../components/MainHeader";
import {
  Avatar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  makeStyles,
} from "@material-ui/core";
import Title from "../../components/Title";

import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import { RecentActors } from "@material-ui/icons";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  csvbtn: {
    textDecoration: "none",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "25%",
  },
}));

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const getGroups = async () => {
      try {
        setLoading(true);
        const { data } = await api.post("/groups/getGroups");

        console.log(data);
        setGroups(data.groups);
      } catch (error) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    };
    getGroups();
  }, []);

  const getGroupParticipants = async ({ groupName, groupId, whatsappId }) => {
    try {
      const { data } = await api.post("/groups/participants", {
        groupId: `${groupId}`,
        whatsappId,
      });

      const { participants } = data;

      if (participants.length > 0) {
        const csvString = participants
          ?.map((row) => Object.values(row).join(","))
          ?.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = `${groupName}-contacts.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("groupTextField.groups")}</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>{i18n.t("groupTextField.groupName")}</TableCell>
              <TableCell align="center">
                {i18n.t("groupTextField.groupId")}
              </TableCell>
              <TableCell padding="checkbox" />
              <TableCell align="center">
                {i18n.t("contacts.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell style={{ paddingRight: 0 }}>
                    {
                      <Avatar
                        src={group.profilePicUrl}
                        className={classes.avatar}
                      />
                    }
                  </TableCell>
                  <TableCell>{group.name}</TableCell>
                  <TableCell align="center">{group.number}</TableCell>
                  <TableCell align="center">{group.email}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() =>
                        getGroupParticipants({
                          groupName: group.name,
                          groupId: group.number,
                          whatsappId:
                            group.tickets?.[group.tickets.length - 1]
                              ?.whatsappId,
                        })
                      }
                    >
                      <RecentActors color="secondary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Groups;
