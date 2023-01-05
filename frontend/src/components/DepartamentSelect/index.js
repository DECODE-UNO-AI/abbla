import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
}));

const DepartamentSelect = ({ selectedDepartamentIds, onChange, departamentsSeleted }) => {
	const classes = useStyles();
	const [departaments, setDepartaments] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/departament");
				setDepartaments(data);
			} catch (err) {
				toastError(err);
			}
		})();

		return () => onChange([])
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChange = e => {
        const seletedDepartaments = departaments.filter((dep) => e.target.value.includes(dep.id))
        departamentsSeleted(seletedDepartaments)
		onChange(e.target.value);
	};

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel>{i18n.t("departamentSelect.inputLabel")}</InputLabel>
				<Select
					multiple
					labelWidth={120}
					value={selectedDepartamentIds}
					onChange={handleChange}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
						getContentAnchorEl: null,
					}}
					renderValue={selected => (
						<div className={classes.chips}>
							{selected?.length > 0 &&
								selected.map(id => {
									const queue = departaments.find(q => q.id === id);
									return queue ? (
										<Chip
											key={id}
											style={{ backgroundColor: queue.color }}
											variant="outlined"
											label={queue.name}
											className={classes.chip}
										/>
									) : null;
								})}
						</div>
					)}
				>
					{departaments.map(departaments => (
						<MenuItem key={departaments.id} value={departaments.id}>
							{departaments.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default DepartamentSelect;
