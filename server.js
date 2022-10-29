const randomUseragent = require('random-useragent')
const puppeteer=require('puppeteer')
const ExcelJS = require('exceljs');



const CriarExcel=(data)=>{

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Leyser Pinto';
    workbook.created = new Date();

    let dateHoje=new Date()

    const filename= 'Lista-'+dateHoje.getFullYear()+dateHoje.getMinutes()+'.xlsx'


    const sheet = workbook.addWorksheet('results')

    sheet.columns = [
        { header: 'id', key: 'id', width: 10 },
        { header: 'title', key: 'title', width: 100 },
        { header: 'views', key: 'views', width: 30},
        { header: 'href', key: 'href', width: 80},
        { header: 'image', key: 'image'}
      ]

      sheet.addRows(data)

      workbook.xlsx.writeFile(filename).then(e=>{
        console.log('archivo criado corretamente')
      }).catch(err=>{
        console.log('ERROR: ',err)
      })
}



const Init = async ()=>{
    const header=randomUseragent.getRandom((ua)=>{
        return ua.browserName === 'Firefox';
    }); // gets a random user agent string

    const browser = await puppeteer.launch();//Launch Browser
    const page = await browser.newPage();//Criar nova Guia

    await page.setUserAgent(header)//estabelecer o agente para meta dados da web

    await page.setViewport({width:1920, height:1080} )//estabelecer tamanho do pagina web

    await page.goto('https://www.youtube.com/feed/trending?bp=6gQJRkVleHBsb3Jl')// direçao de sitio web ao fazer scrapping0

    //await page.screenshot({path:'example.png'})//fazer uma captura de tela e salvar em diretório

    await page.waitForSelector('#contents')// esta linha e para verificar se o elemento foi carregado o DOM

    const ytdList = await page.$$('ytd-video-renderer')//pesquisar algum elemento dentro de DOM

    let i=0//variable para control de objectos dentro do DOM

    let data=[]
    for (const item of ytdList) {
        const title= await item.$('yt-formatted-string.ytd-video-renderer')//pesquisar um elemento especifico dentro do dom
        
        const viewNum= await item.$('span.ytd-video-meta-block')//pesquisar cantidade do vistas em o video
        
        const videoLink= await item.$('a')//pesquisar link(a) para obtener href
        const videoimg= await item.$('img')//pesquisar img da o video

        //Evaluñao do items
        const ObjName= await page.evaluate(title=> title.innerText, title)
        const ObjNum= await page.evaluate(viewNum=> viewNum.innerText, viewNum)
        const Objhref= await page.evaluate(videoLink=> videoLink.getAttribute('href'), videoLink)
        const Objimg= await page.evaluate(videoimg=> videoimg.getAttribute('src'), videoimg)


        // console.log(i+'-'+ObjName+' - ' +ObjNum)
        // console.log(Objhref)
        // console.log(Objimg)
        // console.log('---------------------')
        data.push({
            id:i+1,
            title:ObjName,
            views:ObjNum,
            href:'https://www.youtube.com'+Objhref,
            image:Objimg
        })
        
        if(i===9) {break} else {i++}
        
    }

    console.log(data)
    CriarExcel(data)
    await browser.close()//fechar o navegador virtual e cancelar todos os prossesos

    //ytd-shelf-renderer



}



Init();