import React, { useState, useEffect } from "react"
import { useTheme } from "@material-ui/core/styles"
import {
	BarChart,
	CartesianGrid,
	Bar,
	XAxis,
	YAxis,
	ResponsiveContainer,
    Legend,
    Tooltip
} from "recharts"
import { DatePicker, Space, Radio } from 'antd'
import { 
    InputLabel, 
    Box, 
    Dialog, 
    DialogActions, 
    DialogContent,
    Button 
} from "@material-ui/core"
import { OpenWith } from "@material-ui/icons"
import { Select } from 'antd';
import BackdropLoading from '../../components/BackdropLoading'
import dayjs from 'dayjs';
import useTickets from "../../hooks/useTickets";

// import { i18n } from "../../translate/i18n";


const { RangePicker } = DatePicker;


const QueueChart = ({ userQueues }) => {
	const theme = useTheme();

    const [queues, setQueues] = useState(
        userQueues.map((e) => ({id: e.id, name: e.name, tickets: 0}))
    )
    const [filterQueues, setFilterQueues] = useState(userQueues)
    const [date, setDate] = useState([dayjs(dayjs().format("YYYY/MM/DD"), "YYYY/MM/DD"), dayjs(dayjs().format("YYYY/MM/DD"), "YYYY/MM/DD")])
    const [dateOrder, setDateOrder] = useState("createTicket")
    const [isLoading, setIsLoading] = useState(false)
    const [chartModalOpen, setChartModalOpen] = useState(false)

	const { tickets, loading } = useTickets({ queueIds: JSON.stringify(filterQueues.map(q => q.id)), date: JSON.stringify(date), dateOrder });

    useEffect(() => {
        if (!tickets) return
        setIsLoading(true)
        setQueues(prevState => {
            let aux = filterQueues.map((e) => ({id: e.id, name: e.name, tickets: 0}))
            tickets.forEach(t => {
                const index = aux.findIndex(a => a.id === t.queueId)
                if (!aux[index]) return
                aux[index] = {...aux[index], tickets: aux[index].tickets ?  aux[index].tickets + 1  : 1}
            })
            return aux
        })
        setIsLoading(false)
    }, [tickets, filterQueues])

    const handleOnQueuesChange = (e) => {
        console.log(e)
        if (!e || e.length === 0 ) {
            setFilterQueues(userQueues)
            return
        }
        const queues = userQueues.filter(q => e.includes(q.id))
        console.log(queues)
        setFilterQueues(queues)
    }
	return (
		<Box style={{ overflow: 'hidden' }}>
            {
                loading || isLoading ?
                <>
                    <BackdropLoading />
                </>: ""
            }
            <Dialog fullScreen  open={chartModalOpen} onClose={() => setChartModalOpen(false)}>
                <DialogContent dividers>
                    <ResponsiveContainer width={window.innerWidth - 100} height={window.innerHeight - 100}>
                        <BarChart margin={{ left: 150 }} legend={{ fontSize: 3 }} wi    dth={window.innerWidth - 100} height={window.innerHeight - 100} data={queues} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <XAxis dataKey="tickets" type="number" name="Tickets" allowDecimals={false} stroke={theme.palette.text.secondary}/>
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                name="Setores" 
                                fill={theme.palette.primary.main} 
                                stroke={theme.palette.text.secondary}
                                textAnchor="end"
                                />
                            <Bar accentHeight={10} dataKey="tickets" name="Tickets" fill={theme.palette.primary.main}/>
                        </BarChart>
                    </ResponsiveContainer>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setChartModalOpen(false)}
                        
                        disabled={loading}
                        variant="outlined"
                    >
                        Fechar  
                    </Button>
                </DialogActions>
		    </Dialog>
            <Box style={{ marginBottom: 20 }}>
                <InputLabel style={{ marginBottom: 4 }}>Setor</InputLabel>
                <Select
                    optionFilterProp="label"
                    onChange={handleOnQueuesChange}
                    // value={}
                    mode="multiple"
                    allowClear
                    size="medium"
                    style={{ width: '100%' }}
                    placeholder="Setores"
                    options={userQueues?.map((queue) => { return {value: queue.id, label: queue.name}})}
                />
            </Box>
			<Box style={{ marginBottom: 20 }}>
                    <InputLabel style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>Data 
                    <Radio.Group name="radiogroup" value={dateOrder}  onChange={(e) => setDateOrder(e.target.value)}>
                      <Radio value={"createTicket"}>Data de criação</Radio>
                      <Radio value={"lastMessage"}>Data de atualização</Radio>
                    </Radio.Group>
                    </InputLabel>
                    <Space direction="vertical" style={{ width: "100%"}}>
                        <RangePicker
                            placeholder={["Data inicial", "Data final"]}
                            onChange={(e) => setDate(e)}
                            value={date}
                            style={{ width: "100%"}}
                            size="medium"
                            format="DD-MM-YYYY"
                        />
                    </Space>
            </Box>
            
			<ResponsiveContainer height={500} >
            <BarChart margin={{ left: 150 }} legend={{ fontSize: 3 }} width={400} height={500} data={queues} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <XAxis dataKey="tickets" type="number" name="Tickets" allowDecimals={false} stroke={theme.palette.text.secondary}/>
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    name="Setores" 
                    fill={theme.palette.primary.main} 
                    stroke={theme.palette.text.secondary}
                    textAnchor="end"
                    />
                <Bar accentHeight={10} dataKey="tickets" name="Tickets" fill={theme.palette.primary.main}/>
            </BarChart>
			</ResponsiveContainer>
            <Box style={{ width: "100%", display: "flex", justifyContent: "end", marginTop: -25 }}>
                <OpenWith color="primary" style={{ cursor: "pointer", zIndex: 2 }} onClick={() => setChartModalOpen(true)} />
            </Box>
		</Box>
	);
};

export default QueueChart;
