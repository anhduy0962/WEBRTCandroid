var dns = require('dns');
var process = require('child_process');

var port = 9001;
var io = require('socket.io').listen(port);

var ipAddress = '';

var net = require('net');

var client = new net.Socket();
client.setEncoding('utf8');

var socketClients = {};

console.log(" version 1.1.5 ");
console.log((new Date()) + " Server is listening on port " + port);

io.sockets.on('connection', function(socket) {
  console.log((new Date()) + "Accept!!\n");
  
  socketClients[socket.id] = socket;
  
  for (var key in socketClients) {
      console.log(key);
    }
  
  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
  });
 
  socket.on('ipSend', function(data) {
    console.log(socket.request.connection.remoteAddress);
    socket.broadcast.emit('ipSend',socket.request.connection.remoteAddress);
  });

  socket.on('ipRes', function(bl) {
    console.log(bl);
    socket.broadcast.emit('ipRes', bl);
  });
  
  socket.on('disconnected', function(bl) {
    console.log('hangup:' + socket.id);
    socket.broadcast.emit('disconnected',bl);
    
    for (var key in socketClients) {
      console.log(key);
      delete socketClients[key];
    }
  });
  
  socket.on('ipSet', function(data) {
    console.log('ipSet:'+data);
    ipAddress = data;
  });
  
  socket.on('ipGet', function(data) {
    console.log('ipGet:'+ipAddress);
    io.to(socket.id).emit('ipGet',ipAddress);
  });
  
  socket.on('androidServerCheck', function(url) {
    console.log('urlCheck:'+url);
    
    client.connect(9002, url, function() {
	  console.log('Connected'+client.id);
	  client.write(url);
	  io.to(socket.id).emit('androidServerCheck',true);
    });
    
    client.on('data', function(data) {
	  console.log('Received: ' + data);
	  client.destroy(); // kill client after server's response
    });

    client.on('close', function() {
	  console.log('Connection closed'+client.id);
	  client = new net.Socket();
    });
    
    client.on('error', function(err){
      console.log("Error: "+err.message);
      io.to(socket.id).emit('androidServerCheck',false);
      client.destroy();
    });
  });
  
  socket.on('androidConnect', function(bl) {
    console.log('androidConnect:'+bl);
    socket.broadcast.emit('androidConnect', bl);
  });
  
  //fqdnをIPアドレスに変換できるか
  socket.on('fqdnCheck', function(data) {
    
    function fqdnEmit(ip) {
      //io.to(socket.id).emit('fqdnCheck','192.168.11.40');
      io.to(socket.id).emit('fqdnCheck',ip);
    }
    
    //2018/08/11 変更 野村
    //FQDN検索をnslookupからpingに変更
    //setTimeout(function(){checkLookup(data,true,fqdnEmit);},5000);
    //checkLookup(data,false,fqdnEmit);
    checkPing(data,fqdnEmit);
  });
});

var blLookup = false;

function checkLookup(data,blTimeOut,callback) {
  console.log('fqdnCheck:' + data);
  console.log('blTimeOut:' + blTimeOut);
  
  if(blTimeOut == false)
  {
    dns.lookup(data, function onLookup(err, address, family) {
      blLookup = true;
      if (err) {
        console.log('ip:null');
        callback(null);
      }
      else
      {
        console.log('ip:', address);
        callback(address);
      }
    });
  }
  else
  {
    if(blLookup)
    {
      blLookup = false;
    }
    else
    {
      callback(null);
    }
  }
}

//2018/08/11 追加 野村
function checkPing(data,callback)
{
  console.log('fqdnCheck:' + data);
  
  var exec = process.exec('ping -c 1 -n ' + data,(error,stdout,stderr) => {
    if(error)
    {
      console.log('error:' + stderr);
      callback(null);
    }
    else
    {
      console.log('stdout:' + stdout);

      var start = stdout.indexOf('(', 0) + 1;
      var end = stdout.indexOf(')', start);
      
      console.log('start:' + start);
      console.log('end:' + end);
      
      var address = stdout.slice(start,end);
      
      console.log('address:' + address);
      
      callback(address);
    }
  });
}
