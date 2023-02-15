import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { getHoursCloseTicketsAuto } from "../../config";
import toastError from "../../errors/toastError";

import api from "../../services/api";

const useTickets = ({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    selectedTags,
    queueIds,
    withUnreadMessages,
    adminFilterOptions: adminFilter,
    dateOrder
}) => {
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [allTicketsCount, setAllTicketsCount] = useState(0)
    const [count, setCount] = useState(0);


    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchTickets = async() => {
                try {
                    const adminFilterOptions = JSON.stringify(adminFilter)
                    const { data } = await api.get("/tickets", {
                        params: {
                            adminFilterOptions,
                            searchParam,
                            pageNumber,
                            status,
                            date,
                            showAll,
                            queueIds,
                            withUnreadMessages,
                            selectedTags,
                            dateOrder
                        },
                    })
                    setTickets(data.tickets)
                    setAllTicketsCount(data.allTicketsCount)
                    setCount(data.count)

                    let horasFecharAutomaticamente = getHoursCloseTicketsAuto(); 

                    if (status === "open" && horasFecharAutomaticamente && horasFecharAutomaticamente !== "" &&
                        horasFecharAutomaticamente !== "0" && Number(horasFecharAutomaticamente) > 0) {

                        let dataLimite = new Date()
                        dataLimite.setHours(dataLimite.getHours() - Number(horasFecharAutomaticamente))

                        data.tickets.forEach(ticket => {
                            if (ticket.status !== "closed") {
                                let dataUltimaInteracaoChamado = new Date(ticket.updatedAt)
                                if (dataUltimaInteracaoChamado < dataLimite)
                                    closeTicket(ticket)
                            }
                        })
                    }

                    setHasMore(data.hasMore)
                    setLoading(false)
                } catch (err) {
                    setLoading(false)
                    toastError(err)
                }
            }

            const closeTicket = async(ticket) => {
                await api.put(`/tickets/${ticket.id}`, {
                    status: "closed",
                    userId: ticket.userId || null,
                })
            }

            fetchTickets()
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [
        searchParam,
        pageNumber,
        status,
        date,
        showAll,
        queueIds,
        withUnreadMessages,
        adminFilter,
        selectedTags,
        dateOrder
    ])

    return { tickets, loading, hasMore, count, allTicketsCount};
};

export default useTickets;