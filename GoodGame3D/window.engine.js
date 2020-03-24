class windowTools{
    static ww;//window width
    static wh;//window height
    static initCanvas(width,height){
        document.getElementById("mainContainer").innerHTML=
        `<canvas style="border:1px solid black" width = "${width}" height = "${height}" id = "mainCanvas"></canvas>`;
        this.ww=width;
        this.wh=height;
    }
}