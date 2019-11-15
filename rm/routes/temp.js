
//临时用的文件，首页译员数量展示

const express = require('express'),
    router = express.Router(),
    fs = require('fs');

router.get('/', function (req, res) {
    fs.readFile('routes/temp.txt', function (err, data) {
        if(err){
            res.send('')
        }
        const dataStr = data.toString(),
            today = new Date().toLocaleDateString(),
            isToday = dataStr.includes(today);
        if(isToday){
            res.send(dataStr.split(',')[0])
        }else{
            let writeStr = '',
                rnd = 20 - Math.random()*10,
                tarNum = Number(dataStr.split(',')[0]) + Math.floor(rnd);
            writeStr = tarNum + ',' + today;
            fs.writeFile('routes/temp.txt', writeStr, 'utf8', function (err, wData) {

            });
            res.send(String(tarNum))
        }
    })
});


module.exports = router;
