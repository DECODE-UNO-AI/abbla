import React, { useEffect, useState } from "react"
import { 
    Dialog,
    DialogTitle, 
    DialogContent,
    Button,
    DialogActions,
    IconButton,
    InputLabel,
    Avatar,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from "@material-ui/core"

import { AddCircleOutline, DeleteOutline } from "@material-ui/icons";
import TableRowSkeleton from "../TableRowSkeleton";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "react-toastify";


const ViewContactList = ({isOpen, setIsOpen, selectedListId}) => {

    const [contacts, setContacts] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        if (!selectedListId) return
        (async () => {
            setLoading(true)
            const {data} = await api.get(`/campaigncontactslist/${selectedListId}/${1}`)
            setContacts(data.contacts)
            setCount(data.count)
            setHasMore(data.hasMore)
            setLoading(false)
        })()

        return () => {
            setContacts([])
            setPage(1)
            setHasMore(false)
            setCount(0)
        }
        
    }, [selectedListId])

    const handleOnLoadMoreContacts = async() => {
        setLoading(true)
        const { data } = await api.get(`/campaigncontactslist/${selectedListId}/${page+1}`)
        setPage(page+1)
        setContacts(e => [...e, ...data.contacts])
        setHasMore(data.hasMore)
        setLoading(false)
    }

    const handleDeleteContact = async(contactId) => {
        try {
            await api.delete(`/campaigncontactslist/removecontact/${selectedListId}/${contactId}`)
            const contactIndex = contacts.findIndex(c => c.id === contactId)
            if(contactIndex !== -1) {
                contacts.splice(contactIndex, 1);
                setContacts([...contacts])
                setCount(e => e-1)
            }
            toast.success("Contato retirado da lista")
        } catch (err) {
            toast.error("Erro interno")
        } 
    }

    return (
        <Dialog
            open={isOpen}
            onClose={() => {setIsOpen(false)}}
            scroll="paper"
        >   
            <DialogTitle id="form-dialog-title">
                Contatos
            </DialogTitle>
            <DialogContent style={{ padding: 0, height: "500px"}}>
                <InputLabel style={{ width: "100%", textAlign: "center", marginTop: 20 }}>Total: {count} </InputLabel>
                <Table size="small" style={{ marginTop: 40 }}>
                    <TableHead >
                        <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell>
                            {i18n.t("contacts.table.name")}
                        </TableCell>
                        <TableCell align="center">
                            {i18n.t("contacts.table.whatsapp")}
                        </TableCell>
                        <TableCell align="center">
                            {i18n.t("contacts.table.email")}
                        </TableCell>
                        <TableCell align="center">
                            {i18n.t("contacts.table.actions")}
                        </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                            <TableCell style={{ paddingRight: 0 }}>
                                {<Avatar src={contact.profilePicUrl} style={{ width: "50px", height: "50px", borderRadius:"25%"}} />}
                            </TableCell>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell align="center">{contact.number}</TableCell>
                            <TableCell align="center">{contact.email}</TableCell>
                            <TableCell align="center">
                                    <IconButton
                                    size="small"
                                    onClick={() => {
                                        handleDeleteContact(contact.id)
                                    }}
                                    >
                                        <DeleteOutline color="secondary" />
                                    </IconButton>
                            </TableCell>
                            </TableRow>
                        ))}
                        {loading && <TableRowSkeleton avatar columns={4} />}
                        </>
                    </TableBody>
                </Table>
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
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={()=>{
                        setIsOpen(false)
                    }}
                    variant="outlined"
                >
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ViewContactList