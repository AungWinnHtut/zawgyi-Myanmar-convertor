                               'use strict'

const express=require('express')
const bodyParser=require('body-parser')
const request=require('request')
const app=express()
let hello={}
app.set('port',(process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const token="EAAMZCuJeEMZBgBAO7tdtSO7ZCGTE8eZCTQTCEzycc3D2qzwDtSqhcqRLVgYQZC4ByZAi4oyJZApwZAfPpuxN7QzEVNmuZBoeKR7HVpTIIFTKWroDjnMfKfJWVaW1kmmLfY26LmDD9AVdMm9YGK8da5btQ1o4oy5ZAZBwXhZBVmjYVc8wXAZDZD"
app.get('/',function(req,res){
	res.send("Hi I am a chatbot")
})

app.get('/webhook/',function(req,res)
{
	if(req.query['hub.verify_token']==="flamelion")
	{
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong Token")
})
app.post('/webhook/',function(req,res)
{
	let messaging_events=req.body.entry[0].messaging
	for(let i=0;i<messaging_events.length;i++)
	{
		let event =messaging_events[i]
		let sender=event.sender.id
	        if(event.message && event.message.text)
		{

		if(event.message.text==="led on"|| event.message.text==="led off")
		{
			var fs = require('fs');
			if(event.message.text==="led on")
			{
				hello={"led":"on"}
				fs.writeFile('./c.json', JSON.stringify({ "led":"on" }, null, 2));
				console.log("a is on")
			}
			if(event.message.text==="led off")
			{
				hello={"led":"off"}
				 fs.writeFile('./c.json', JSON.stringify({ "led":"off" }, null, 2));
				 console.log("a is off")
			}
			fs.close()
			let text="Now "+event.message.text
			sendText(sender,text)
		}
		else{
			let request = require('request')
			let sendername=event.sender.id
			console.log(sendername+"upper")
			console.log(event.message.text)
			let url ="https://graph.facebook.com/v2.6/"+event.sender.id+"?fields=first_name,last_name&access_token="+token
		        sendername=request_URL(sender,url,event.message.text)		
		  }
   //		  let text=sendername+"!\n I am bot. I am saying as you say:\n"+event.message.text +"\nhttps://www.facebook.com/gradyteddy/photos/a.460984834108983.1073741827.450752618465538/649100375297427"
//		  sendText(sender,text)
		}
	}

	res.sendStatus(200)
})
function request_URL(sender,url,txt)
{
    let send=""
    request(url,function(error,response,body)
    {
	

                                                if (!error && response.statusCode == 200) {
                                                        let info = JSON.parse(body)
                                                        if(info.first_name || info.last_name)
                                                        {
                                                                let send=info.first_name+" "+info.last_name
                                                                console.log(send)
                                                                console.log('dan dan')
 								let text=send+"!\n I am bot. I am saying as you say:\n"+txt
						                sendText(sender,text)
                                                        }
                                                }

    })
console.log(send)
 return send
}

function sendText(sender,text)
{

	let messageData={text:text}
	request(
	{
		url:'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
	        method: 'POST',
		json:{
			recipient:{id:sender},
			message: messageData
		},function(error,response,body){
			if(error)
			{	console.log("sending errror")}
			else if(response.body.error)
			{
				console.log("response body error")
			}
		}

	})
}
app.get('/action',function(req,res){
	let config = require('./c.json')
	//console.log(hello)
	res.send(config)

})
app.listen(app.get('port'),function(){
	console.log("running: port")
})