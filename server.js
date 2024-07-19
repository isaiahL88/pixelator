import express from 'express'



app.get("/api/posts", async (req, res) => { });

app.post('/api/posts', async (req, res) => { })

app.delete("/api/posts/:id", async (req, res) => { });

app.listen(8080, () => console.log("listening on port 8080"));