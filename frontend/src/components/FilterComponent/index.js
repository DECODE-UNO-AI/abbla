import React, { useContext, useEffect, useState } from "react";

import { 
  Badge,
  Button,
  DialogTitle,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Switch,
  InputLabel
} from "@material-ui/core";

import {
    Tune,
    CloseSharp
} from "@material-ui/icons";
import { Cascader } from 'antd'
import { DatePicker, Space, Divider, Select } from 'antd';

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { TagsFilter } from "../TagsFilter";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";

import api from "../../services/api";



import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 5
  },
  modalTitle: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    paddingBottom: 5,
    paddingTop: 2,
    paddingLeft: 20
  },
  icon: {
    cursor: "pointer"
  },
  filterOption: {
    padding: 10
  },
  closeIcon: {
    cursor: "pointer",
    position: "absolute",
    zIndex: 3,
    right: 15,
    top: 15
  }
}));

const { RangePicker } = DatePicker;

const FilterComponent = ({user}) => {
    const classes = useStyles()

    const [isModalOpen, setIsModalOpen] = useState(true)
    const [setores, setSetores] = useState([])
    const [atendentes, setAtendentes] = useState([])
    const [connections, setConnections] = useState([])

    useEffect(() => {
        const queuesChildren =  user?.queues.map((queue) => { return {value: `${queue.id}`, label: queue.name}})
        setSetores(queuesChildren)
    }, [user.queues])

    useEffect( () => {
        api.get("/users/", {}).then((data) => {
            const aten = data.data.users.map((e) => {return { value: e.id, label: e.name}})
            setAtendentes(aten)
        })

        return setAtendentes([])
    }, [])

    useEffect(() => {
        api.get("/whatsapp/").then((data) => {
            const cons = data.data.map((con) => {return { value: con.id, label: con.name}})
            setConnections(cons)
        })
        return setConnections([])
    }, [])

    return (
      <>
      <Paper className={classes.container}>
          <Tune onClick={() => setIsModalOpen(true)} className={classes.icon}/>
          {isModalOpen ? 
            <Paper style={{position: "absolute", zIndex: 2, top: 0, right: 0, minWidth: 500, minHeight: 300}}>
                <CloseSharp className={classes.closeIcon} onClick={() => setIsModalOpen(false)}/>
                <div className={classes.modalTitle}>
                    <Tune style={{ display: "flex", alignItems: "center", marginRight: 4, fontSize: 25 }}/>
					<h1> Filtros</h1>
				</div>
                <Divider style={{ marginTop: -20 }} />
                <div className={classes.filterOption}>
                    <InputLabel>Data</InputLabel>
                    <Space direction="vertical" size={12}>
                        <RangePicker
                            showTime={{ format: 'HH:mm' }}
                            format="DD-MM-YYYY HH:mm"
                        />
                    </Space>
                    <Divider />
                </div>
                <div className={classes.filterOption}>
                    <InputLabel>Setor</InputLabel>
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Setores"
                        options={setores}
                    />
                    <Divider />
                </div>
                <div className={classes.filterOption}>
                    <InputLabel>Atendente</InputLabel>
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Atendentes"
                        options={atendentes}
                    />
                    <Divider />
                </div>
                <div className={classes.filterOption}>
                    <InputLabel>Conexão</InputLabel>
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Conexão"
                        options={connections}
                    />
                    <Divider />
                </div>
            </Paper>
                :
            ""
          }
      </Paper>
      </>
    );
};

export default FilterComponent;