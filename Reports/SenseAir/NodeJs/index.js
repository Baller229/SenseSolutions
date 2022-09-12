/**
 * Created by PATRIK FUSEK.
 * @method {rewrite()} -> rewrite deviceID, userName, password in script.js which is located in server localhost http://127.0.0.1:PORT/script.js.
 * @method {generate()} -> generate pdf from loaded headless page which is located in server localhost http://127.0.0.1:PORT/index.html.
 * @method {replaceHelper()} -> - regex function helper
 * @method {start()} -> start the program. 
 */

const puppeteer = require('puppeteer');
var fs = require('fs');
const { time } = require('console');
var dataF = fs.readFileSync("users.csv", "utf8");
console.log('Read From .csv file');
dataF = dataF.split("\r\n"); 
for (let i in dataF) 
{ 
  dataF[i] = dataF[i].split(",");
}


//===============================================================================================================
//  rewrite():  REWRITE DEVICEID, USERNAME, PASSWORD IN SCRIPT.JS
//===============================================================================================================
async function rewrite(userCount)
{
    //console.log("rewrite...");
    fs.readFile('script.js', 'utf8',  function (err,data) 
    {  
        if (err) return console.log(err);
       
        
        var temp = replaceHelper( data, /var deviceID = (["'])(?:(?=(\\?))\2.)*?\1/g, 'var deviceID = "' + dataF[userCount][2] + '"' );
        var temp1 = replaceHelper( temp, /var userName = (["'])(?:(?=(\\?))\2.)*?\1/g, 'var userName = "' + dataF[userCount][0] + '"' );
        var result = replaceHelper( temp1, /var password = (["'])(?:(?=(\\?))\2.)*?\1/g, 'var password = "' + dataF[userCount][1] + '"' );
        fs.writeFile('script.js', result, 'utf8', function (err) 
        {
          if (err) return console.log(err);
        });
      fs.close;
    });
    await generate(userCount);
}

//========================================================
//  generate(): GENERATE PDF FILE FROM INDEX.HTML
//========================================================
async function generate(userCount) 
{
    //console.log("generate...");
    const browser = await puppeteer.launch({ headless: true})
    const page = await browser.newPage()
    await page.goto('http://127.0.0.1:PORT/index.html')
    
    const forLoop = async _ => {
      console.log('.....Start async loop')
     
      while (true) 
      {
        const pm10 = await page.evaluate(() => {  
          return  document.getElementById("value-PM_10").innerHTML;  
        });
          
        const map = await page.evaluate(() => {  
            return  document.getElementById("map").innerHTML;  
        });
              
        if(map !== ' ' && pm10 !== 'A')
        {
          //console.log(".....map element text:", map);
          //console.log(".....element text:", pm10);
          break;
        } 
      }
    
      //console.log('.....End')
    }  
    await forLoop();
    await page.waitForTimeout(200); //wait for map to load
    //console.log("...start to generate pdf");
    await page.pdf(
    {
        path: '...target repository' + dataF[userCount][3],
        format: 'A4',
        printBackground: true,
        pageRanges: '1-4',
        updateCountersAfterPageRanges: true
      
    })
    await browser.close()   
} 

//******************************************************
//  replaceHelper(): HELPER METHOD FOR REGEX
//******************************************************
function replaceHelper(str, find, replace) 
{
    str = str.replace(new RegExp(find), replace);
  return str;
};

//******************************************************
//  start(): RUN METHOD
//******************************************************
async function start()
{
	for (let i in dataF) 
	{
		console.log("====================");
        console.log("generating for user: ", i);
        await rewrite(i);
	}
}

//******************************************************
//                  ***START***
//******************************************************
(async() => {
    //Here The program start
    const startTime = Date.now();
    const res = await start();
    const endTime = Date.now();
    
    const timeTaken = endTime - startTime;
    console.log(`Time taken to create ` + dataF.length + ` users = ${timeTaken} milliseconds`);
  })();
//------------------------------------------------------
