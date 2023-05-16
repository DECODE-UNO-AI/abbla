import React from "react";
import {
  TableBody,
  TableRow,
  TableCell,
  Table,
  TableHead,
  IconButton,
} from "@material-ui/core";
import { Edit, CancelOutlined } from "@material-ui/icons";
import TableRowSkeleton from "../TableRowSkeleton";
import { i18n } from "../../translate/i18n";

const MacroTable = ({
  macros,
  loading,
  handleEditMacro,
  handleDeleteMacro,
}) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="left">ID</TableCell>
          <TableCell align="left">{i18n.t("macros.table.name")}</TableCell>
          <TableCell align="left">{i18n.t("macros.table.shortcut")}</TableCell>
          <TableCell align="left">{i18n.t("macros.table.createdAt")}</TableCell>
          <TableCell align="left">{i18n.t("macros.buttons.action")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <>
          {macros?.map((macro) => (
            <TableRow key={macro.id}>
              <TableCell align="left">{macro.id}</TableCell>
              <TableCell align="left">{macro.name}</TableCell>
              <TableCell align="left">{macro.shortcut}</TableCell>
              <TableCell align="left">
                {new Date(macro.createdAt).toLocaleString()}
              </TableCell>
              <TableCell align="left">
                <IconButton
                  size="small"
                  onClick={() => {
                    handleEditMacro(macro);
                  }}
                >
                  <Edit color="secondary" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    handleDeleteMacro(macro.id);
                  }}
                >
                  <CancelOutlined color="secondary" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {loading ? <TableRowSkeleton columns={5} /> : null}
        </>
      </TableBody>
    </Table>
  );
};

export default MacroTable;
