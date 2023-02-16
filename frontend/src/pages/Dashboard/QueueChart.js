import React, { useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
	BarChart,
	CartesianGrid,
	Bar,
	XAxis,
	YAxis,
	ResponsiveContainer,
    Legend,
    Tooltip
} from "recharts";
import { DatePicker, Space, Radio } from 'antd';
import { InputLabel, Box } from "@material-ui/core"
import dayjs from 'dayjs';
import useTickets from "../../hooks/useTickets";

// import { i18n } from "../../translate/i18n";


const { RangePicker } = DatePicker;


const QueueChart = ({ userQueues }) => {
	const theme = useTheme();

    const [queues, setQueues] = useState(
        userQueues.map((e) => ({id: e.id, name: e.name, tickets: 0}))
    )
    const [date, setDate] = useState([dayjs(dayjs().format("YYYY/MM/DD"), "YYYY/MM/DD"), dayjs(dayjs().format("YYYY/MM/DD"), "YYYY/MM/DD")])
    const [dateOrder, setDateOrder] = useState("createTicket")

	const { tickets } = useTickets({ queueIds: JSON.stringify(userQueues.map(q => q.id)), date: JSON.stringify(date), dateOrder });

    useEffect(() => {
        setQueues(prevState => {
            let aux = userQueues.map((e) => ({id: e.id, name: e.name, tickets: 0}))
            tickets.forEach(t => {
                const index = aux.findIndex(a => a.id === t.queueId)
                aux[index] = {...aux[index], tickets: aux[index].tickets + 1}
            })
           
            return aux
        })
    }, [tickets, userQueues])

	return (
		<React.Fragment>
			<Box style={{ marginBottom: 40, marginTop: 20 }}>
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
			<ResponsiveContainer height={(50*queues.length)}>
            <BarChart margin={{ left: 150 }} legend={{ fontSize: 3 }} width={500} height={(50*queues.length)} data={queues} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <XAxis dataKey="tickets" type="number" name="Tickets" allowDecimals={false} stroke={theme.palette.text.secondary}/>
                <YAxis dataKey="name" type="category" name="Setores" fill={theme.palette.primary.main} stroke={theme.palette.text.secondary} angle={-20} textAnchor="end"/>
                <Bar accentHeight={50} dataKey="tickets" name="Tickets" fill={theme.palette.primary.main}/>
            </BarChart>
			</ResponsiveContainer>
		</React.Fragment>
	);
};

export default QueueChart;
