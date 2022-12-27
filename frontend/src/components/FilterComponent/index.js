import React, { useEffect, useState, useReducer } from "react";

import { 
  Button,
  makeStyles,
  Paper,
  InputLabel,
} from "@material-ui/core";

import {
    Tune,
    CloseSharp,
} from "@material-ui/icons";
import { DatePicker, Space, Divider, Select } from 'antd';
import { TagsFilter } from "../TagsFilter";

import api from "../../services/api";

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
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15
  },
  closeIcon: {
    cursor: "pointer",
    position: "absolute",
    zIndex: 3,
    right: 15,
    top: 15
  },
  buttonsContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20
  }
}));

const reducer = (state, action) => {
    if(action.type === "CHANGE_DATE") {
        const date = action.payload
        state.date = date
        return {...state}
    }
    if(action.type === "CHANGE_SETOR") {
        const queues = action.payload
        state.queue = queues
        return {...state}
    }
    if(action.type === "CHANGE_ATENDENTE") {
        const atendentes = action.payload
        state.atendente = atendentes
        return {...state}
    }
    if(action.type === "CHANGE_CONNECTION") {
        const cons = action.payload
        state.connection = cons
        return {...state}
    }
    if(action.type === "CHANGE_TAGS") {
        const tags = action.payload
        const tagsId = tags.map(tag => tag.id)
        state.tag = tagsId
        return {...state}
    }
    if(action.type === "RESET_FILTERS") {
        const state = {}
        return state
    }
}

const { RangePicker } = DatePicker;

const FilterComponent = ({ user, onSubmit }) => {
    const classes = useStyles()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [setores, setSetores] = useState([])
    const [atendentes, setAtendentes] = useState([])
    const [connections, setConnections] = useState([])
    const [selectedsTags, setSelectedsTags] = useState([]);
    const [numberOfFilters, setNumberOfFilters] = useState(0)

    const [filters, dispatch] = useReducer(reducer, {});

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

    useEffect(() => {
        let count = 0
        // eslint-disable-next-line array-callback-return
        Object.values(filters).map((value) => {
            if(value && value.length > 0){
                count+=1
            }
        })
        setNumberOfFilters(count)
    }, [filters])

    const handleOnDateChange = (e) => {
        setNumberOfFilters(e => e++);
        dispatch({ type: "CHANGE_DATE", payload: e });
    }

    const handleOnSetorChange = (e) => {
        dispatch({ type: "CHANGE_SETOR", payload: e });
    }

    const handleOnAtendenteChange = (e) => {
        dispatch({ type: "CHANGE_ATENDENTE", payload: e });
    }
    
    const handleOnConnectionChange = (e) => {
        dispatch({ type: "CHANGE_CONNECTION", payload: e });
    }

    const handleOnTagsChange = (e) => {
        dispatch({ type: "CHANGE_TAGS", payload: e });
    }

    const handleOnResetFilters = () =>{
        setSelectedsTags([])
        dispatch({ type: "RESET_FILTERS" })
        onSubmit([])
    }

    const handleOnSubmit = () => {
        onSubmit(filters)
        setIsModalOpen(false)
    }

    return (
      <>
      <Paper className={classes.container}> 
            <Tune onClick={() => setIsModalOpen(true)} className={classes.icon}/>
            {   numberOfFilters > 0 ?
                <div 
                    style={{ position: "absolute", top: 4, right: 4, borderRadius: 9999, 
                    padding: 2, backgroundColor: "#F50057", color: "#FFF", width: 17, height: 17,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: "bold"
                    }}>
                    {numberOfFilters}
                </div> :
                ""
            }
          {isModalOpen ? 
            <Paper style={{position: "absolute", zIndex: 2, top: 0, right: 0, width: "100%", minHeight: 300}}>
                <CloseSharp className={classes.closeIcon} onClick={() => setIsModalOpen(false)}/>
                <div className={classes.modalTitle}>
                    <Tune style={{ display: "flex", alignItems: "center", marginRight: 4, fontSize: 25 }}/>
					<h1> Filtros</h1>
				</div>
                <Divider style={{ marginTop: -20 }} />
                <div className={classes.filterOption}>
                    <InputLabel style={{ marginBottom: 4 }}>Data</InputLabel>
                    <Space direction="vertical" style={{ width: "100%"}}>
                        <RangePicker
                            placeholder={["Data inicial", "Data final"]}
                            onChange={handleOnDateChange}
                            value={filters.date}
                            style={{ width: "100%"}}
                            size="large"
                            showTime={{ format: 'HH:mm' }}
                            format="DD-MM-YYYY HH:mm"
                        />
                    </Space>
                </div>
                    <Divider style={{ padding: 0, marginBottom: 0 }}/>
                <div className={classes.filterOption}>
                    <InputLabel style={{ marginBottom: 4 }}>Setor</InputLabel>
                    <Select
                        optionFilterProp="label"
                        onChange={handleOnSetorChange}
                        value={filters.queue}
                        mode="multiple"
                        allowClear
                        size="large"
                        style={{ width: '100%' }}
                        placeholder="Setores"
                        options={setores}
                    />
                </div>
                    <Divider style={{ padding: 0, marginBottom: 0 }}/>
                <div className={classes.filterOption}>
                    <InputLabel style={{ marginBottom: 4 }}>Atendente</InputLabel>
                    <Select
                        optionFilterProp="label"
                        onChange={handleOnAtendenteChange}
                        value={filters.atendente}
                        mode="multiple"
                        size="large"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Atendentes"
                        options={atendentes}
                    />
                </div>
                    <Divider style={{ padding: 0, marginBottom: 0 }}/>
                <div className={classes.filterOption}>
                    <InputLabel style={{ marginBottom: 4 }}>Conexão</InputLabel>
                    <Select
                        optionFilterProp="label"
                        onChange={handleOnConnectionChange}
                        value={filters.connection}
                        mode="multiple"
                        size="large"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Conexão"
                        options={connections}
                    />
                </div>
                    <Divider style={{ padding: 0, marginBottom: 0 }} />
                <div className={classes.filterOption}>
                    <InputLabel style={{ marginBottom: 4 }}>Tags</InputLabel>
                    <TagsFilter style={{ padding: 0}} onFiltered={handleOnTagsChange} selecteds={selectedsTags} setSelecteds={setSelectedsTags}/>
                </div>
                    <Divider style={{ padding: 0, marginBottom: 0 }} />
                <div className={classes.filterOption}>
                    <div className={classes.buttonsContainer}>
                        <Button
					        className={classes.buttonColorError}
                            color= "default"
					        variant="outlined"
                            onClick={handleOnResetFilters}
				        >
					    limpar filtros
				        </Button>
                        <Button
					        className={classes.buttonColorError}
                            color= "primary"
					        variant="contained"
                            onClick={handleOnSubmit}
				        >
					    filtrar
				        </Button>
                    </div>
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