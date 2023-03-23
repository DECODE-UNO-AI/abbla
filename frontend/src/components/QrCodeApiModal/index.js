import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import { Dialog, DialogContent, Paper, Typography } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const QrcodeApiModal = ({ open, onClose, whatsAppId }) => {
    const [qrCode, setQrCode] = useState("");

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;
			try {
				const { data } = await api.get(`/whatsappapi/${whatsAppId}`);
				setQrCode(data.qrcode);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	useEffect(() => {
		if (!whatsAppId) return;
		const socket = openSocket();

		socket.on("whatsappapi-update", data => {
			if (data.action === "UPDATE_SESSION" && data.whatsapp.id === whatsAppId) {
				setQrCode(data.whatsapp.qrcode);
			}

			if (data.action === "UPDATE_SESSION" && (data.whatsapp.qrcode === "" || !data.whatsapp.qrcode)) {
				onClose();
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [whatsAppId, onClose]);
	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
			<DialogContent style={{background: '#ffffff'}}>
				<Paper elevation={0} style={{background: '#ffffff'}}>
					<Typography color="primary" gutterBottom>
						{i18n.t("qrCode.message")}
					</Typography>
					{qrCode ? (
						<QRCode value={qrCode} size={256} />
					) : (
						<span>Waiting for QR Code</span>
					)}
				</Paper>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(QrcodeApiModal);