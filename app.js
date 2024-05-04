
const express = require(`express`);
const mongoose = require(`mongoose`);
const Report = require(`./models/report`);

const app = express();

const username = encodeURIComponent("user123");
const password = encodeURIComponent("valio0835");
const dbURL = `mongodb+srv://${username}:${password}@cluster0.xzisit1.mongodb.net/reports`;
mongoose.connect(dbURL)
    .then(result => app.listen(3000))
    .catch(err => res.status(404).render(`404`, {title: `ERROR 404`}));

app.set(`view engine`, `ejs`);


app.use(express.urlencoded({extended: true}));
app.use(express.static(`public`));


app.get(`/`, (req, res) => {
    res.render(`index`, {title: `DECK PRICE CHECKER`});
});

app.get(`/about`, (req, res) => {
    res.render(`about`, {title: `ABOUT US`});
});

app.get(`/report`, (req, res) => {
    res.render(`report`, {title: `REPORT / SUGGEST A FEATURE`});
});

app.post(`/admin`,(req, res) => {
    const report = new Report({
        content: req.body.content
    });
    
    report.save()
        .then(result => {
            res.redirect(`/`);    
        })
        .catch(err => {
            res.status(404).render(`404`, {title: `ERROR 404`});
        })
    
});

app.get(`/admin`, (req, res) => {
    Report.find().sort({createdAt: -1})
        .then(result => {
            res.render(`admin`, {title: `Admin Page`, reports: result});
        })
        .catch(err => {
            res.status(404).render(`404`, {title: `ERROR 404`});
        });    
});

app.delete('/delete-report/:id', (req, res) => {
    const { id } = req.params;  

    Report.findByIdAndDelete(id)
        .then(result => res.send({ status: 'success', message: 'Report deleted successfully' }))
        .catch(err => res.status(500).send({ status: 'error', message: 'Error deleting report' }));
});

app.use((req, res) => {
    res.status(404).render(`404`, {title: `ERROR 404`});
})
