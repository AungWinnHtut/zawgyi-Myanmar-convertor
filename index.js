'use strict'
const JsonDB = require('node-json-db')
let jsonQuery = require('json-query')
let db = new JsonDB("reg", false, false);
const express=require('express')
const speakeasy = require('speakeasy');
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
	        if(event.message && event.message.text)
		{
			db.reload();
			let message=event.message.text
			let reply=""
                        let sender=event.sender.id
			message=message.toUpperCase()
		    if(event.message.is_echo!=true)
		    {
			
			if(message.indexOf('COMMAND_LIST') >-1)
			{
				console.log(sender +"-"+"type help")		
				reply="Avaliable commandlines.\n================\n1. Register\n2. Pass_code {key_code}\n3. Add_Command {key_command}\n4. Remove_command {key_command}\n5. Command_List\n6.Key_List\n7. Show_IOT_URL {key_command}\n8. Help\n9. About\n\n"
				sendText(sender,reply)
				reply=" The word {word} will be your desired word that should not included special characters{-\"_,#$!...etc} and space."			}
			else if(message.indexOf('REGISTER')>-1)
			{
				var token=generatetoken()
				db.push("/group/"+sender+"/api",token)
				reply="Your API token is "+token
				sendText(sender,reply)
				reply=" Next step, You must be define your own pass code.\nType \" Pass_code {key_code} \"."
			}
			else if(message.indexOf('PASS_CODE')>-1)
                        {
                              try {
				 	var data = db.getData("/group/"+sender+"/api");
					var arr=message.split(" ")
					var index=searchStringInArray("PASS_CODE",arr)
					if(index==-1 || index== arr.length-1)
					{	throw new Error('length_ERROR')}
					var pass=arr[index+1]
					db.push("/group/"+sender+"/pass",pass)
					reply="Your Registration is successly completed. Now you can add command.\nType \"Add_Command\"."
					sendText(sender,reply)
					reply="[Your api key =\""+data+"\"\nand\nPass code=\""+pass+"\"]"  
				} catch(error) {
				
					if(error.name==="DataError"){
   				 		reply="You havn't register yet.\nPlease Type \"Register\"."}
					else if(error.message==="length_ERROR"){
						reply="You type wrong format.Please Type \"Pass_code {no_space_pass_key}\"."}
                      				
			  }
			}

			else if(message.indexOf('SHOW_IOT_URL')>-1)
			{
				        try {
                                        var api= db.getData("/group/"+sender+"/api");
                                         var pas = db.getData("/group/"+sender+"/pass");
                                        var arr=message.split(" ")
                                        var index=searchStringInArray("SHOW_IOT_URL",arr)
                                        if(index==-1 || index== arr.length-1)
                                        {       throw new Error('length_ERROR')}
                                        var command=arr[index+1]
					command=command.toUpperCase()
				
		                         var comd= db.getData("/group/"+sender+"/command");
                			 var arr=Object.keys(comd)
					 var j=0
					 for(j=0;j<arr.length;j++)
                                        {
                                                var str=arr[j].toUpperCase()
					        	if(str===command)
							break;
						
                                        }
					if(j===arr.length)
						   {throw new Error('Data_Error')}
					reply="https://flamelion.herokuapp.com/action?api="
					reply=reply+api+"&pas="+pas+"&com="+arr[j];

                                } catch(error) {

                                        if(error.name==="DataError" || error.message==="Data_Error"){
                                                reply="Your {key_command} is not found.\n Please Try \"Add_Command {no_space_KeyCommnd}\""}
                                        else if(error.message==="length_ERROR"){
                                                reply="You type wrong format.Please Type \"Add_Command {no_space_KeyCommnd}\"."}

                          }
			}
			else if(message.indexOf('REMOVE_COMMAND')>-1)
                        {
                                        try {
                                        var api= db.getData("/group/"+sender+"/api");
                                         var pas = db.getData("/"+sender+"/pass");
                                        var arr=message.split(" ")
                                        var index=searchStringInArray("REMOVE_COMMAND",arr)
                                        if(index==-1 || index== arr.length-1)
                                        {       throw new Error('length_ERROR')}
                                        var command=arr[index+1]
                                        command=command.toUpperCase()
                                         var comd= db.getData("/group/"+sender+"/command");
                                         var arr=Object.keys(comd)
                                         var j=0
                                         for(j=0;j<arr.length;j++)
                                        {
                                                var str=arr[j].toUpperCase()
                                                if(str===command)
                                                        break;

                                        }
					if(j!=arr.length)
					{
							db.delete("/group/"+sender+"/command/"+arr[j]);
							reply="Your key_command is deleted. Type \'Key_List\' to see all Key list you created"
					}
					else
					{
						reply="Your  key_command is not found.Type \'Key_List\' to see all Key list you created"
					}

                                } catch(error) {

                                        if(error.name==="DataError"){
                                                reply="Your {key_command} is not found.\n Please Try \"Add_Command {no_space_KeyCommnd}\""}
                                        else if(error.message==="length_ERROR"){
                                                reply="You type wrong format.Please Type \"Add_Command {no_space_KeyCommnd}\"."}

                          }

				
			}
			 else if(message.indexOf('KEY_LIST')>-1)
                        {
				try{
					var data = db.getData("/group/"+sender+"/command");
					var arr=Object.keys(data); 
					for(var j=0;j<arr.length;j++)
					{
						reply+=(j+1)+". "+arr[j]+" {value}\n"
					}
					reply+="\n The upper instruction you can send from Message to active your IOT"
				   }catch(error) {

                                        if(error.name==="DataError"){
                                                reply="Your Key list is empty."}
                          }


			}
			 else if(message.indexOf('ADD_COMMAND')>-1)
                        {
                              try {

                                        var data = db.getData("/group/"+sender+"/api");
					 data = db.getData("/group/"+sender+"/pass");
					var arr=message.split(" ")
                                        var index=searchStringInArray("ADD_COMMAND",arr)
                                        if(index==-1 || index== arr.length-1)
                                        {       throw new Error('length_ERROR')}
                                        var command=arr[index+1]
					console.log(command+"aaaa")
                                	if(command==="" || command===" ")
					  {       throw new Error('length_ERROR')}
					
				       db.push("/group/"+sender+"/command/"+command,"",true)
                                        reply="Your Command  is successfully added. Now, You can send data using \""+command+" {value}\"."
                                	sendText(sender,reply)   
				        reply="Request url for your IOT. Type \"Show_IOT_URL "+command+"\"."
                                } catch(error) {
                                      console.log(error)
                                        if(error.name==="DataError"){
                                                reply="You havn't register or passcode yet.\nPlease Type \"Register\" or \"Pass_code\"."}
                                        else if(error.message==="length_ERROR"){
                                                reply="You type wrong format.Please Type \"Add_Command {no_space_KeyCommnd}\"."}

                          }
                        }



			else if(message.indexOf('HELP'.toUpperCase())>-1)
			{
				console.log(sender+"-"+"help")
				reply="First, You must be register in our system and then Pass_code for security reason.\n The system gives you API key and save your Passcode(Refer..1 and 2)\nAfter that, you  can add command further,you can request using it from your IOT(Ref:3).\n   In your IOT. you can use get request the following url:\n https://flamelion.herokuapp.com/action?api={api_key}&pc={pass_code}&com={key_command}\n In messager, To send command with value, you message to us like that {key_command} {value}. \n\n For Display List of Commands. Type \" Command_List \" " 
			}

			else if(message.indexOf('ABOUT'.toUpperCase())>-1)
			{
				console.log(sender+"-"+"About")
				reply="We purpose for IOT learner. Not for Commerical use. Owner.. flamelion Nyan"
			}
			else
			{
				var j=0
				var k=0
				try{
				  var comd= db.getData("/group/"+sender+"/command");
				  var mes=message.split(" ")
					console.log("message has "+mes.length)
                                         var arr=Object.keys(comd)
					console.log("add commandLis="+arr.length)
					if(arr.length==0)
                                         {       throw new Error('no_key_command')}
	
					                 console.log("I have commandlist")	 
					
                                         for(j=0;j<arr.length;j++)
                                        {
						
					
						for(k=0;k<mes.length;k++)
						{
						   var cmm=arr[j].toUpperCase()
						   var splitedMSG=mes[k].toUpperCase()
						   if(cmm===splitedMSG)
							{
								if(k==mes.length-1)
									{  console.log("found.but no value")    
										 throw new Error('length_ERROR')}
								else if( mes[k+1]===" ")
									{       throw new Error('length_ERROR')}
								else
								{
									console.log("enter to change")
									db.push("/group/"+sender+"/command/"+cmm,mes[k+1],true)
									console.log("changed")	
									reply="Now Your Data of "+cmm+" is "+db.getData("/group/"+sender+"/command/"+cmm)
								
									break;
								}
							}
						
						}
                                               

                                        }
						if(j==arr.length && k==mes.length)
						  {       throw new Error('no_key_found')}
                                		 
				 } catch(error) {
					  if(error.name==="DataError" || error.message==="no_key_command"){
                                                reply="You havn't key_command or Register yet. Type \"Help\"."}
                                        else if(error.message==="length_ERROR"){
                                                reply="You type wrong format.Please Type \"{key_command} [space] {value}\"."}
					else if(error.message==="no_key_found")
						{
			                                console.log(sender+"-"+message)
			                                reply="Don't know Command. Type 'help'"

						}

				}
				
				
			}
                     }
	             else
			{reply=event.message.text}
			sendText(sender,reply)
		}
		
	}

	res.sendStatus(200)
})
function generatetoken()
{
	return  speakeasy.generateSecret({length: 20}).base32;
}
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
function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
	var str1=str.toUpperCase()
	var str2=strArray[j].toUpperCase()
        if (str2===str1) return j;
    }
    return -1;
}
app.get('/action',function(req,res){
		res.send(db.getData("/group"))	

})
app.listen(app.get('port'),function(){
	console.log("running: port")
})
