import {Router} from 'express';

export const chatsRoutes = Router();

chatsRoutes.get('/:id', (req, res) => res.send("get messages endpoint"));
chatsRoutes.post("/:id", (req, res) => res.send("send messages endpoint"));
chatsRoutes.put("/:id", (req, res) => res.send("update messages endpint"));
chatsRoutes.delete("/:id", (req, res) => res.send("delete messages endpoint"));

chatsRoutes.get('/group/:id', (req, res) => res.send("get group messages endpoint"));
chatsRoutes.post('/group/:id', (req, res) => res.send("send group messages endpoint"));
chatsRoutes.put("/group/:id", (req, res) => res.send("update group messages endpoint"));
chatsRoutes.delete("/group/:id", (req, res) => res.send("delete group message endpoint"));