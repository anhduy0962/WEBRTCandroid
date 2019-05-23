const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
app.use(express.static('public'))
//app.use(express.static(__dirname + 'public'));
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname + '/webrtcB_fixed.html'));
  //__dirname : It will resolve to your project folder.
});
//router.get('/about',function(req,res){
//  res.sendFile(path.join(__dirname+'/common/images/sitename.png'));
//});

//router.get('/sitemap',function(req,res){
//  res.sendFile(path.join(__dirname+'/common/css/style.css'));
//});

//add the router
//app.use(express.static(__dirname + '/common/images'));
//Store all HTML files in view folder.
//app.use(express.static(__dirname + '/common/css'));
//Store all JS and CSS in Scripts folder.

app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');

