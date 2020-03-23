class windowTools{

    static initCanvas(width,height){
        document.getElementById("mainContainer").innerHTML=
        `<canvas style="border:1px solid black" width = "${width}" height = "${height}" id = "mainCanvas"></canvas>`;
    }

}