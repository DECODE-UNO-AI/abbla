import api from "../services/api";

const shouldUpdate = async (ticket, showAll, user, adminFilterOptions) => {
    let notificate = false

    if (adminFilterOptions && Object.keys(adminFilterOptions).length !== 0) {
        if (adminFilterOptions.queue && adminFilterOptions.queue.length > 0) {
            notificate = adminFilterOptions.queue.includes(`${ticket.queueId}`)
        }
        if (adminFilterOptions.atendente && adminFilterOptions.atendente.length > 0) {
            notificate = adminFilterOptions.atendente.includes(ticket.userId)
        }
        if (adminFilterOptions.connection && adminFilterOptions.connection.length > 0) {
            notificate = adminFilterOptions.atendente.includes(ticket.whatsappId)
        }
        if (adminFilterOptions.tag && adminFilterOptions.tag.length > 0) {
            const { data } = await api.get(`/contacts/${ticket.contact.id}`);
            const tags = data.tags
            // eslint-disable-next-line array-callback-return
            tags.map((tag) => {
                if (adminFilterOptions.tag.includes(tag)) {
                    notificate = true
                }
            })
        }
    } else {
        if ( (ticket.queueId || ((!ticket.userId || ticket.userId === user?.id || showAll) && (user.queues.filter(e => e.id === ticket.queueId).length !== 0)) )) {
            notificate = true
        }
    }

    return notificate ? true : false
}

export default shouldUpdate