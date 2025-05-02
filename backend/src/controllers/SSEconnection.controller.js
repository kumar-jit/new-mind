import { sseManager } from "../utils/sseClients.js";

export const sseConnectionController = (req, res) => {
    const clientId = req.query.clientId;

    if (!clientId) {
        return res.status(400).send("Client ID is required");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    sseManager.addClient(clientId, res);

    const keepAlive = setInterval(() => {
        res.write(`: keep-alive\n\n`);
    }, 15000);

    req.on("close", () => {
        sseManager.removeClient(clientId);
        clearInterval(keepAlive);
    });
};
