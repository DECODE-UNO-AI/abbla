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
import api from "../../services/api";
import toastError from "../../errors/toastError";

// import { i18n } from "../../translate/i18n";


const { RangePicker } = DatePicker;


const DepartamentChart = ({ userQueues, userDepartaments, isAdmin }) => {
	const theme = useTheme();
    
    const [departaments, setDepartaments] = useState(userDepartaments?.map((e) => ({id: e.id, name: e.name, tickets: 0, queues: e.queues})))
    const [allDepartaments, setAllDepartaments] = useState(userDepartaments)
    const [queues, setQueues] = useState(userQueues)
    const [date, setDate] = useState([dayjs(dayjs().format("YYYY/MM/DD"), "YYYY/MM/DD"), dayjs(dayjs().format("YYYY/MM/DD"), "YYYY/MM/DD")])
    const [dateOrder, setDateOrder] = useState("createTicket")

	const { tickets } = useTickets({ queueIds: JSON.stringify(queues.map(q => q.id)), date: JSON.stringify(date), dateOrder });

    useEffect(() => {
        if(isAdmin) {
            (async () => {
                try {
                  const { data } = await api.get("/departament");
                  const depart = data.map((e) => ({id: e.id, name: e.name, tickets: 0, queues: e.queues}))
                  setAllDepartaments(data)
                  setDepartaments(depart)
                  setQueues((prevState) => {
                    let q = [];
                    depart.forEach(dep => dep.queues.forEach((i) => q.push(i)))
                    return q;
                  })
                } catch (err) {
                  toastError("INTERNAL_ERROR")
                }
              })();
        }
    }, [isAdmin])

    useEffect(() => {
        if (!tickets) return
        setDepartaments(preveState => {
            let departs = allDepartaments.map((e) => ({id: e.id, name: e.name, tickets: 0, queues: e.queues}))
            departs.forEach((dep, depIndex) => {
                dep.queues.forEach(q => {
                    tickets.forEach(t => {
                        if (q.id === t.queueId) {
                            departs[depIndex] = {...departs[depIndex], tickets: departs[depIndex].tickets + 1}
                        }
                    })
                    
                })
            })
            return departs
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tickets])


    console.log(departaments)
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
                            size="large"
                            format="DD-MM-YYYY"
                        />
                    </Space>
                </Box>
			<ResponsiveContainer height={(50*departaments.length > 250 ? 50*departaments.length : 250)}>
            <BarChart margin={{ left: 100 }} legend={{ fontSize: 12 }} width={400} height={(50*departaments.length)} data={departaments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <XAxis dataKey="tickets" type="number" name="Tickets" allowDecimals={false} stroke={theme.palette.text.secondary}/>
                <YAxis dataKey="name" type="category" name="Departaments" fill={theme.palette.primary.main} stroke={theme.palette.text.secondary} angle={-20}textAnchor="end"/>
                <Bar accentHeight={50} dataKey="tickets" name="Tickets" fill={theme.palette.primary.main}/>
            </BarChart>
			</ResponsiveContainer>
		</React.Fragment>
	);
};

export default DepartamentChart;