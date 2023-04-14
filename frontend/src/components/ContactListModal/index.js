import React, { useState, useEffect } from "react";


import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	makeStyles,
	TextField,
    InputLabel,
    Paper,
    Avatar,
    IconButton
} from "@material-ui/core";
import { DatePicker, Space } from 'antd'
import { AddCircleOutline } from "@material-ui/icons";

import { green } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { TagsFilter } from "../TagsFilter";

const useStyles = makeStyles(theme => ({
    "@global": {
        ".ant-picker-dropdown": {
          zIndex: "10000 !important",
        },
    },
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	container: {
		width: 500,

        "@media (max-width: 500px)": {
            width: 300,
        }
	},
	btnWrapper: {
		position: "relative",
	},
	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},

	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},

	colorAdorment: {
		width: 20,
		height: 20,
	},
}));


const { RangePicker } = DatePicker;

const ContactListModal = ({ open, onClose }) => {
	const classes = useStyles();

    const [filterOptions, setFilterOptions] = useState({})
    const [name, setName] = useState(null)
    const [contacts, setContacts] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [count, setCount] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        (async () => {
            const {data} = await api.post(`/filtercontacts`, {
                filterOptions,
                pageNumber: 1
            })
            setContacts(data.contacts)
            setCount(data.count)
            setHasMore(data.hasMore)
            setPage(1)
        })()
        
    }, [filterOptions])

    const handleOnLoadMoreContacts = async() => {
        const { data } = await api.post(`/filtercontacts`, {
            filterOptions,
            pageNumber: page+1
        })
        setPage(page+1)
        setContacts(e => [...e, ...data.contacts])
        setHasMore(data.hasMore)
    }

    const handleOnTagsChange = (tags) => {
        setFilterOptions(e => {
            return {...e, tags: tags.map((tag) => tag.id)}
        })
    }

    const handleOnDateChange = (date) => {
        setFilterOptions(e => {
            return {...e, date }
        })
    }

    const handleOnCloseModal = () => {
        setContacts([])
        setCount(0)
        setPage(1)
        setHasMore(false)
        setFilterOptions({})
        onClose()
    }

    const handleOnSubmit = async () => {
        setIsSubmitting(true)
        if (!name) {
            toast.error("O nome deve ser preenchido")
            return setIsSubmitting(false)
        } else if(count <= 0) {
            toast.error("Nenhum contato encontrado")
            return setIsSubmitting(false)
        }
        try {
            await api.post("campaigncontactslist", {
                name,
                filterOptions
            })
            toast.success("Lista criada.")
            handleOnCloseModal()
        } catch (err) {
            toastError(err)
        } finally {
            setIsSubmitting(false)
        }
    }

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleOnCloseModal} scroll="paper">
				<DialogTitle>
					Criar nova lista
				</DialogTitle>
                <DialogContent className={classes.container}>
                    <form style={{ width: "100%" }} onSubmit={(e) => {
                        e.preventDefault()
                        handleOnSubmit()
                    }}>
                        <TextField value={name} id="name" label="Nome" variant="outlined" fullWidth size="small" onChange={e => setName(e.target.value)}/>
                        <div style={{ marginTop: 20 }}>
                            <InputLabel style={{ marginBottom: 4 }}>Tags</InputLabel>
                            <TagsFilter style={{ padding: 0}} onFiltered={() => {}} selecteds={filterOptions.tags} setSelecteds={handleOnTagsChange}/>
                        </div>
                        <div style={{ marginTop: 20 }}>
                            <InputLabel style={{ marginBottom: 4 }}>Data</InputLabel>
                            <Space direction="vertical" style={{ width: "100%"}}>
                                <RangePicker
                                    placeholder={["Data inicial", "Data final"]}
                                    onChange={handleOnDateChange}
                                    value={filterOptions.date}
                                    style={{ width: "100%" }}
                                    size="large"
                                    format="DD-MM-YYYY"
                                    
                                />
                            </Space>
                        </div>
                    </form>
                    <div>
                        <InputLabel style={{ width: "100%", textAlign: "center", marginTop: 20 }}>Total: {count} </InputLabel>
                        <div style={{ height: 400, overflow: "auto" }}>
                            {
                            contacts.map((c) =>
                                <div style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 5 }}>
                                    <Paper variant="outlined" style={{ width: "100%", marginTop: 1, padding: 5, display: "flex", alignItems: "center" }}>
                                        <Avatar src={c.profilePicUrl} style={{ width: "50px", height: "50px",borderRadius:"25%"}} />
                                        <div style={{ marginLeft: 25 }}>
                                            <p style={{ fontWeight: "bold" }}>{c.name}</p>
                                            <p>{c.number}</p>
                                        </div>
                                    </Paper>
                                </div>
                            )
                            }
                            {
                                hasMore ? (
                                    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                                        <IconButton
                                        size="medium"
                                        onClick={() => {
                                            handleOnLoadMoreContacts()
                                        }}
                                        >
                                            <AddCircleOutline color="primary" />
                                        </IconButton>
                                    </div>
                                    
                                ) : ""
                            }
                        </div>
                        
                    </div>
                </DialogContent>
                <DialogActions>
								<Button
									onClick={handleOnCloseModal}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("departamentModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
                                    onClick={handleOnSubmit}
								>
									Criar lista
									{ isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										 />
									 )
                                    }
								</Button>
							</DialogActions>
			</Dialog>
		</div>
	);
};

export default ContactListModal;
