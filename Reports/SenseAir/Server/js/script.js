var url = 'https://iot.sensesolutions.sk/api/auth/login';

const pdfContainer = document.querySelector('.container');

var xhr = new XMLHttpRequest();
xhr.open('POST', url);

xhr.setRequestHeader('Content-Type', 'application/json');

var JSONresponse = '';
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    JSONresponse = $.parseJSON(xhr.responseText);
    draw_data(JSONresponse.token);
  }
};

var userName = "user@sensesolutions.sk";
var password = "password";
var data = '{"username":"' + userName + '","password":"' + password + '"}';
var deviceID = "deviceID";

xhr.send(data);

//-----------------------------------------------------------------
  const timeseries = ['AQIi', 'PM10', 'co2', 'VOCi', 'air_temperature', 'humidity', 'air_pressure', 'MOLDi', 'AQIinfection', 'CO', 'GMsum', 'PM2_5' , 'PM10' ];
 
    var DATA = [];
    var GraphDATA = [];
    var GraphValueX = [];
    var GraphValueY = [];
    var X = [];
    var Y =[];
    var flag = 0;
//-----------------------------------------------------------------
    //TIME
    const month = ['Január','Február','Marec','Apríl','Máj','Jún','Júl','August','September','Október','November','December'];
    let d = new Date();
    let name = month[d.getMonth()];
    let year = d.getFullYear();
  
    let m = d.getMonth() + 1;
    let day = new Date(new Date().setDate(new Date().getDate()));
    let day1 = new Date(new Date().setDate(new Date().getDate() - 5));
    let tsDay = day.getTime();
    let tsDay1 = day1.getTime();
    // let tsDay1 = 1661558400000;
    // let tsDay = 1661644800000; 
  
    //console.log(tsDay);
    //console.log(tsDay1);

async function draw_data(token)
{
  


  const headerColoredText = document.querySelector('.header-nav');
  const headerDateRange = document.querySelector('.header-date-range');

  headerColoredText.innerText = `Týždenný report z merania kvality ovzdušia ${name} ${year}`;
  headerDateRange.innerText = `Merané obdobie: ${day1.toLocaleDateString()} - ${day.toLocaleDateString()} `;

  let h5 = (document.querySelector('h5').innerText = `*jednotlivé grafy znázorňujú priemerné hodnoty za obdobie od ${day1.toLocaleDateString()} až ${day.toLocaleDateString()}.`);
  let h5sec = document.querySelector('.h5sec');
  h5sec.innerText  = `*jednotlivé grafy znázorňujú priemerné hodnoty za obdobie od ${day1.toLocaleDateString()} až ${day.toLocaleDateString()}. \n *hodnota CO zobrazuje maximálne nameranú hodnotu za daný cašovy interval \n *radiácia zobrazuje úhrn žiarenia za daný časový interval`;


//==========================================================================================================================================================
//                                    MAP
//=============================================================================
  var map = L.map('map').setView([48.144985265356475, 17.15510522056591], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  var marker = L.marker([48.144985265356475, 17.15510522056591]).addTo(map);
  
  // Calling that async function
  await start(token);

}

//=============================================================================
//                             GETAPI FUNCTION
//=============================================================================
    async function getapi(url, token, i) 
    {      
      const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token } } );
      var data = await response.json();
     
      console.log("dataa: ", data, " flag: ", flag );
      return data;
    }


//=============================================================================
//                             START FUNCTION
//=============================================================================
     async function startAPI(token, i)
    {
                    
        if(timeseries[i]=='CO'){
            DATA[i] =  await getapi(`https://iot.sensesolutions.sk/api/plugins/telemetry/DEVICE/` + deviceID + `/values/timeseries?keys=` + timeseries[i] + `&startTs=${tsDay1}&endTs=${tsDay}&interval=86400000&limit=2000&agg=MAX`, token, i);
          
            flag++;
          }else if(timeseries[i]=='GMsum'){
            DATA[i] =  await getapi(`https://iot.sensesolutions.sk/api/plugins/telemetry/DEVICE/` + deviceID + `/values/timeseries?keys=` + timeseries[i] + `&startTs=${tsDay1}&endTs=${tsDay}&interval=86400000&limit=2000&agg=SUM`, token, i);
            GraphDATA[0] =  await getapi(`https://iot.sensesolutions.sk/api/plugins/telemetry/DEVICE/` + deviceID + `/values/timeseries?keys=co2&startTs=${tsDay1}&endTs=${tsDay}&interval=86400000&limit=1426`, token, i);
            GraphDATA[1] =  await getapi(`https://iot.sensesolutions.sk/api/plugins/telemetry/DEVICE/` + deviceID + `/values/timeseries?keys=humidity&startTs=${tsDay1}&endTs=${tsDay}&interval=86400000&limit=1426`, token, i);
            GraphDATA[2] =  await getapi(`https://iot.sensesolutions.sk/api/plugins/telemetry/DEVICE/` + deviceID + `/values/timeseries?keys=air_temperature&startTs=${tsDay1}&endTs=${tsDay}&interval=86400000&limit=1426`, token, i);

            flag++;
          }else{
            DATA[i] =  await getapi(`https://iot.sensesolutions.sk/api/plugins/telemetry/DEVICE/` + deviceID + `/values/timeseries?keys=` + timeseries[i] + `&startTs=${tsDay1}&endTs=${tsDay}&interval=86400000&limit=1&agg=AVG`, token, i);     
            flag++;
          }
          if(flag == timeseries.length)
          {
         
            startRender(token);
            console.log("Graph data: ", GraphDATA);
            GraphValueX = [];
            GraphValueY = [];
            X = [];
            Y = [];
            loadGraphData(GraphValueX, GraphValueY, 0);
            drawGraph(document.getElementById('myChart'), GraphValueX, GraphValueY, "co2");
            
            GraphValueX = [];
            GraphValueY = [];
            X = [];
            Y = [];
            loadGraphData(GraphValueX, GraphValueY, 1);
            drawGraph( document.getElementById('myChart2'), X,Y, "humidity");
            
            GraphValueX = [];
            GraphValueY = [];
            X = [];
            Y = []; 
            loadGraphData(GraphValueX, GraphValueY, 2);
            drawGraph( document.getElementById('myChart3'), X, Y, timeseries[4]);
                       
          }
          console.log("...Api added to Data: ", i, " flag: ", flag);   
            
    }

    async function startData(token)
    {
     
      for (let i in timeseries) 
      {
          startAPI(token, i);  
          console.log("...finished start api function ", i);   
      }
    }
    async function start(token)
    {
      console.log("start");
      startData(token);
      console.log("...finished start data function");   
    }
    async function startRender(token)
    {
      console.log("...start render");   
      console.log("DATA: ", DATA);
      for (let i in timeseries) 
      {
        console.log("rendering: ", Object.values(DATA[i]).length);
        switch(Object.values(DATA[i]).length)
        {
          case 0:
          
          break;
          case 1:
              // console.log("rendering inside: ", GraphDATA[0].co2 );      //Object.values(GraphDATA[0])[0][0].ts
              render(i, Object.values(DATA[i])[0][0].value);
          break;
          default:
          break;
        }
      }
     
    }
    
//=============================================================================
//                             RENDER FUNCTION
//=============================================================================  

function loadGraphData(xData, yData, index)
{

  console.log("xdata: ", xData)
  var gLength = Object.values(GraphDATA[index])[0].length;
  var a = 0;  
  for(let i = Object.values(GraphDATA[index])[0].length -1 ; i >= 0;i--)
  {
    
    xData[a] =  parseInt(Object.values(GraphDATA[index])[0][i].value); 
    yData[a] = timeConverter(parseInt(Object.values(GraphDATA[index])[0][i].ts));
    
   // console.log("value: ", GraphDATA[index].humidity[i].value);
    // console.log("ts: ", GraphDATA[index].humidity[i].ts);
    a++;
  }
  console.log("GraphValueX",  xData);
  console.log("GraphValueY",   yData);

  console.log("lenght: ", gLength);
  //countAverage(xData, yData);
}

function countAverage(xData, yData)
{
  var indexCount = 0
  var countXData = 0; 
  var countYData = 0;
  var average = 0;
  for (i in xData)
  {

    average += xData[i];
    if(countXData == 15)
    {
      Y[indexCount] = yData[(indexCount*15)+8];
       
        average = average / 15;
        X[indexCount] = average;
        indexCount++;
        average = 0;
        countXData = 0;
        countYData = 0;
    }
    if(countXData != 15)
    {
      countXData++;
      countYData++;  
    }
  }
  console.log("X: ", X);
  console.log("Y: ", Y);
}

 function drawGraph(element, xData, yData, name)
{
  //==============================
  
  const ctx = element.getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: yData,
      datasets: [{
         tension: 0.45,
        label: name,
        data: xData,
        // backgroundColor: [
        //   'rgba(255, 99, 132, 0.2)'
        // ],
        borderColor: [
          '#009ea6'
        ],
        borderWidth: 2.5
      }]
    },
     options: {
      bezierCurve : true,
      elements: {
        point:{
            radius: 0
        }
    },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
          
            maxTicksLimit: 20
        }
        },
        y: {
          grid: {
            display: false
          }
        }
      }
    }
  });



  //==============================
}

function timeConverter(unixTimestamp){
  const date = new Date(unixTimestamp);
  var time =  date.getDate() + "." + (date.getMonth() + 1) +  '. ' + date.getHours() + ':' + String(date.getMinutes()).padStart(2, "0");
  return time;
}


async function render(i, value) 
  { 
    //console.log("helo1", i);
    switch(+i) {
        //==========================================================================================================================================================
        //==========================================================================================================================================================
        case 0:
          //console.log("helo");
          const pAQI = document.querySelector('.value-AQI');
          pAQI.innerText = ' ' + Math.round(value) + ' IAQ';    
          var percent = Math.round(value);
          var progressing = document.querySelector(`#progress_0 .progressing`);
          var circle = document.querySelector(`#progress_0 .circle`);
          var hodnotenie = document.querySelector('.hodnotenie-AQI');
        
          // CELKOVY VYSLEDOK NAMERANYCH HODNOT TEXT
        
          const celkovyVysledokText = document.querySelector('.celkovy-vysledok-text');
          //AQIi
          if (percent >= 4.5) {
            progressing.style.width = '88.5' + '%';
            circle.style.left = '88.5' + '%';
            progressing.style.background = '#bb8ef5';
            circle.style.background = '#bb8ef5';
            circle.style.borderColor = '#bb8ef5';
            hodnotenie.innerText = 'Veľmi zlá';
            celkovyVysledokText.innerText =
                'Kvalita vzduchu je veľmi zlá a dosiahla kritickú úroveň, ktorá radikálne presahuje odporúčané hodnoty Svetovej zdravotníckej organizácie WHO. Zdravie osôb môže byť poznačené už pri krátkodobom vystavení.';
          }
        
          if (percent >= 3.5 && percent <= 4.5) {
            progressing.style.width = '69.5' + '%';
            circle.style.left = '69.5' + '%';
            progressing.style.background = '#ad4b4b';
            circle.style.background = '#ad4b4b';
            circle.style.borderColor = '#ad4b4b';
            hodnotenie.innerText = 'Zlá';
            celkovyVysledokText.innerText =
                'Kvalita vzduchu je zlá a dosiahla vysokú úroveň znečistenia a výrazne prekračuje odporúčané hodnoty stanovené Svetovou zdravotníckou organizáciou WHO. Dlhodobé vystavenie predstavuje vysoké zdravotné riziko a výrazne prispieva k prenosu baktérií a vírusov v priestore. Sústredenie a únava sú na kritickej úrovni.';
          }
        
          if (percent >= 2.5 && percent <= 3.5) {
            progressing.style.width = '49.5' + '%';
            circle.style.left = '49.5' + '%';
            progressing.style.background = '#ffbd59';
            circle.style.background = '#ffbd59';
            circle.style.borderColor = '#ffbd59';
            hodnotenie.innerText = 'Priemerná';
            celkovyVysledokText.innerText =
                'Kvalita vzduchu je priemerná a presahuje odporúčané hodnoty stanovené Svetovou zdravotníckou organizáciou WHO. Dlhodobé vystavenie predstavuje menšie zdravotné riziko pre citlivé osoby a zvýšené riziko prenosu baktérií a vírusov. Sústredenie a únava sa výraznejšie zhoršujú.';
          }
          if (percent >= 1.5 && percent <= 2.5) {
            progressing.style.width = '29.5' + '%';
            circle.style.left = '29.5' + '%';
            progressing.style.background = '#d7e86b';
            circle.style.background = '#d7e86b';
            circle.style.borderColor = '#d7e86b';
            hodnotenie.innerText = 'Dobrá';
            celkovyVysledokText.innerText =
                'Kvalita vzduchu je dobrá, čo môžu zapríčiňovať nárazové zvýšenia jednotlivých parametrov mimo optimálnych hodnôt, napriek tomu základné parametre vzduchu spĺňajú odporúčané, dlhodobé hodnoty Svetovej zdravotníckej organizácie WHO. Riziko prenosu baktérií a vírusov je nízke. Sústredenie a únava pri citlivejších osobách môžu byť ovplyvnené.';
          }
          if (percent >= 0 && percent <= 1.5) {
            progressing.style.width = '10' + '%';
            circle.style.left = '10' + '%';
            progressing.style.background = '#82d672';
            circle.style.background = '#82d672';
            circle.style.borderColor = '#82d672';
            hodnotenie.innerText = 'Výborná';
            celkovyVysledokText.innerText =
                'Kvalita vzduchu je výborná a vykazuje ideálne a zdraviu nezávadné hodnoty podľa odporúčaní Svetovej zdravotníckej organizácie WHO. Riziko prenosu baktérií a vírusov je minimálne. Sústredenie a únava osôb nie sú ovplyvnené.';
          }
          break;
          //==========================================================================================================================================================


        case 1:
          //PRASNOST
          const pPM10 = document.querySelector('#value-PM10');
          pPM10.innerText = ' ' + Math.round(value * 10) / 10 + ' ug/m3';
          //console.log("data: ", value);
            var percent = Math.round(value);
            var progressing = document.querySelector(`#progress_0-1 .progressing-1`);
            var circle = document.querySelector(`#progress_0-1 .circle-1`);
            var hodnotenie = document.querySelector('.hodnotenie-prasnost');
  
            if (400 <= percent) {
              progressing.style.width = '86' + '%';
              circle.style.left = '86' + '%';
              progressing.style.background = '#bb8ef5';
              circle.style.background = '#bb8ef5';
              circle.style.borderColor = '#bb8ef5';
              hodnotenie.innerText = 'Veľmi zlá hodnota';
            }
  
            if (200 <= percent && percent < 400) {
              progressing.style.width = '61.5' + '%';
              circle.style.left = '61.5' + '%';
              progressing.style.background = '#ad4b4b';
              circle.style.background = '#ad4b4b';
              circle.style.borderColor = '#ad4b4b';
              hodnotenie.innerText = 'Zlá hodnota';
            }
  
            if (55 <= percent && percent < 200) {
              progressing.style.width = '39.5' + '%';
              circle.style.left = '39.5' + '%';
              progressing.style.background = '#ffbd59';
              circle.style.background = '#ffbd59';
              circle.style.borderColor = '#ffbd59';
              hodnotenie.innerText = 'Priemerná hodnota';
            }
            if (25 <= percent && percent < 55) {
              progressing.style.width = '22' + '%';
              circle.style.left = '22' + '%';
              progressing.style.background = '#d7e86b';
              circle.style.background = '#d7e86b';
              circle.style.borderColor = '#d7e86b';
              hodnotenie.innerText = 'Dobrá hodnota';
            }
            if (percent < 25) {
              progressing.style.width = '7' + '%';
              circle.style.left = '7' + '%';
              progressing.style.background = '#82d672';
              circle.style.background = '#82d672';
              circle.style.borderColor = '#82d672';
              hodnotenie.innerText = 'Výborná hodnota';
            }
          break;
        case 2:
          //CO2
          //console.log(value);
          const pco2 = document.querySelector('#value-co2');
          pco2.innerText = ' ' + Math.round(value) + ' ppm';
  
  
            var percent = Math.round(value);
            var progressing = document.querySelector(`#progress_0-2 .progressing-2`);
            var circle = document.querySelector(`#progress_0-2 .circle-2`);
            var hodnotenie = document.querySelector('.hodnotenie-co2');
  
            if (4000 <= percent) {
              progressing.style.width = '86' + '%';
              circle.style.left = '86' + '%';
              progressing.style.background = '#bb8ef5';
              circle.style.background = '#bb8ef5';
              circle.style.borderColor = '#bb8ef5';
              hodnotenie.innerText = 'Veľmi zlá hodnota';
            }
  
            if (2500 <= percent && percent < 4000) {
              progressing.style.width = '61.5' + '%';
              circle.style.left = '61.5' + '%';
              progressing.style.background = '#ad4b4b';
              circle.style.background = '#ad4b4b';
              circle.style.borderColor = '#ad4b4b';
              hodnotenie.innerText = 'Zlá hodnota';
            }
  
            if (1100 <= percent && percent < 2500) {
              progressing.style.width = '39.5' + '%';
              circle.style.left = '39.5' + '%';
              progressing.style.background = '#ffbd59';
              circle.style.background = '#ffbd59';
              circle.style.borderColor = '#ffbd59';
              hodnotenie.innerText = 'Priemerná hodnota';
            }
            if (800 <= percent && percent < 1100) {
              progressing.style.width = '22' + '%';
              circle.style.left = '22' + '%';
              progressing.style.background = '#d7e86b';
              circle.style.background = '#d7e86b';
              circle.style.borderColor = '#d7e86b';
              hodnotenie.innerText = 'Dobrá hodnota';
            }
            if (percent < 800) {
              progressing.style.width = '7' + '%';
              circle.style.left = '7' + '%';
              progressing.style.background = '#82d672';
              circle.style.background = '#82d672';
              circle.style.borderColor = '#82d672';
              hodnotenie.innerText = 'Výborná hodnota';
            }
          break;
        case 3:
          //VOCI
          const pVOCi = document.querySelector('#value-VOCi');
          pVOCi.innerText = ' ' + Math.round(value) + ' voc';
  
          
          var percent = Math.round(value);
          var progressing = document.querySelector(`#progress_0-3 .progressing-3`);
          var circle = document.querySelector(`#progress_0-3 .circle-3`);
          var hodnotenie = document.querySelector('.hodnotenie-VOCi');
  
          if (300 <= percent) {
            progressing.style.width = '78.5' + '%';
            circle.style.left = '78.5' + '%';
            progressing.style.background = '#ad4b4b';
            circle.style.background = '#ad4b4b';
            circle.style.borderColor = '#ad4b4b';
            hodnotenie.innerText = 'Zlá hodnota';
          }
  
          if (150 <= percent && percent < 300) {
            progressing.style.width = '43.5' + '%';
            circle.style.left = '43.5' + '%';
            progressing.style.background = '#ffbd59';
            circle.style.background = '#ffbd59';
            circle.style.borderColor = '#ffbd59';
            hodnotenie.innerText = 'Priemerná hodnota';
          }
  
          if (0 <= percent && percent < 150) {
            progressing.style.width = '15' + '%';
            circle.style.left = '15' + '%';
            progressing.style.background = '#82d672';
            circle.style.background = '#82d672';
            circle.style.borderColor = '#82d672';
            hodnotenie.innerText = 'Výborná hodnota';
          }
          
          break;
        case 4:
          //Teplota
          const pairTemperature = document.querySelector('#value-airTemperature');
          pairTemperature.innerText = ' ' + Math.round(value * 10) / 10 + ' °C';
  
         
            var percent = Math.round(value);
            var progressing = document.querySelector(`#progress_0-4 .progressing-4`);
            var circle = document.querySelector(`#progress_0-4 .circle-4`);
            var hodnotenie = document.querySelector('.hodnotenie-airTemperature');
  
            if (28 <= percent) {
              progressing.style.width = '80.5' + '%';
              circle.style.left = '80.5' + '%';
              progressing.style.background = '#ad4b4b';
              circle.style.background = '#ad4b4b';
              circle.style.borderColor = '#ad4b4b';
              hodnotenie.innerText = 'Vysoká hodnota';
            }
  
            if (21 <= percent && percent < 28) {
              progressing.style.width = '49' + '%';
              circle.style.left = '49' + '%';
              progressing.style.background = '#82d672';
              circle.style.background = '#82d672';
              circle.style.borderColor = '#82d672';
              hodnotenie.innerText = 'Výborná hodnota';
            }
  
            if (0 <= percent && percent < 21) {
              progressing.style.width = '17' + '%';
              circle.style.left = '17' + '%';
              progressing.style.background = '#ffbd59';
              circle.style.background = '#ffbd59';
              circle.style.borderColor = '#ffbd59';
              hodnotenie.innerText = 'Nízka hodnota';
            }  
        
          break;
        case 5:
          //Vlhkost
          const phumidity = document.querySelector('#value-humidity');
          phumidity.innerText = ' ' + Math.round(value) + ' %';
  
         
            var percent = Math.round(value);
            var progressing = document.querySelector(`#progress_0-5 .progressing-5`);
            var circle = document.querySelector(`#progress_0-5 .circle-5`);
            var hodnotenie = document.querySelector('.hodnotenie-humidity');
  
            if (60 <= percent) {
              progressing.style.width = '78.5' + '%';
              circle.style.left = '78.5' + '%';
              progressing.style.background = '#ad4b4b';
              circle.style.background = '#ad4b4b';
              circle.style.borderColor = '#ad4b4b';
              hodnotenie.innerText = 'Vysoká hodnota';
            }
  
            if (30 <= percent && percent < 60) {
              progressing.style.width = '44.5' + '%';
              circle.style.left = '44.5' + '%';
              progressing.style.background = '#82d672';
              circle.style.background = '#82d672';
              circle.style.borderColor = '#82d672';
              hodnotenie.innerText = 'Výborná hodnota';
            }
  
            if (0 <= percent && percent < 30) {
              progressing.style.width = '15' + '%';
              circle.style.left = '15' + '%';
              progressing.style.background = '#ffbd59';
              circle.style.background = '#ffbd59';
              circle.style.borderColor = '#ffbd59';
              hodnotenie.innerText = 'Nízka hodnota';
            }
          break;
        case 6:
          //Airpressure
          const pairPressure = document.querySelector('#value-airPressure');
          pairPressure.innerText = ' ' + Math.round(value) + ' bar';
          
            var percent = Math.round(value);
            var progressing = document.querySelector(`#progress_0-6 .progressing-6`);
            var circle = document.querySelector(`#progress_0-6 .circle-6`);
            var hodnotenie = document.querySelector('.hodnotenie-airPressure');
  
            if (1020 <= percent) {
              progressing.style.width = '78.5' + '%';
              circle.style.left = '78.5' + '%';
              progressing.style.background = '#ad4b4b';
              circle.style.background = '#ad4b4b';
              circle.style.borderColor = '#ad4b4b';
              hodnotenie.innerText = 'Vysoká hodnota';
            }
  
            if (1000 <= percent && percent < 1020) {
              progressing.style.width = '49.5' + '%';
              circle.style.left = '49.5' + '%';
              progressing.style.background = '#82d672';
              circle.style.background = '#82d672';
              circle.style.borderColor = '#82d672';
              hodnotenie.innerText = 'Výborná hodnota';
            }
  
            if (0 <= percent && percent < 1000) {
              progressing.style.width = '19' + '%';
              circle.style.left = '19' + '%';
              progressing.style.background = '#ffbd59';
              circle.style.background = '#ffbd59';
              circle.style.borderColor = '#ffbd59';
              hodnotenie.innerText = 'Nízka hodnota';
            }
          break;
        case 7:
          //Mold
          const pairMold = document.querySelector('#value-mold');
          pairMold.innerText = ' ' + Math.round(value) + ' index';
          
            var percent = Math.round(value);
            var progressing = document.querySelector(`#progress_0-7 .progressing-7`);
            var circle = document.querySelector(`#progress_0-7 .circle-7`);
            var hodnotenie = document.querySelector('.hodnotenie-mold');
  
            if (3 <= percent) {
              progressing.style.width = '78.5' + '%';
              circle.style.left = '78.5' + '%';
              progressing.style.background = '#ad4b4b';
              circle.style.background = '#ad4b4b';
              circle.style.borderColor = '#ad4b4b';
              hodnotenie.innerText = 'Vysoké riziko';
            }
  
            if (2 <= percent && percent < 3) {
              progressing.style.width = '49.5' + '%';
              circle.style.left = '49.5' + '%';
              progressing.style.background = '#ffbd59';
              circle.style.background = '#ffbd59';
              circle.style.borderColor = '#ffbd59';
              hodnotenie.innerText = 'Stredné riziko';
            }
  
            if (0 <= percent && percent < 2) {
              progressing.style.width = '19' + '%';
              circle.style.left = '19' + '%';
              progressing.style.background = '#82d672';
              circle.style.background = '#82d672';
              circle.style.borderColor = '#82d672';
              hodnotenie.innerText = 'Nízke riziko';
            }
          break;
        case 8:
          //RizikoInfekcie
          const pairInfection = document.querySelector('#value-infection');
          pairInfection.innerText = ' ' + Math.round(value) + ' index';
        
          var percent = Math.round(value);
          var progressing = document.querySelector(`#progress_0-8 .progressing-8`);
          var circle = document.querySelector(`#progress_0-8 .circle-8`);
          var hodnotenie = document.querySelector('.hodnotenie-infection');

          if (3 <= percent) {
            progressing.style.width = '78.5' + '%';
            circle.style.left = '78.5' + '%';
            progressing.style.background = '#ad4b4b';
            circle.style.background = '#ad4b4b';
            circle.style.borderColor = '#ad4b4b';
            hodnotenie.innerText = 'Vysoké riziko';
          }

          if (2 <= percent && percent < 3) {
            progressing.style.width = '49.5' + '%';
            circle.style.left = '49.5' + '%';
            progressing.style.background = '#ffbd59';
            circle.style.background = '#ffbd59';
            circle.style.borderColor = '#ffbd59';
            hodnotenie.innerText = 'Stredné riziko';
          }

          if (0 <= percent && percent < 2) {
            progressing.style.width = '19' + '%';
            circle.style.left = '19' + '%';
            progressing.style.background = '#82d672';
            circle.style.background = '#82d672';
            circle.style.borderColor = '#82d672';
            hodnotenie.innerText = 'Nízke riziko';
          }
          break;
        case 9:
          //CO
          const pairCO = document.querySelector('#value-CO');
        pairCO.innerText = ' ' + Math.round(value) + ' ppm';
    
          var percent = Math.round(value);
          var progressing = document.querySelector(`#progress_0-9 .progressing-9`);
          var circle = document.querySelector(`#progress_0-9 .circle-9`);
          var hodnotenie = document.querySelector('.hodnotenie-CO');

          if (35 <= percent) {
            progressing.style.width = '78.5' + '%';
            circle.style.left = '78.5' + '%';
            progressing.style.background = '#ad4b4b';
            circle.style.background = '#ad4b4b';
            circle.style.borderColor = '#ad4b4b';
            hodnotenie.innerText = 'Zlá hodnota';
          }

          if (11 <= percent && percent < 35) {
            progressing.style.width = '49.5' + '%';
            circle.style.left = '49.5' + '%';
            progressing.style.background = '#ffbd59';
            circle.style.background = '#ffbd59';
            circle.style.borderColor = '#ffbd59';
            hodnotenie.innerText = 'Priemerná hodnota';
          }

          if (0 <= percent && percent < 11) {
            progressing.style.width = '19' + '%';
            circle.style.left = '19' + '%';
            progressing.style.background = '#82d672';
            circle.style.background = '#82d672';
            circle.style.borderColor = '#82d672';
            hodnotenie.innerText = 'Výborna hodnota';
          }
          break;
        case 10:
          //Radiacia
          const pairRad = document.querySelector('#value-radiacia');
          pairRad.innerText = ' ' + Math.round(value) + ' uSV/5d';
         
            var percent = Math.round(value);
            var progressing = document.querySelector(`#progress_0-10 .progressing-10`);
            var circle = document.querySelector(`#progress_0-10 .circle-10`);
            var hodnotenie = document.querySelector('.hodnotenie-radiacia');
  
            if (600 <= percent) {
              progressing.style.width = '78.5' + '%';
              circle.style.left = '78.5' + '%';
              progressing.style.background = '#ad4b4b';
              circle.style.background = '#ad4b4b';
              circle.style.borderColor = '#ad4b4b';
              hodnotenie.innerText = 'Výborna hodnota';
            }
  
            if (29 <= percent && percent < 600) {
              progressing.style.width = '49.5' + '%';
              circle.style.left = '49.5' + '%';
              progressing.style.background = '#ffbd59';
              circle.style.background = '#ffbd59';
              circle.style.borderColor = '#ffbd59';
              hodnotenie.innerText = 'Priemerná hodnota';
            }
  
            if (0 <= percent && percent < 29) {
              progressing.style.width = '19' + '%';
              circle.style.left = '19' + '%';
              progressing.style.background = '#82d672';
              circle.style.background = '#82d672';
              circle.style.borderColor = '#82d672';
              hodnotenie.innerText = 'Zlá hodnota';
            }
          break;
        case 11:
          //PM2.5
          const pairPM2 = document.querySelector('#value-PM2');
          pairPM2.innerText = ' ' + Math.round(value * 10) / 10 + ' ug/m3';
          
            var percent = Math.round(value);
            var progressing = document.querySelector(`#progress_0-11 .progressing-11`);
            var circle = document.querySelector(`#progress_0-11 .circle-11`);
            var hodnotenie = document.querySelector('.hodnotenie-PM2');
  
            if (149 <= percent) {
              progressing.style.width = '86' + '%';
              circle.style.left = '86' + '%';
              progressing.style.background = '#bb8ef5';
              circle.style.background = '#bb8ef5';
              circle.style.borderColor = '#bb8ef5';
              hodnotenie.innerText = 'Veľmi zlá hodnota';
            }
  
            if (55 <= percent && percent < 149) {
              progressing.style.width = '61.5' + '%';
              circle.style.left = '61.5' + '%';
              progressing.style.background = '#ad4b4b';
              circle.style.background = '#ad4b4b';
              circle.style.borderColor = '#ad4b4b';
              hodnotenie.innerText = 'Zlá hodnota';
            }
  
            if (35 <= percent && percent < 55) {
              progressing.style.width = '39.5' + '%';
              circle.style.left = '39.5' + '%';
              progressing.style.background = '#ffbd59';
              circle.style.background = '#ffbd59';
              circle.style.borderColor = '#ffbd59';
              hodnotenie.innerText = 'Priemerná hodnota';
            }
            if (12 <= percent && percent < 35) {
              progressing.style.width = '22' + '%';
              circle.style.left = '22' + '%';
              progressing.style.background = '#d7e86b';
              circle.style.background = '#d7e86b';
              circle.style.borderColor = '#d7e86b';
              hodnotenie.innerText = 'Dobrá hodnota';
            }
            if (percent < 12) {
              progressing.style.width = '7' + '%';
              circle.style.left = '7' + '%';
              progressing.style.background = '#82d672';
              circle.style.background = '#82d672';
              circle.style.borderColor = '#82d672';
              hodnotenie.innerText = 'Výborná hodnota';
            }
          break;
        case 12:
         //PM10
         const pairPM10 = document.querySelector('#value-PM_10');
         pairPM10.innerText = ' ' + Math.round(value * 10) / 10 + ' ug/m3';
           var percent = Math.round(value);
           var progressing = document.querySelector(`#progress_0-12 .progressing-12`);
           var circle = document.querySelector(`#progress_0-12 .circle-12`);
           var hodnotenie = document.querySelector('.hodnotenie-PM10');
 
           if (400 <= percent) {
             progressing.style.width = '86' + '%';
             circle.style.left = '86' + '%';
             progressing.style.background = '#bb8ef5';
             circle.style.background = '#bb8ef5';
             circle.style.borderColor = '#bb8ef5';
             hodnotenie.innerText = 'Veľmi zlá hodnota';
           }
 
           if (200 <= percent && percent < 400) {
             progressing.style.width = '61.5' + '%';
             circle.style.left = '61.5' + '%';
             progressing.style.background = '#ad4b4b';
             circle.style.background = '#ad4b4b';
             circle.style.borderColor = '#ad4b4b';
             hodnotenie.innerText = 'Zlá hodnota';
           }
 
           if (55 <= percent && percent < 200) {
             progressing.style.width = '39.5' + '%';
             circle.style.left = '39.5' + '%';
             progressing.style.background = '#ffbd59';
             circle.style.background = '#ffbd59';
             circle.style.borderColor = '#ffbd59';
             hodnotenie.innerText = 'Priemerná hodnota';
           }
           if (25 <= percent && percent < 55) {
             progressing.style.width = '22' + '%';
             circle.style.left = '22' + '%';
             progressing.style.background = '#d7e86b';
             circle.style.background = '#d7e86b';
             circle.style.borderColor = '#d7e86b';
             hodnotenie.innerText = 'Dobrá hodnota';
           }
           if (percent < 25) {
             progressing.style.width = '7' + '%';
             circle.style.left = '7' + '%';
             progressing.style.background = '#82d672';
             circle.style.background = '#82d672';
             circle.style.borderColor = '#82d672';
             hodnotenie.innerText = 'Výborná hodnota';
           }
          break;
          default:
           
          break;
      }
  }
