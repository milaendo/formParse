const express = require('express')
const app = express()
const path = require('path')
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const http = require('http')
const os = require('os')
const fs = require('fs')
const Busboy = require('busboy')

//Storing the user info
const userInfo = {}

app.engine('mustache', mustacheExpress());
app.set('views', './views')
app.set('view engine', 'mustache')

app.use(express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(expressValidator())

app.get("/", function(req, res, next){
  res.render("index", {appType:"Express"})
})
app.get("/profileupload", function(req,res,next){
	res.render("uploadpic")
})
app.post("/user/upload",function(req,res,next){
	const busboy = new Busboy({ headers: req.headers })
	console.log("Start of upload")
	busboy.on('file',function(fieldname, file, filename, encoding, mimetype){
		let saveTo = path.join('./static/uploads/', path.basename(filename));
		userInfo.avatar = filename
	 // Save the incoming file.
	 console.log("File is uploading")
     file.pipe(fs.createWriteStream(saveTo))
	})
	busboy.on('finish', function() {
		 console.log('Upload complete');
  		// Send back HTTP response.
  		res.writeHead(200, { 'Connection': 'close' });
		  // End response.
		res.redirect('/info')
	});
	//Parse HTTP-POST upload
	console.log("function registered")
	return req.pipe(busboy);
	
})
app.post("/user/input", function(req,res,next){
	console.log(req.body)
	req.checkBody('name',"error give me yo name").isLength(0,100)
	req.checkBody('email',"error give me yo email").isLength(0,100)
	req.checkBody('birth',"error must be between 1900 and 2017").isAfter('1900').isBefore('2017')
	req.checkBody('job',"lol you need a job").isIn(["UIdesigner","technicalmanager","developer","graphicdesigners"])
	req.checkBody('password',"error must be 8 characters").isLength(1,8)
	let errors = req.validationErrors()
	console.log(errors)
		if (errors) {
			console.log(errors)
			let html = `<div>`
			errors.forEach(function(item){
			html += `
			<p>${item.msg}</p>`
			})
	 		html += `</div>`
			res.send (html)
		}else {
			userInfo.name = req.body.name
			userInfo.email = req.body.email
			res.redirect('/profileupload')
		}
})
app.get("/info", function(req,res,next){
	let html = `<h1>${userInfo.name}</h1><br>
				<h2>${userInfo.email}</h2>
				<img src="./static/uploads/${userInfo.avatar} />`
	res.send(html)
})
app.listen(3000, function(){
  console.log("App running on port 3000")
})