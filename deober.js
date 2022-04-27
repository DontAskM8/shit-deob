const fs = require("fs")

var originalCode = fs.readFileSync("./p.js", "utf8")
var beautifiedCode = fs.readFileSync("./p2.js", "utf8")

//Get the obbed strings
var arrayOfShit = originalCode.match(/KPSDK_([0-9+]|[A-z])+=\[(('.*?')|('.*?',))\]/g)[0]
var arrayName = arrayOfShit.match(/KPSDK_([0-9+]|[A-z])+/g)[0]
eval([arrayName, "=", arrayOfShit].join(""))
arrayOfShit = eval(arrayOfShit.replace(/KPSDK_([0-9+]|[A-z])+=/g, ""))


//Get the string replacer
var functionName = originalCode.match(/(?:function) KPSDK_([0-9+]|[A-z])+/g)[0].replace(/function /g, "")
var execFunction = originalCode.match(/function KPSDK_([0-9+]|[A-z])+\(.*?\){.*?KPSDK_([0-9+]|[A-z])+\(.*?\);}/g)[0]
eval(execFunction)

//Get array rotation
var arrayRotationFunc = originalCode.match(/\(function\((_.*?|_.*?,)\){.*?KPSDK_([0-9+]|[A-z])+,.*?\)/g)[0]
eval(arrayRotationFunc+")")


function checkForRereference(actualName, depth = 1){
	var funcRef = originalCode.match(new RegExp(`_([0-9]|[A-z])+=${actualName}`, "g"));
	if(funcRef == null) return;
	funcRef.forEach(x=> {
		try {
			eval(x)
		}catch(e){
			// supposedly no errors but meh
		}
	})
	funcRef = funcRef.map(x => x.split("=")[0])
	
	for(let refName of funcRef){
		var refEvals = originalCode.match(new RegExp(`${refName}\\(.*?,'.*?'\\)`, "g"))
		for(let toEval of refEvals ?? []){
			try {
				var evaluatedValue = eval(toEval)
				beautifiedCode = beautifiedCode.replace(toEval.replace(",", ", "), typeof evaluatedValue == "string" ? `"${evaluatedValue.replace(/\r/g, "\\r'").replace(/\n/g, "\\n")}"` : evaluatedValue)
			}catch(e){
				// Idek
				// console.log(refName)
				// console.log(e, toEval)
				
			}
			
		}
		// Set a maximum so that it doesnt loop forever
		if(depth < 150) checkForRereference(refName, ++depth)
	}
}

checkForRereference(functionName)


//Beautify abit ig
var props = beautifiedCode.match(/\[(\'|\")([0-9]|[A-z]|_)+(\'|\")\]/g)
for(let i of props){
	var dotForm = "." + i.replace(/'|"|\[|\]/g, "")
	beautifiedCode = beautifiedCode.replace(i, dotForm)
}

fs.writeFileSync("./deobed.js", beautifiedCode)