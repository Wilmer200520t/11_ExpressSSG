import express, { json } from 'express';
import fs from 'fs/promises';
import path from 'path';
import MarkdownIt from 'markdown-it';
import fm from "front-matter";
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import consolidate from 'consolidate';


const app= express();
var engine = consolidate; //para leer archivos html
const port= 3000 ; //si el proceso toen un enviaropmet port que tome es puete sino que agregue el port 3000
const __dirname = fileURLToPath(new URL(".", import.meta.url));
//dependencias 
app.use(morgan("dev"));

//formatos 
app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cookieParser());

//dependecias de vistas 
app.set("views",path.join(__dirname,"pages"));// ./pages 
app.set("view engine","pug"); // motor default de vistas 
app.engine('html', engine.mustache); //leer archivos html
//dependecias de archivos 
app.use(express.static(path.join(__dirname,"public")));// las vistas usaran solo estas carpetas 
//Rutas dinamicas desde archivos en la carpeta "pages"

const pageDir=path.join( __dirname,"pages");
const files=await fs.readdir(pageDir);//tae todos los archivos de ese directorio


//logica para archivos html y md
for (let file of files){
    const filePath=await path.join(pageDir,file); //direccion dek archivo
    let fileExt=path.extname(file); //extencion del archivo

    if(fileExt===".pug" || fileExt===".html" || fileExt===".md"){
        let fileName=path.basename(file,fileExt); //extrae el nombre del archivo 
        app.get(`/${fileName}`,async(req,res)=>{
            try {
                if(fileExt===".pug"){
                    res.render(fileName); //renderiza este archivo
                }
                if(fileExt===".html"){
                    res.sendFile(filePath); //envia el archivo desde una direcion
                }
                 if(fileExt===".md"){
                    //renderizacion del markdown
                    let fileContent=await fs.readFile(filePath, "utf-8"); //extrae el contenido en utf-8
                    let {attributes: frontMatterAttributes ,body}=fm(fileContent); //extrae la cabezera y el cuerpo del md 
                    let attributes=frontMatterAttributes;
                    let content= MarkdownIt().render(body);//renderiza el cuerpo a cod html
                    res.render("layout-markdown",{...attributes,content});
                }
                res.render(file);
            } catch (error) {
                res.status(404).render("error-404");
            }
        })
    }
}
//Ruta de la pagina principal
app.get("/",(req,res)=>{
    res.render("index");//default pug 
})
//Ruta error 404
app.use((req,res)=>{
    res.status(404).render("error-404");//default pug
})

app.listen(port,()=>{
    console.info(`Express App listening on link http://localhost:${port}`)
});