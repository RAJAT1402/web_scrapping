// Web Scrapping Project - By RAJAT GUPTA
// AIM - To find AQI Index of Most polluted and clean cites of diffrent Countries
// Site Scrapped -> www.iqair.com 
//         link  -> https://www.iqair.com/us/world-air-quality

let ch=require("cheerio");
let fs=require("fs");
let path = require("path");
let xlsx = require("xlsx");
let request = require("request");
const { count } = require("console");
request("https://www.iqair.com/us/world-air-quality",MainPage)
function MainPage(err,res,html){
        let STool = ch.load(html);                               // To Load Main Page Html File
        let worldUrl = STool("a.primary-button").attr("href");  //  To Find URL Of page  with Country data
        let fUrl = ("https://www.iqair.com"+worldUrl);          //  To Make a complete URL
request(fUrl,findData)                                         //   CallBack Function To get html page 
}

function findData(err,res,html){                                // Function to find each Country page URL
    if(err){
        console.log("error");
    }
    else{
     
        let STool = ch.load(html);                            // Loading HTML File
        let tableElem=STool("div.inner-table");               // Finding Table Element  
     
        let rowsOfATable = STool(tableElem).find("tbody tr"); // Finding rows of a table
      
        for(let i=0;i<rowsOfATable.length;i++){
       
                 let rCols=STool(rowsOfATable[i]).find("td");       // Finding Coulms of each row
                 let countryName = STool(rCols[1]).text().trim();   // Finding country name
                 countryName = countryName.toLowerCase();
     
                 let cfurl = "https://www.iqair.com/us/"+countryName;   // Unique URL for each country page
                  request(cfurl,findCountry)                            // Callback Function for each country page
                 // console.log(`Country-Name : ${countryName} Aqi2019 : ${aqi2019} Aqi2018 : ${aqi2018}  Population: ${population}`);
           }
        }
}

function findCountry(err,res,html){             // Function for finding each Country Data
    if(err){
        console.log("some error");
    }
    else{
    
       let STool = ch.load(html);               // Loading HTML File
       let tableE = STool(".ranking__table.ng-star-inserted").find("tbody tr"); // Finding Required Rows in page
        
        let isPolluted = true;                  // Initializing Variables
        let num=[];
        let cityName=[];
        let aqi=[];

        let country = STool(".top-nav__info").find("h1").attr("title");     // Finding Name for creating folders
      
        for(let j=0;j<tableE.length;j++){                                   // Loop for finding Data of each city

            let rCols=STool(tableE[j]).find("td");
          
             num[j] = STool(rCols[0]).text();
            cityName[j] = STool(rCols[1]).text();
             aqi[j] = STool(rCols[2]).text();
          
          if(((isPolluted)&&(num[j]!=num[j-1]))||(j==0)){
            // console.log("Country Name "+country+"   :  Sno.  "+num[j]+"  Polluted "+ cityName[j]);
               polluted(country,cityName[j],aqi[j]); 
          }
          if((!isPolluted)||(num[j]==num[j-1])){
            // console.log("Country Name "+country+" :  Sno.  "+num[j]+"  Clean "+ cityName[j]);
              clean(country,cityName[j],aqi[j]); 
          }

          if(((j>0) && (num[j]<num[j-1])) || (num[j]==num[j-1])){       // Condition for finding clean and polluted cities seperately
            isPolluted = false;
          }
          
        }
    }
}

function clean(country,city,aqi)        // Function to make .xlsx file for clean cities
 {
     let clean = "Clean cities";    
     let dirPath = country;
     let cAqiStats={
        cityName:city,
        AQi:aqi
     }

     if(fs.existsSync(dirPath)){
            // file check
            //console.log(" folder exists");
        }
         else{
                //create folder
                //create file
                 // add data
      fs.mkdirSync(dirPath);
         }
     
         let cityFilePath=path.join(dirPath,clean+".xlsx");
         let cData = [];
         if(fs.existsSync(cityFilePath))            // Condition for xlsx file check
         {      
                 cData=excelReader(cityFilePath,clean)
                 cData.push(cAqiStats);
         }
         else{
                //create file
                console.log("File of ",cityFilePath,"created");
                cData=[cAqiStats];
             }
                excelWriter(cityFilePath,cData,clean);
 }

 function polluted(country,city,aqi)        // Function for creating .xlsx file for polluted cities
 {
     let polluted = "Polluted Cities"
     let dirPath = country;
     let cAqiStats={
        cityName:city,
        AQi:aqi
     }
     if(fs.existsSync(dirPath)){
            // file check
            //console.log(" folder exists");
     }
     else{
            //create folder
            //create file
            // add data
            fs.mkdirSync(dirPath);
         }
            let cityFilePath=path.join(dirPath,polluted+".xlsx");
            let cData = [];
     
           if(fs.existsSync(cityFilePath))          // Conditon to .xlsx file check
            {      
                    cData=excelReader(cityFilePath,polluted)
                    cData.push(cAqiStats);
            }
            else{
                    //create file
                    console.log("File of ",cityFilePath,"created");
                    cData=[cAqiStats];
                }
                excelWriter(cityFilePath,cData,polluted);
 }

function excelReader(filePath,name){
        if(!fs.existsSync(filePath)){
                return null;
         }
         else{
                 // workbook =>excel
                let wt = xlsx.readFile(filePath);
                //get data from notebook
                let excelData = wt.Sheets[name];
                // convert excel format to json => array of obj
                let ans = xlsx.utils.sheet_to_json(excelData);
                return ans;
            }
}

function excelWriter(filePath,json,name){
  
          // console.log(xlsx.readFile(filePath));
          let newWB = xlsx.utils.book_new();
          //console.log(json);
          let newWS = xlsx.utils.json_to_sheet(json);
          xlsx.utils.book_append_sheet(newWB,newWS,name);
          // file => create , replace
          xlsx.writeFile(newWB,filePath);
}